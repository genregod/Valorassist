const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('=== Valor Assist Server Starting ===');
console.log('Node.js version:', process.version);
console.log('Working directory:', process.cwd());
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

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
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// API health endpoint for Azure monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'valor-assist',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV
  });
});

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist/public');
console.log('Serving static files from:', staticPath);

// Check if the static directory exists
if (!fs.existsSync(staticPath)) {
  console.error('ERROR: Static files directory not found at:', staticPath);
  console.log('Available directories:');
  try {
    const dirs = fs.readdirSync(__dirname);
    dirs.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        console.log(`  - ${dir}/`);
      }
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
} else {
  console.log('✓ Static files directory found');
  app.use(express.static(staticPath));
}

// Fallback route - serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  console.log('Serving index.html from:', indexPath);
  
  if (!fs.existsSync(indexPath)) {
    console.error('ERROR: index.html not found at:', indexPath);
    return res.status(500).send(`
      <h1>Server Error</h1>
      <p>index.html not found at: ${indexPath}</p>
      <p>Please ensure the application was built correctly.</p>
    `);
  }
  
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Valor Assist server is running on port ${PORT}`);
  console.log(`✓ Server URL: http://localhost:${PORT}`);
  console.log('=== Server Started Successfully ===');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
