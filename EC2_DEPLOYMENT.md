# EC2 Production Deployment Guide

Complete guide for deploying the Full Stack Backend API to AWS EC2.

## 📋 Prerequisites

- AWS Account with EC2 access
- Domain name (optional, for production SSL)
- SSH key pair for EC2 access

## 🚀 Quick Start

### 1. Launch EC2 Instance

1. **Go to EC2 Dashboard** → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS (HVM)
3. **Instance Type**: t3.medium (2 vCPU, 4GB RAM) or larger
4. **Storage**: 20GB gp3 SSD
5. **Security Group**:
   - SSH (22) - Source: Your IP
   - HTTP (80) - Source: 0.0.0.0/0
   - HTTPS (443) - Source: 0.0.0.0/0 (if using SSL)
6. **Key Pair**: Create or select existing

### 2. Initial Server Setup

```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git htop unzip software-properties-common

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 3. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group (logout and login again for changes to take effect)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 4. Deploy Application

```bash
# Clone your repository
git clone <your-repository-url> backend
cd backend

# Create production environment file
cp .env.prod .env
nano .env

# Edit with your production values:
# DB_PASS=your_secure_db_password
# JWT_ACCESS_SECRET=your_super_secret_access_key
# JWT_REFRESH_SECRET=your_super_secret_refresh_key
# CORS_ORIGIN=https://yourdomain.com (or http://your-ec2-ip)

# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh prod up
```

### 5. Verify Deployment

```bash
# Check running containers
docker ps

# Check API health
curl http://localhost/health

# Check logs if needed
./deploy.sh prod logs
```

## 🔧 Detailed Configuration

### Environment Variables

Create `.env` file with production values:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fullstack_app
DB_USER=postgres
DB_PASS=your_secure_production_password

# JWT Security
JWT_ACCESS_SECRET=your_super_secret_production_access_key_here_minimum_32_chars
JWT_REFRESH_SECRET=your_super_secret_production_refresh_key_here_minimum_32_chars

# Server
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Features
ENABLE_SWAGGER=false

# Nginx
HTTP_PORT=80
HTTPS_PORT=443
```

### SSL Certificate Setup

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot
   ```

2. **Get SSL Certificate**:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Update Nginx Config**:
   Edit `nginx/backend.conf` to enable SSL:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # ... rest of your config
   }
   ```

4. **Setup Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🗄️ Database Management

### PgAdmin Setup (Development Only)

If you're running the development environment locally, PgAdmin is included for database management:

1. **Access**: `http://localhost:5050`
2. **Login**: `admin@example.com` / `admin123`
3. **Add Server**:
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database**: `fullstack_app`
   - **Username**: `postgres`
   - **Password**: `dev_password`

### Direct PostgreSQL Access

For production or direct access, connect using:
- **Host**: `localhost` (or your server IP)
- **Port**: `5432`
- **Database**: `fullstack_app`
- **Username**: `postgres`
- **Password**: Your configured password

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# API Health
curl http://localhost/health

# Container Health
docker ps
docker stats

# Logs
./deploy.sh prod logs
docker logs fullstack_backend_prod
docker logs fullstack_nginx_prod
```

### Backup Strategy

```bash
# Database Backup
docker exec fullstack_postgres_prod pg_dump -U postgres fullstack_app > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3 (if configured)
aws s3 cp backup.sql s3://your-backup-bucket/
```

### Updates & Rollbacks

```bash
# Update application
cd backend
git pull origin main
./deploy.sh prod restart

# Rollback if needed
git checkout previous-commit-hash
./deploy.sh prod restart
```

## 🔒 Security Best Practices

### Server Security

1. **SSH Hardening**:
   ```bash
   # Disable password authentication
   sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart ssh

   # Use non-standard SSH port (optional)
   sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
   ```

2. **Fail2Ban**:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

### Application Security

1. **Environment Variables**: Never commit secrets
2. **Regular Updates**: Keep dependencies updated
3. **Firewall**: Only expose necessary ports
4. **SSL/TLS**: Always use HTTPS in production

## 🚨 Troubleshooting

### Common Issues

1. **Port 80/443 Already in Use**:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   # Kill conflicting processes
   ```

2. **Database Connection Failed**:
   ```bash
   docker logs fullstack_postgres_prod
   # Check if container is running
   docker ps | grep postgres
   ```

3. **SSL Certificate Issues**:
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Out of Memory**:
   ```bash
   docker stats
   # Increase instance size or optimize memory usage
   ```

### Logs & Debugging

```bash
# Application logs
docker logs fullstack_backend_prod -f

# Nginx access logs
docker logs fullstack_nginx_prod -f

# System logs
sudo journalctl -u docker -f

# Check resource usage
htop
df -h
free -h
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_expires_active ON refresh_tokens(expires_at) WHERE revoked = false;
```

### Nginx Optimization

```nginx
# Add to nginx/backend.conf
worker_processes auto;
worker_rlimit_nofile 1024;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}
```

### Monitoring Setup

1. **CloudWatch Integration**:
   ```bash
   # Install CloudWatch agent
   wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
   sudo dpkg -i amazon-cloudwatch-agent.deb
   ```

2. **Application Metrics**:
   - Health check endpoint
   - Error rates
   - Response times
   - Database connections

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to EC2
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /home/ubuntu/backend
          git pull origin main
          ./deploy.sh prod restart
```

## 📞 Support

For issues:
1. Check container logs: `docker logs <container_name>`
2. Verify environment variables
3. Test locally first: `./deploy.sh dev up`
4. Check AWS service status
5. Review security groups and network ACLs

## 📋 Checklist

- [ ] EC2 instance launched with correct security group
- [ ] SSH access configured
- [ ] Docker and Docker Compose installed
- [ ] Application cloned and configured
- [ ] Environment variables set
- [ ] SSL certificate configured (optional)
- [ ] Health checks passing
- [ ] Domain DNS configured (if using custom domain)
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
