# Full Stack Backend API

A production-ready backend API built with Express.js, PostgreSQL, and JWT authentication. Features include user registration, authentication, profile management, and secure API endpoints.

## 🚀 Features

- **JWT Authentication**: Access tokens + refresh tokens for secure authentication
- **User Management**: Registration, login, profile management, password changes
- **PostgreSQL Database**: Robust data persistence with proper indexing
- **Security**: Helmet, CORS, rate limiting, input validation
- **Docker Support**: Production-ready containerization
- **Nginx Proxy**: Load balancing and static file serving
- **Logging**: Winston-based logging with file and console output
- **Health Checks**: Built-in health monitoring

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose v2 (recommended) or v1 (for containerized deployment)

## 🛠️ Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullstack_app
DB_USER=postgres
DB_PASS=your_password

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Database Setup

Start PostgreSQL and run the database initialization:

```bash
# Initialize database
npm run db:init

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Swagger UI
The API documentation is available via Swagger UI at `/docs` when running in development mode.

**Development**: `http://localhost:3001/docs`
**Production**: Disabled by default (set `ENABLE_SWAGGER=true` to enable)

### API Documentation Files
- **YAML**: `docs/api.yaml`
- **JSON**: `docs/api.json`

Generate updated documentation:
```bash
npm run docs:generate
```

## 🐳 Docker Deployment

### Environment-Based Deployment

This project supports two deployment environments and is compatible with **Docker Compose v2** (plugin) and v1.

#### Development Environment
Includes PgAdmin for database management and Swagger UI for API documentation.

```bash
# Using Makefile (recommended)
make dev

# Or using deploy script
./deploy.sh dev up

# Other actions
make down        # Stop services
make restart     # Restart services
make logs        # View logs
make clean       # Remove containers and volumes
```

**Development Services:**
- **API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/docs`
- **PgAdmin**: `http://localhost:5050` (admin@example.com / admin123)
- **PostgreSQL**: `localhost:5432` (direct connection)
- **Health Check**: `http://localhost:3001/health`

#### Production Environment
Optimized for production with security hardening and resource limits.

```bash
# Deploy production environment
make prod

# Or using deploy script
./deploy.sh prod up
```

**Production Services:**
- **API**: `http://localhost` (through Nginx)
- **Health Check**: `http://localhost/health`

### Accessing PgAdmin (Database GUI)

After starting the development environment, you can access your PostgreSQL database through PgAdmin:

#### **Step 1: Open PgAdmin**
Navigate to: `http://localhost:5050`

#### **Step 2: Login to PgAdmin**
- **Email**: `admin@example.com`
- **Password**: `admin123`

#### **Step 3: Add Database Server**
1. Right-click **"Servers"** in the left sidebar
2. Select **"Create"** → **"Server"**
3. **General Tab:**
   - **Name**: `FullStack Dev Database` (choose any name)
4. **Connection Tab:**
   - **Host name/address**: `postgres`
   - **Port**: `5432`
   - **Maintenance database**: `fullstack_app`
   - **Username**: `postgres`
   - **Password**: `dev_password`
5. Click **"Save"**

#### **Database Contents**
Once connected, you'll see:
- **`fullstack_app`** database
- **Tables**: `users`, `user_profiles`, `refresh_tokens`
- **Demo Data**: Pre-seeded test users

#### **Demo Users**
- **demo@example.com** / **DemoPass123!**
- **john.doe@example.com** / **TestPass123!**
- **jane.smith@example.com** / **TestPass123!**
- **admin@example.com** / **TestPass123!**

### Manual Docker Commands

```bash
# Docker Compose v2 (recommended)
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f

# Docker Compose v1 (legacy)
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
```

### Services

- **PostgreSQL**: Database on port 5432
- **Backend API**: Express server on port 3001
- **Nginx**: Reverse proxy on port 80

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt_access_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": null,
    "avatarUrl": null,
    "emailVerified": true
  },
  "accessToken": "jwt_access_token"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=jwt_refresh_token
```

#### Logout
```http
POST /api/auth/logout
Cookie: refreshToken=jwt_refresh_token
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_access_token
```

### User Management Endpoints

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Software developer",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  }
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Delete Account
```http
DELETE /api/users/account
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "password": "currentpassword"
}
```

#### Get User Profile
```http
GET /api/users/:userId
Authorization: Bearer jwt_access_token
```

#### Search Users
```http
GET /api/users/search?q=john&limit=10&offset=0
Authorization: Bearer jwt_access_token
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting with Redis-style zones
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Request validation and sanitization
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content security policy headers

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    address JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT false,
    UNIQUE(token_hash)
);
```

## 🚀 Production Deployment

### EC2 with Docker

1. **Launch EC2 Instance**:
   ```bash
   # Ubuntu 22.04 LTS recommended
   # t3.medium or larger for production
   ```

2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

3. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

4. **Configure Environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

5. **Deploy with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

6. **Setup SSL (Optional)**:
   ```bash
   # Install certbot for Let's Encrypt
   sudo apt install certbot
   sudo certbot certonly --standalone -d api.yourdomain.com
   ```

## 📚 Frontend Integration

For frontend developers integrating with this API, see the comprehensive integration guide:

📖 **[Frontend Integration Guide](frontend_integration_guide.md)**

This guide includes:
- Complete API endpoint documentation
- Authentication flow implementation
- Request/response examples
- Code samples for React/Vue/Angular
- Error handling strategies
- Best practices and troubleshooting

### Environment Variables for Production

Create `.env.prod` file with production values:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fullstack_app
DB_USER=postgres
DB_PASS=your_secure_production_password

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_production_access_key_here
JWT_REFRESH_SECRET=your_super_secret_production_refresh_key_here

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Disable Swagger in production
ENABLE_SWAGGER=false

# Nginx ports
HTTP_PORT=80
HTTPS_PORT=443
```

## ☁️ EC2 Production Deployment

### Prerequisites
- AWS EC2 instance (Ubuntu 22.04 LTS, t3.medium or larger)
- Security group with ports 22, 80, 443 open
- Domain name (optional, for SSL)

### Step 1: Launch EC2 Instance

```bash
# Choose Ubuntu 22.04 LTS
# Instance type: t3.medium or larger
# Storage: 20GB gp3
# Security group: SSH (22), HTTP (80), HTTPS (443)
```

### Step 2: Initial Server Setup

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git htop ufw

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone <your-repo-url> backend
cd backend

# Create production environment file
cp .env.prod .env
nano .env  # Edit with your production values

# Make deploy script executable
chmod +x deploy.sh

# Deploy production environment
./deploy.sh prod up
```

### Step 4: SSL Configuration (Optional)

```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com

# Update Nginx configuration to use SSL
# Edit nginx/backend.conf to include SSL configuration
# Then restart services
./deploy.sh prod restart
```

### Step 5: Monitoring & Maintenance

```bash
# View logs
./deploy.sh prod logs

# Check service status
docker ps

# Update deployment
git pull origin main
./deploy.sh prod restart

# Backup database (if needed)
docker exec -t fullstack_postgres_prod pg_dump -U postgres fullstack_app > backup.sql
```

### Step 6: Production URLs

- **API**: `http://your-ec2-ip` or `https://yourdomain.com`
- **Health Check**: `http://your-ec2-ip/health` or `https://yourdomain.com/health`

### Troubleshooting

```bash
# Check container logs
docker logs fullstack_backend_prod
docker logs fullstack_nginx_prod

# Check resource usage
docker stats

# Restart services
./deploy.sh prod restart

# Clean restart
./deploy.sh prod down
./deploy.sh prod up
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Database
npm run db:init     # Initialize database
npm run db:seed     # Seed with demo data

# Documentation
npm run docs:generate # Generate Swagger YAML/JSON docs

# Utilities
npm run lint        # Run ESLint
```

## 🔍 Monitoring & Logging

- **Health Checks**: `/health` endpoint for load balancer monitoring
- **Logs**: Winston logging to console and files
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Rate Limiting**: Protection against abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
- Check the logs in `./logs/` directory
- Review the health check endpoint
- Ensure all environment variables are set correctly

## 📋 Demo Credentials

After running `npm run db:seed`, you can use these credentials:

- **Email**: `demo@example.com`
- **Password**: `DemoPass123!`

Additional test users are also created with password `TestPass123!`.
