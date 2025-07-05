#!/bin/bash

# AWS Deployment Script for SAP-C02 Exam App
# This script deploys your React app to AWS S3 + CloudFront

set -e

# Configuration
BUCKET_NAME="aws-sap-c02-exam-app-$(date +%s)"
REGION="us-east-1"
CLOUDFRONT_COMMENT="SAP-C02 Exam App Distribution"

echo "🚀 Starting AWS deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Create S3 bucket
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Create CloudFront distribution
echo "🌍 Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "$CLOUDFRONT_COMMENT",
    "DefaultCacheBehavior": {
        "TargetOriginId": "$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
rm cloudfront-config.json

# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)

echo "✅ Deployment completed!"
echo ""
echo "📋 Deployment Details:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "   CloudFront URL: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "⏳ Note: CloudFront distribution may take 10-15 minutes to fully deploy."
echo "🔗 Your app will be available at: https://$CLOUDFRONT_DOMAIN"
