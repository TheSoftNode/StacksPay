# Deploying StacksPay Backend to Google Cloud Platform

This guide covers deploying your StacksPay backend to GCP with MongoDB.

## Prerequisites

- Google Cloud SDK installed
- GCP project created
- MongoDB Atlas account (recommended) or MongoDB on GCP

## Option 1: MongoDB Atlas (Recommended)

### Step 1: Setup MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create database user with read/write permissions
4. Add your application to IP Access List (use 0.0.0.0/0 for development)
5. Get connection string

### Step 2: Prepare Your App

```bash
# Build your application
cd backend
npm run build

# Create app.yaml for App Engine
cat > app.yaml << EOF
runtime: nodejs18

env_variables:
  MONGODB_URI: "your-mongodb-atlas-connection-string"
  JWT_SECRET: "your-jwt-secret"
  STACKS_NETWORK: "testnet"
  BITCOIN_NETWORK: "testnet"
  NODE_ENV: "production"

automatic_scaling:
  min_instances: 1
  max_instances: 10
EOF
```

### Step 3: Deploy to App Engine

```bash
# Initialize gcloud
gcloud init

# Deploy application
gcloud app deploy

# View logs
gcloud app logs tail -s default
```

## Option 2: Cloud Run (Alternative)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/index.js"]
```

### Step 2: Build and Deploy

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/stackspay-backend

# Deploy to Cloud Run
gcloud run deploy stackspay-backend \
  --image gcr.io/PROJECT_ID/stackspay-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="your-connection-string"
```

## Environment Variables for Production

### Required Environment Variables

```env
# Database (REQUIRED - Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# Security (REQUIRED - Generate secure random values)
JWT_SECRET=your-secure-jwt-secret-key

# Networks
STACKS_NETWORK=testnet  # or mainnet
BITCOIN_NETWORK=testnet  # or mainnet

# Application
NODE_ENV=production
PORT=8080

# Optional: Redis for sessions (if using)
REDIS_URL=redis://your-redis-instance
```

## MongoDB Atlas Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Verification Steps

### 1. Check Health Endpoint

```bash
curl https://your-app-url.com/health
```

### 2. Test Database Connection

```bash
curl https://your-app-url.com/api/health
```

### 3. Monitor Logs

```bash
gcloud app logs tail -s default
# or for Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

## Performance Considerations

### MongoDB Atlas

- Use MongoDB 4.4+ for better performance
- Enable connection pooling (already configured)
- Use read/write concern majority (already configured)

### GCP Configuration

- Use appropriate instance sizes
- Configure auto-scaling based on traffic
- Set up health checks and monitoring

## Security Best Practices

### 1. Network Security

- Use VPC for internal communication
- Restrict MongoDB access to GCP IPs only
- Use Cloud Armor for DDoS protection

### 2. Environment Variables

- Use Secret Manager for sensitive data
- Never commit secrets to repository
- Rotate keys regularly

### 3. Monitoring

- Enable Cloud Monitoring
- Set up alerting for errors
- Monitor database performance

## Cost Optimization

### MongoDB Atlas

- Start with free tier (512MB)
- Upgrade based on usage
- Use connection pooling to reduce connections

### GCP

- Use preemptible instances for development
- Set up budget alerts
- Monitor resource usage

## Troubleshooting

### Common Issues

1. **Connection timeout**: Check IP whitelist in Atlas
2. **Authentication failed**: Verify username/password
3. **Database not found**: Ensure database name is correct
4. **SSL errors**: Use `ssl=true` in connection string

### Debug Commands

```bash
# Check environment variables
gcloud app versions describe VERSION_ID --service=default

# View detailed logs
gcloud app logs read --service=default --version=VERSION_ID

# SSH into instance (Compute Engine only)
gcloud compute ssh INSTANCE_NAME
```

## Production Checklist

- [ ] MongoDB Atlas cluster configured
- [ ] Connection string updated in environment variables
- [ ] SSL/TLS enabled for database connections
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Security rules and firewalls configured
- [ ] Health checks working
- [ ] Auto-scaling configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active

## Next Steps

1. Deploy to staging environment first
2. Run end-to-end tests
3. Configure domain and SSL certificates
4. Set up CI/CD pipeline
5. Monitor performance and optimize as needed

---

Your StacksPay backend is designed to work seamlessly with MongoDB Atlas on GCP! 🚀
