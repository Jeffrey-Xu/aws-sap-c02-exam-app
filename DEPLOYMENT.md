# 🚀 Deployment Guide

This guide covers multiple deployment options for your AWS SAP-C02 Exam Preparation App.

## 📋 Prerequisites

- Node.js 18+ installed
- Project built successfully (`npm run build`)
- Git repository pushed to GitHub

## 🌟 Recommended: Vercel (Easiest)

### Option A: Web Interface
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `aws-sap-c02-exam-app` repository
5. Click "Deploy" (zero configuration needed!)
6. Get your live URL: `https://aws-sap-c02-exam-app.vercel.app`

### Option B: CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd /path/to/aws-sap-c02-exam-app
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: aws-sap-c02-exam-app
# - Directory: ./
# - Override settings? No
```

**✅ Benefits:**
- Automatic HTTPS
- Global CDN
- Auto-deploy on Git push
- Custom domains
- Free tier available

---

## 🟦 Netlify

### Option A: Drag & Drop
1. Build your project: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Get instant URL

### Option B: Git Integration
1. Connect your GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy automatically on push

### Option C: CLI Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## ☁️ AWS (Perfect for AWS Exam Content!)

### Automated Deployment
Use the provided script for complete AWS setup:

```bash
# Make sure AWS CLI is configured
aws configure

# Run deployment script
./deploy-aws.sh
```

This creates:
- **S3 Bucket** for static hosting
- **CloudFront Distribution** for global CDN
- **Proper routing** for React Router

### Manual AWS Deployment

#### Step 1: Create S3 Bucket
```bash
# Create bucket (replace with unique name)
aws s3 mb s3://your-unique-bucket-name

# Enable static website hosting
aws s3 website s3://your-unique-bucket-name \
  --index-document index.html \
  --error-document index.html
```

#### Step 2: Set Bucket Policy
```bash
# Create bucket policy for public access
cat > bucket-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-unique-bucket-name/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket your-unique-bucket-name --policy file://bucket-policy.json
```

#### Step 3: Upload Files
```bash
# Build and upload
npm run build
aws s3 sync dist/ s3://your-unique-bucket-name --delete
```

#### Step 4: Create CloudFront Distribution (Optional)
- Go to AWS Console → CloudFront
- Create distribution with S3 origin
- Set error pages to redirect to `index.html`

---

## 🟣 GitHub Pages

### Automatic Deployment
The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys to GitHub Pages on every push to main.

### Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: `gh-pages`
5. Your app will be available at: `https://jeffrey-xu.github.io/aws-sap-c02-exam-app`

### Manual GitHub Pages
```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

---

## 🔧 Other Cloud Options

### Google Cloud Platform
```bash
# Install Google Cloud SDK
# Enable Cloud Storage and Cloud CDN

# Create bucket
gsutil mb gs://your-bucket-name

# Upload files
npm run build
gsutil -m cp -r dist/* gs://your-bucket-name

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://your-bucket-name
```

### Azure Static Web Apps
1. Go to Azure Portal
2. Create "Static Web App"
3. Connect to GitHub repository
4. Build settings:
   - App location: `/`
   - Build location: `dist`
   - Build command: `npm run build`

### DigitalOcean App Platform
1. Go to DigitalOcean Control Panel
2. Create new App
3. Connect GitHub repository
4. Configure build settings
5. Deploy automatically

---

## 🎯 Deployment Comparison

| Platform | Cost | Ease | Features | Best For |
|----------|------|------|----------|----------|
| **Vercel** | Free tier | ⭐⭐⭐⭐⭐ | Auto-deploy, CDN, Analytics | **Recommended** |
| **Netlify** | Free tier | ⭐⭐⭐⭐⭐ | Forms, Functions, Split testing | Great alternative |
| **AWS** | Pay-as-go | ⭐⭐⭐ | Full control, Learning AWS | **Perfect for AWS exam prep** |
| **GitHub Pages** | Free | ⭐⭐⭐⭐ | Simple, Git integration | Open source projects |
| **Azure** | Free tier | ⭐⭐⭐ | Microsoft ecosystem | Enterprise |
| **GCP** | Free tier | ⭐⭐⭐ | Google services | Google ecosystem |

---

## 🔒 Custom Domain Setup

### For Vercel/Netlify
1. Buy domain from registrar
2. Add domain in platform settings
3. Update DNS records as instructed
4. Automatic HTTPS certificate

### For AWS
1. Register domain in Route 53 (or external)
2. Create hosted zone
3. Point CloudFront distribution
4. Request SSL certificate in Certificate Manager

---

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images and assets
# Enable gzip compression
# Use CDN for static assets
```

### Caching Headers
Most platforms handle this automatically, but for custom setups:
- HTML: No cache or short cache
- JS/CSS: Long cache with versioning
- Images: Long cache

---

## 🚨 Troubleshooting

### React Router Issues
If you get 404 errors on refresh:
- **Vercel**: Add `vercel.json` with rewrites
- **Netlify**: Add `_redirects` file
- **AWS**: Configure CloudFront error pages
- **GitHub Pages**: Use hash router instead

### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Build locally first
npm run build
```

---

## 🎯 Recommendation

**For your AWS SAP-C02 exam app, I recommend:**

1. **Start with Vercel** - Get online quickly and easily
2. **Then try AWS** - Practice what you're learning for the exam
3. **Use GitHub Pages** - For open source sharing

This gives you experience with multiple cloud platforms while keeping your app accessible to exam candidates worldwide! 🌍
