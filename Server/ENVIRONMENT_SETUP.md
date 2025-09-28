# Environment Setup Guide

This guide explains how to set up the environment variables required for the VideoAI backend to run properly.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values**

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### 🔴 **CRITICAL - Must be configured**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/short_clip_maker` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` | ✅ Yes |

### 🟡 **IMPORTANT - For full functionality**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` | For S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | For S3 |
| `AWS_S3_BUCKET` | S3 bucket name | `videoai-storage` | For S3 |
| `AWS_REGION` | AWS region | `us-east-1` | For S3 |

### 🟢 **OPTIONAL - For enhanced features**

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `PORT` | Server port | `3000` | Server configuration |
| `NODE_ENV` | Environment | `development` | Environment mode |
| `JWT_EXPIRE` | Token expiration | `7d` | Authentication |

## Configuration Details

### Database Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
# Windows: Run as service

# Set in .env
MONGODB_URI=mongodb://localhost:27017/short_clip_maker
```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Set in `.env`:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/short_clip_maker
   ```

### AWS S3 Setup

#### Option 1: Use S3 (Recommended for production)
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Get access keys
5. Set in `.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

#### Option 2: Local Storage (Development only)
- Leave `AWS_S3_BUCKET` empty or unset
- Files will be stored in `./uploads/` directory

### JWT Configuration

Generate a strong JWT secret:
```bash
# Generate random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/short_clip_maker_dev
JWT_SECRET=dev-secret-key
# AWS_S3_BUCKET=  # Leave empty for local storage
```

### Production
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/short_clip_maker
JWT_SECRET=super-secure-production-secret
AWS_ACCESS_KEY_ID=prod-access-key
AWS_SECRET_ACCESS_KEY=prod-secret-key
AWS_S3_BUCKET=videoai-prod-storage
AWS_REGION=us-east-1
```

## Security Best Practices

### 🔒 **Never commit `.env` to version control**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### 🔒 **Use strong secrets in production**
- JWT_SECRET should be at least 32 characters
- Use different secrets for different environments
- Rotate secrets regularly

### 🔒 **Restrict AWS permissions**
- Create IAM user with minimal required permissions
- Use S3 bucket policies to restrict access
- Enable MFA for AWS account

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service or check connection string

#### 2. JWT Secret Missing
```
Error: secretOrPrivateKey must have a value
```
**Solution:** Set JWT_SECRET in .env file

#### 3. S3 Access Denied
```
Error: Access Denied
```
**Solution:** Check AWS credentials and bucket permissions

#### 4. Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:** Change PORT in .env or kill process using port 3000

### Verification Commands

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Verify environment variables
node -e "console.log(process.env.MONGODB_URI)"
```

## Support

If you encounter issues:
1. Check this guide first
2. Verify all required variables are set
3. Check server logs for specific error messages
4. Ensure all services (MongoDB, AWS) are accessible
