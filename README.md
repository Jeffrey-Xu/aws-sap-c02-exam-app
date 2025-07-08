# AWS SAP-C02 Exam Prep Platform

A comprehensive, multi-user exam preparation platform for the AWS Solutions Architect Professional (SAP-C02) certification with server-side user management and progress tracking.

## 🚀 Features

### **Multi-User Platform**
- **Server-side user management** with secure authentication
- **Individual user accounts** with personalized progress tracking
- **JWT-based authentication** with secure password hashing
- **User limit enforcement** (20 users maximum)
- **Admin panel** for user management

### **Comprehensive Study Tools**
- **529+ Practice Questions** with detailed explanations
- **Full Exam Simulation** (75 questions, 180 minutes)
- **AWS Flashcards** for quick concept reinforcement
- **Domain-specific Progress Tracking** across 5 SAP-C02 domains
- **Question Status Management** (New, Practicing, Mastered, Needs Review)

### **Advanced Analytics**
- **Personal Progress Dashboard** with visual progress indicators
- **Study Time Tracking** and accuracy metrics
- **Domain-wise Performance Analysis**
- **Question Status Overview** with smart recommendations

## 🏗️ Architecture

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Router** for navigation

### **Backend**
- **Vercel Serverless Functions** for API endpoints
- **Upstash Redis** for data persistence
- **JWT Authentication** with bcrypt password hashing
- **ES Modules** for modern JavaScript compatibility

### **Database Schema**
```
Users: {
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  passwordHash: string,
  createdAt: string,
  lastLoginAt: string
}

Progress: {
  userId: string,
  questionProgress: object,
  examAttempts: array,
  studyTime: number,
  lastActivity: string
}
```

## 🛠️ API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### **Admin**
- `GET /api/admin/users` - List all users (admin only)

### **Progress**
- `POST /api/progress/save` - Save user progress
- `GET /api/progress/load` - Load user progress

## 🔧 Environment Variables

```env
# Upstash Redis (Required for production)
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token

# JWT Secret (Required for authentication)
JWT_SECRET=your_jwt_secret_key

# Optional fallback Redis variables
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Setup**
1. Create Upstash Redis database
2. Set environment variables
3. Deploy to Vercel

## 👥 User Management

### **Admin Access**
- Username: `admin`
- Password: `nimda`
- Access admin panel at `/admin`

### **User Limits**
- Maximum 20 users supported
- Automatic user limit enforcement
- Admin can view and manage all users

## 📊 Progress Tracking

### **Question Status System**
- **New**: Questions not yet attempted
- **Practicing**: Answered correctly, needs more practice
- **Mastered**: Answered correctly 3+ times or manually marked
- **Needs Review**: Answered incorrectly or marked for review

### **Domain Coverage**
1. Design Solutions for Organizational Complexity
2. Design for New Solutions  
3. Migration Planning
4. Cost Control
5. Continuous Improvement for Existing Solutions

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: 7-day expiration
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured for security
- **Admin Authentication**: Separate admin credentials

## 🎯 Study Recommendations

1. **Start with "Needs Review"** questions to address weak areas
2. **Progress through "New"** questions systematically
3. **Use Flashcards** for quick concept reinforcement
4. **Take Full Exams** to simulate real test conditions
5. **Track Domain Progress** to ensure comprehensive coverage

## 📱 Responsive Design

- **Mobile-first approach** with responsive navigation
- **Touch-friendly interface** for mobile devices
- **Optimized layouts** for all screen sizes
- **Progressive Web App** capabilities

## 🔄 Development

### **Local Development**
```bash
npm install
npm run dev
```

### **Building**
```bash
npm run build
npm run preview
```

### **Code Structure**
```
├── api/                 # Vercel serverless functions
│   ├── auth/           # Authentication endpoints
│   ├── admin/          # Admin management
│   └── progress/       # Progress tracking
├── lib/                # Shared utilities
│   └── db.js          # Database operations
├── src/               # React application
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── stores/        # State management
└── public/            # Static assets
```

## 📈 Performance

- **Fast Loading**: Optimized with Vite and code splitting
- **Efficient Caching**: Redis for fast data access
- **Serverless Architecture**: Scales automatically
- **CDN Distribution**: Global content delivery via Vercel

## 🐛 Troubleshooting

### **Common Issues**
1. **Environment Variables**: Ensure all required variables are set
2. **Redis Connection**: Verify Upstash Redis credentials
3. **User Limit**: Check if 20-user limit has been reached
4. **JWT Errors**: Verify JWT_SECRET is properly configured

### **Debug Mode**
Set `NODE_ENV=development` for detailed error messages.

## 📄 License

This project is for educational purposes. AWS and SAP-C02 are trademarks of Amazon Web Services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for AWS certification success**
