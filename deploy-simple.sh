#!/bin/bash

# Simple StacksPay Deployment to Cloud Run
# Set these variables before running:

# 🔧 CONFIGURATION - UPDATE THESE VALUES
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/sbtc_payment_gateway"

# 🚀 DEPLOYMENT COMMANDS

echo "🔧 Setting up project..."
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

echo "🏗️ Deploying Backend..."
cd backend
gcloud run deploy stackspay-backend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars "PORT=8080,NODE_ENV=production,MONGODB_URI=$MONGODB_URI,JWT_SECRET=$(openssl rand -base64 32),WEBHOOK_SECRET=$(openssl rand -base64 32),STACKS_NETWORK=testnet,BITCOIN_NETWORK=testnet"

# Get backend URL
BACKEND_URL=$(gcloud run services describe stackspay-backend --region=$REGION --format="value(status.url)")
echo "✅ Backend deployed at: $BACKEND_URL"

echo "🎨 Deploying Frontend..."
cd ../frontend

# Update environment for build
export NEXT_PUBLIC_API_URL=$BACKEND_URL

gcloud run deploy stackspay-frontend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --set-env-vars "PORT=3000,NODE_ENV=production,NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe stackspay-frontend --region=$REGION --format="value(status.url)")
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo "🔄 Updating backend CORS..."
gcloud run services update stackspay-backend \
  --region $REGION \
  --update-env-vars "CORS_ORIGINS=$FRONTEND_URL"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api-docs"
