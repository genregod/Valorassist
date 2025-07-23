// Azure entry point - simplified to avoid vite dependencies
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// API routes would go here
// For now, just serve the React app for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});