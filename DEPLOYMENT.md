# 🚀 Deployment Guide

Complete guide for deploying the AWS SAP-C02 Exam Prep Platform with server-side user management.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Upstash account (for Redis database)

## 🗄️ Database Setup (Upstash Redis)

### **Step 1: Create Upstash Redis Database**
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Choose your preferred region
4. Copy the REST API credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### **Step 2: Note Your Credentials**
```env
KV_REST_API_URL=https://your-redis-url.upstash.io
KV_REST_API_TOKEN=your-redis-token
JWT_SECRET=your-secure-jwt-secret-key
```

## 🌐 Vercel Deployment

### **Step 1: Connect Repository**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `aws-sap-c02-exam-app`

### **Step 2: Configure Environment Variables**
In Vercel project settings, add these environment variables:

```env
# Required: Upstash Redis
KV_REST_API_URL=https://your-redis-url.upstash.io
KV_REST_API_TOKEN=your-redis-token

# Required: JWT Authentication
JWT_SECRET=your-secure-random-string-min-32-chars

# Optional: Fallback Redis variables
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### **Step 3: Deploy**
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app.vercel.app`

## ✅ Post-Deployment Verification

### **Test User Registration**
1. Visit your deployed app
2. Click "Sign up here"
3. Create a test account
4. Verify successful login and dashboard access

### **Test Admin Panel**
1. Go to `/admin`
2. Login with:
   - Username: `admin`
   - Password: `nimda`
3. Verify user list displays

### **Test API Endpoints**
```bash
# Test registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"TestPass123!","confirmPassword":"TestPass123!"}'

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

## 🔧 Configuration Options

### **User Limits**
- Default: 20 users maximum
- Modify in `lib/db.js` if needed
- Enforced server-side

### **JWT Token Expiration**
- Default: 7 days
- Modify in `lib/db.js`:
```javascript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
```

### **Admin Credentials**
- Default: admin/nimda
- Modify in `lib/db.js`:
```javascript
if (username === 'admin' && password === 'nimda') {
```

## 🐛 Troubleshooting

### **Build Errors**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. Import/export syntax errors
# 3. Missing dependencies
```

### **Runtime Errors**
```bash
# Check Function logs in Vercel dashboard
# Common issues:
# 1. Redis connection failed
# 2. JWT secret not set
# 3. Invalid environment variables
```

### **Database Connection Issues**
1. Verify Upstash Redis is active
2. Check environment variables are correct
3. Test Redis connection in Upstash console

### **Authentication Issues**
1. Verify JWT_SECRET is set and consistent
2. Check token expiration settings
3. Clear browser localStorage if needed

## 📊 Monitoring

### **Vercel Analytics**
- Enable in Vercel dashboard
- Monitor performance and usage
- Track function invocations

### **Upstash Monitoring**
- Monitor Redis usage in Upstash console
- Check connection metrics
- Monitor storage usage

## 🔄 Updates and Maintenance

### **Automatic Deployments**
- Push to `main` branch triggers deployment
- Vercel builds and deploys automatically
- Zero-downtime deployments

### **Database Maintenance**
- Upstash handles Redis maintenance
- Automatic backups and scaling
- Monitor storage limits

### **Security Updates**
- Keep dependencies updated
- Monitor for security advisories
- Regular JWT secret rotation recommended

## 📈 Scaling Considerations

### **User Growth**
- Current limit: 20 users
- Increase limit in code if needed
- Monitor Redis storage usage

### **Performance Optimization**
- Vercel Edge Functions for global performance
- Redis caching for fast data access
- CDN for static assets

## 🔒 Security Best Practices

### **Environment Variables**
- Never commit secrets to git
- Use Vercel environment variables
- Rotate secrets regularly

### **Database Security**
- Use Upstash Redis TLS encryption
- Restrict access to necessary IPs only
- Monitor access logs

### **Application Security**
- Strong JWT secrets (32+ characters)
- Password hashing with bcrypt
- Input validation on all endpoints

---

**🎉 Your AWS SAP-C02 Exam Prep Platform is now live!**

For support, check the main README.md or create an issue in the repository.
