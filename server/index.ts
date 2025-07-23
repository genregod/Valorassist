// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import path from "path"; // Import the 'path' module
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check for required API keys
if (!process.env.OPENAI_API_KEY) {
  console.warn("OpenAI API key not found. AI features will be disabled.");
}

if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
  console.warn(
    "Azure Communication Services connection string not found. Chat features will be limited."
  );
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Logging Middleware (Unchanged) ---
app.use((req, res, next) => {
  // Your existing logging middleware is fine.
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(
        `[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    }
  });
  next();
});

(async () => {
  // --- Register all API routes FIRST ---
  const server = await registerRoutes(app);

  // --- Error Handling Middleware (Unchanged) ---
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err); // Fix: Use console.error to log the error
  });

  // --- Static File Serving Logic ---
  const isProduction = process.env.NODE_ENV === "production";
  // Fix: Move the `isProduction` definition up

  console.log(`Application starting in ${isProduction ? "Production" : "Development"} mode.`);

  if (isProduction) {
    // In production, serve the built static files from the 'dist/public' directory.
    const clientDistPath = path.resolve(process.cwd(), "dist/public");
    console.log(`Serving static files from: ${clientDistPath}`);

    // Serve static assets (JS, CSS, images, etc.)
    app.use(express.static(clientDistPath));

    // For any request that doesn't match an API route or a static file,
    // send back the main index.html. This is the "catch-all" route that
    // enables client-side routing to work.
    // THIS MUST BE REGISTERED *AFTER* ALL API ROUTES.
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(clientDistPath, "index.html"));
    });
  } else {
    // In development, use Vite to serve the client with hot-reloading.
    await setupVite(app, server);
  }

  // --- Start the Server ---
  const port = process.env.PORT || '8080'; // Azure App Service uses port 8080
  server.listen(
    {
      port: Number(port),
      host: "0.0.0.0",
    },
    () => {
      console.log(`Server listening on port ${port}`);
    }
  );
})();