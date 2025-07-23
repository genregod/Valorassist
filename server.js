// Azure entry point with comprehensive debugging - ES module version
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Debugging logs
console.log('=== SERVER.JS STARTUP DEBUG ===');
console.log('Current directory:', __dirname);
console.log('Process directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 8080);
console.log('Node version:', process.version);

// List directory contents
try {
  console.log('\nDirectory contents:');
  fs.readdirSync(__dirname).forEach(file => {
    console.log(' -', file);
  });
  
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('\nDist directory contents:');
    fs.readdirSync(path.join(__dirname, 'dist')).forEach(file => {
      console.log(' -', file);
    });
  }
  
  if (fs.existsSync(path.join(__dirname, 'dist/public'))) {
    console.log('\nDist/public directory contents:');
    fs.readdirSync(path.join(__dirname, 'dist/public')).forEach(file => {
      console.log(' -', file);
    });
  }
} catch (err) {
  console.error('Error reading directory:', err);
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV
  });
});

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist/public');
console.log('\nServing static files from:', staticPath);
app.use(express.static(staticPath));

// API routes would go here
// For now, just serve the React app for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/public', 'index.html');
  console.log('Serving index.html from:', indexPath);
  
  if (!fs.existsSync(indexPath)) {
    console.error('ERROR: index.html not found at:', indexPath);
    res.status(404).send('index.html not found. Build may have failed.');
    return;
  }
  
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== SERVER STARTED SUCCESSFULLY ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/health`);
});