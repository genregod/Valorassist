import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { pool } from "./db";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";

// Extend Express.User interface
declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt with salt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a plaintext password against a stored hashed password
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Setup authentication for the Express app
 */
export function setupAuth(app: Express): void {
  // Set up session store with PostgreSQL
  const PostgresSessionStore = connectPg(session);
  
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "valor-assist-dev-secret";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
    },
    store: new PostgresSessionStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
  };
  
  // Enable session support
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Passport to use a local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid username" });
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid password" });
        }
        
        // Update last login time
        await storage.updateUserLastLogin(user.id);
        
        // Log the login
        await storage.createAuditLog({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id.toString(),
          ip: "0.0.0.0", // This should be replaced with the actual IP in the request handler
          userAgent: "Unknown", // This should be replaced with the actual user agent in the request handler
          details: { method: "local" },
        });
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Configure Passport serialization methods
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication routes
  
  // User registration
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create the user
      const userData: InsertUser = {
        ...req.body,
        password: hashedPassword,
      };
      
      const user = await storage.createUser(userData);
      
      // Create audit log for registration
      await storage.createAuditLog({
        userId: user.id,
        action: "register",
        resourceType: "user",
        resourceId: user.id.toString(),
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { method: "local" },
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return the user (excluding password)
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  
  // User login
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error, user: User, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create login audit log
        storage.createAuditLog({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id.toString(),
          ip: req.ip || "0.0.0.0",
          userAgent: req.get("User-Agent") || "Unknown",
          details: { method: "local" },
        }).catch(console.error);
        
        // Return the user (excluding password)
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  // User logout
  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    req.logout((err) => {
      if (err) return next(err);
      
      // Create logout audit log if user was logged in
      if (userId) {
        storage.createAuditLog({
          userId,
          action: "logout",
          resourceType: "user",
          resourceId: userId.toString(),
          ip: req.ip || "0.0.0.0",
          userAgent: req.get("User-Agent") || "Unknown",
          details: { method: "local" },
        }).catch(console.error);
      }
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        return res.status(200).json({ success: true });
      });
    });
  });
  
  // Get current user
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Return the user (excluding password)
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
  
  // Middleware to check if user is authenticated
  app.use("/api/protected/*", (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  });
}