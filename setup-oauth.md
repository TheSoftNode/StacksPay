# OAuth Setup Instructions

## Backend Dependencies
```bash
cd backend
npm install passport passport-google-oauth20 passport-github2 express-session
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/passport-github2
```

## Frontend Dependencies  
```bash
cd frontend
npm install @auth0/nextjs-auth0 next-auth
```

## Environment Variables Needed

### Backend (.env)
```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Session Secret
SESSION_SECRET=your_random_secret_key
```

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# Same OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id  
GITHUB_CLIENT_SECRET=your_github_client_secret
```