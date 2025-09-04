# 🚀 Deploy StacksPay to Google Cloud Run

This guide will help you deploy StacksPay to Google Cloud Run and make it publicly accessible.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed: https://cloud.google.com/sdk/docs/install
3. **MongoDB Atlas** account (recommended) or MongoDB instance
4. **Docker** installed (optional, Cloud Build handles this)

## Quick Deployment (5 minutes)

### Step 1: Setup Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# List your projects
gcloud projects list

# Create a new project (optional)
gcloud projects create stackspay-demo --name="StacksPay Demo"

# Set your project ID
export PROJECT_ID="your-project-id-here"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Add `0.0.0.0/0` to IP Access List (for demo purposes)
5. Get your connection string

### Step 3: Deploy Using Simple Script

```bash
# Set environment variables (REQUIRED)
export PROJECT_ID="your-gcp-project-id"
export MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>"

# Run deployment
./deploy-simple.sh
```

## Manual Deployment

### Backend Deployment

```bash
cd backend

# Deploy with Cloud Run
gcloud run deploy stackspay-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars "PORT=8080" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "MONGODB_URI=your-mongodb-connection-string" \
  --set-env-vars "JWT_SECRET=$(openssl rand -base64 32)" \
  --set-env-vars "WEBHOOK_SECRET=$(openssl rand -base64 32)" \
  --set-env-vars "STACKS_NETWORK=testnet" \
  --set-env-vars "BITCOIN_NETWORK=testnet"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe stackspay-backend --region=us-central1 --format="value(status.url)")
echo "Backend URL: $BACKEND_URL"
```

### Frontend Deployment

```bash
cd frontend

# Deploy frontend with backend URL
gcloud run deploy stackspay-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --set-env-vars "PORT=3000" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe stackspay-frontend --region=us-central1 --format="value(status.url)")
echo "Frontend URL: $FRONTEND_URL"
```

### Update CORS

```bash
# Update backend to allow frontend domain
gcloud run services update stackspay-backend \
  --region us-central1 \
  --update-env-vars "CORS_ORIGINS=$FRONTEND_URL"
```

## Environment Variables

### Required Backend Variables

```env
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=random-32-char-string
WEBHOOK_SECRET=random-32-char-string
STACKS_NETWORK=testnet
BITCOIN_NETWORK=testnet
CORS_ORIGINS=https://your-frontend-url.run.app
```

### Required Frontend Variables

```env
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

## Verification

### 1. Test Backend Health

```bash
curl https://your-backend-url.run.app/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-09-04T...",
  "database": "healthy"
}
```

### 2. Test Frontend

Visit your frontend URL in a browser. You should see the StacksPay dashboard.

### 3. Test API Docs

Visit: `https://your-backend-url.run.app/api-docs`

## Monitoring and Logs

### View Logs

```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stackspay-backend" --limit 50

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stackspay-frontend" --limit 50

# Real-time logs
gcloud logging tail "resource.type=cloud_run_revision"
```

### Monitor Performance

```bash
# List services
gcloud run services list

# Get service details
gcloud run services describe stackspay-backend --region=us-central1

# View metrics in Cloud Console
open "https://console.cloud.google.com/run"
```

## Custom Domain (Optional)

### 1. Map Custom Domain

```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service stackspay-frontend \
  --domain your-domain.com \
  --region us-central1
```

### 2. Update DNS

Follow the instructions provided by the domain mapping command to update your DNS records.

## Security Hardening

### 1. Restrict Access

```bash
# Remove public access (if needed)
gcloud run services remove-iam-policy-binding stackspay-backend \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-central1
```

### 2. Use Secret Manager

```bash
# Store secrets in Secret Manager
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Update service to use secrets
gcloud run services update stackspay-backend \
  --region us-central1 \
  --update-secrets JWT_SECRET=jwt-secret:latest
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Dockerfile syntax
   - Ensure all dependencies are in package.json
   - Check Cloud Build logs

2. **Database Connection Issues**

   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

3. **CORS Errors**

   - Verify CORS_ORIGINS environment variable
   - Ensure frontend URL is correctly set

4. **Port Issues**
   - Cloud Run requires PORT environment variable
   - Backend should listen on PORT (8080)
   - Frontend should listen on PORT (3000)

### Debug Commands

```bash
# Check service configuration
gcloud run services describe stackspay-backend --region=us-central1

# Test connectivity
curl -v https://your-backend-url.run.app/health

# Check environment variables
gcloud run services describe stackspay-backend --region=us-central1 --format="export"
```

## Cost Optimization

### 1. Set Resource Limits

```bash
# Update to smaller resources if needed
gcloud run services update stackspay-backend \
  --region us-central1 \
  --memory 512Mi \
  --cpu 0.5 \
  --concurrency 80 \
  --max-instances 5
```

### 2. Monitor Usage

- Use Cloud Monitoring for resource usage
- Set up billing alerts
- Monitor request volume and costs

## Success! 🎉

Your StacksPay application should now be publicly accessible:

- **Frontend**: https://stackspay-frontend-region-project.run.app
- **Backend API**: https://stackspay-backend-region-project.run.app
- **API Docs**: https://stackspay-backend-region-project.run.app/api-docs

## Next Steps

1. Test all payment flows
2. Set up monitoring and alerting
3. Configure custom domain
4. Add SSL certificates
5. Set up CI/CD pipeline
6. Scale based on usage

Your StacksPay is now live and ready for the world! 🚀
