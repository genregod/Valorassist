module.exports = {
  apps: [{
    name: 'valor-assist',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 8080
    },
    error_file: '/home/LogFiles/pm2-error.log',
    out_file: '/home/LogFiles/pm2-out.log',
    log_file: '/home/LogFiles/pm2-combined.log',
    time: true
  }]
};