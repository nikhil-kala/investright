# InvestRight Deployment Guide

This guide will help you deploy your InvestRight React application to a Node.js server.

## Prerequisites

- Node.js server with Node.js 16+ installed
- Git access to your repository
- Domain name (optional but recommended)
- SSL certificate (recommended for production)

## Step 1: Build the Production Version

First, build your React application for production:

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 2: Server Setup

### Option A: Simple Static File Serving

Create a simple Node.js server to serve your React app:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
```

### Option B: Production-Ready Server with PM2

For production environments, use PM2 for process management:

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'investright',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
```

## Step 3: Deploy to Server

### Method 1: Manual Deployment

1. **Upload files to server:**
   ```bash
   # On your local machine
   scp -r dist/* user@your-server:/path/to/app/
   scp server.js user@your-server:/path/to/app/
   scp package.json user@your-server:/path/to/app/
   ```

2. **Install dependencies on server:**
   ```bash
   # On your server
   cd /path/to/app
   npm install --production
   ```

3. **Start the server:**
   ```bash
   # Simple start
   node server.js
   
   # Or with PM2
   pm2 start ecosystem.config.js --env production
   ```

### Method 2: Git-based Deployment

1. **Set up deployment script on server:**
   ```bash
   #!/bin/bash
   # deploy.sh
   cd /path/to/app
   git pull origin main
   npm install --production
   npm run build
   pm2 restart investright
   ```

2. **Make it executable:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run deployment:**
   ```bash
   ./deploy.sh
   ```

## Step 4: Environment Configuration

### Create Production Environment File

On your server, create a `.env` file:

```bash
# .env
NODE_ENV=production
PORT=3000
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### Update package.json

Add a start script to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 5: Nginx Configuration (Recommended)

For production, use Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/investright
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/investright /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: SSL Certificate (Let's Encrypt)

Install Certbot and get free SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Process Management

### Using PM2 (Recommended)

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Monitor the application
pm2 monit

# View logs
pm2 logs investright

# Restart the application
pm2 restart investright

# Stop the application
pm2 stop investright

# Set PM2 to start on boot
pm2 startup
pm2 save
```

### Using Systemd

Create a service file:

```bash
sudo nano /etc/systemd/system/investright.service
```

Add this content:
```ini
[Unit]
Description=InvestRight React App
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable investright
sudo systemctl start investright
sudo systemctl status investright
```

## Step 8: Monitoring and Logs

### Application Logs
```bash
# PM2 logs
pm2 logs investright

# Systemd logs
sudo journalctl -u investright -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
```bash
# Install monitoring tools
npm install -g clinic

# Profile your app
clinic doctor -- node server.js
```

## Step 9: Backup and Maintenance

### Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/investright"
APP_DIR="/path/to/your/app"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/investright_$DATE.tar.gz $APP_DIR

# Keep only last 7 backups
find $BACKUP_DIR -name "investright_*.tar.gz" -mtime +7 -delete
```

### Update Process
```bash
#!/bin/bash
# update.sh
cd /path/to/your/app
git pull origin main
npm install --production
npm run build
pm2 restart investright
```

## Step 10: Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

3. **Environment Variables:**
   - Never commit `.env` files to Git
   - Use strong, unique API keys
   - Rotate keys regularly

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/your/app
   ```

3. **Build fails:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Health Check Endpoint

Add this to your server.js for monitoring:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## Deployment Checklist

- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Server dependencies installed
- [ ] Application started successfully
- [ ] Nginx configured (if using)
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Domain pointing to server
- [ ] Application accessible via browser

## Support

If you encounter issues during deployment:

1. Check the logs: `pm2 logs investright`
2. Verify environment variables
3. Check server resources: `htop`, `df -h`
4. Test locally first
5. Review this guide step by step

Your InvestRight application should now be successfully deployed and accessible on your server!
