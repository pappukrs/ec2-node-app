# FullStack App - Frontend

A modern, production-ready Next.js frontend application with JWT authentication, featuring secure token management, protected routes, and Docker deployment for EC2.

## 🚀 Features

- **JWT Authentication**: Secure access and refresh token management
- **Protected Routes**: Automatic redirects and middleware protection
- **Modern UI**: Responsive design with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript implementation
- **API Integration**: Axios-based API client with automatic token refresh
- **Docker Deployment**: Production-ready containerization
- **Nginx Proxy**: Optimized reverse proxy configuration
- **Security**: Rate limiting, security headers, and best practices

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- AWS EC2 instance (for deployment)

## 🛠️ Local Development

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=FullStack App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=300000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🐳 Docker Deployment

### Build and Run Locally

1. Build the Docker image:
```bash
docker build -t pappukrs/fullstack-frontend .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

### EC2 Deployment Steps

#### 1. Prepare Your EC2 Instance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

#### 2. Deploy the Application

```bash
# Clone your repository (replace with your actual repo)
git clone https://github.com/yourusername/your-repo.git
cd your-repo/frontend

# Create production environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=FullStack App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=300000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
EOF

# Build and run the application
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Configure Nginx (if using external Nginx)

If you're not using the Docker Nginx container, configure your EC2 Nginx:

```bash
# Install Nginx on EC2
sudo apt install nginx -y

# Copy nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Configuration (Production)

```bash
# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard page
│   ├── login/                   # Login page
│   ├── profile/                 # Profile page
│   ├── register/                # Register page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── ui/                     # Reusable UI components
│   └── Navigation.tsx
├── lib/                        # Utility libraries
│   ├── api/                    # API client and services
│   ├── auth/                   # Authentication utilities
│   └── config.ts               # Application configuration
├── nginx/                      # Nginx configuration
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
└── README.md
```

## 🔐 Authentication Flow

1. **Login**: User submits credentials → API returns access & refresh tokens
2. **Token Storage**: Tokens stored securely in HTTP-only cookies
3. **API Calls**: Automatic token attachment and refresh
4. **Token Refresh**: Automatic renewal before expiration
5. **Logout**: Clear tokens and redirect to login

### Protected Routes

- `/dashboard` - Main dashboard (requires authentication)
- `/profile` - User profile management (requires authentication)
- `/login` - Login page (redirects if authenticated)
- `/register` - Registration page (redirects if authenticated)

## 🔧 API Integration

The application expects a backend API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Expected Response Formats

```typescript
// Auth Response
{
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
}
```

## 🔒 Security Features

- **JWT Tokens**: Secure token-based authentication
- **HTTP-only Cookies**: XSS protection for tokens
- **Automatic Token Refresh**: Seamless user experience
- **Rate Limiting**: DDoS protection via Nginx
- **Security Headers**: XSS, CSRF, and content protection
- **Input Validation**: Zod schema validation
- **Type Safety**: Full TypeScript coverage

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```
GET /health
```

### Docker Health Checks
- Application health check every 30 seconds
- Automatic container restart on failure
- Nginx proxy health monitoring

### Logs
```bash
# View application logs
docker-compose logs -f app

# View Nginx logs
docker-compose logs -f nginx

# View all logs
docker-compose logs -f
```

## 🚀 Performance Optimization

- **Next.js Standalone**: Optimized Docker builds
- **Static Asset Caching**: 1-year cache for static files
- **Gzip Compression**: Automatic response compression
- **Image Optimization**: WebP/AVIF format support
- **Code Splitting**: Automatic route-based splitting

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
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /path/to/your/app
          git pull origin main
          docker-compose down
          docker-compose up -d --build
```

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start**
```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

2. **Nginx 502 errors**
```bash
# Check if app container is running
docker-compose ps

# Check app health
curl http://localhost:3000/api/health
```

3. **Authentication issues**
```bash
# Clear browser cookies
# Check API_BASE_URL in environment
# Verify backend API is running
```

### Useful Commands

```bash
# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View resource usage
docker stats

# Clean up unused images
docker image prune -f
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `10000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `FullStack App` |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD` | Token refresh threshold (ms) | `300000` |
| `NEXT_PUBLIC_MAX_RETRY_ATTEMPTS` | Max API retry attempts | `3` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Note**: This frontend application is designed to work with a corresponding backend API. Make sure your backend implements the required authentication endpoints as specified in the API Integration section.
