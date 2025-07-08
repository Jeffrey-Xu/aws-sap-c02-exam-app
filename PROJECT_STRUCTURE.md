# 📁 Project Structure

Comprehensive overview of the AWS SAP-C02 Exam Prep Platform codebase.

## 🏗️ Root Directory

```
aws-sap-c02-exam-app/
├── 📁 api/                    # Vercel Serverless Functions
├── 📁 lib/                    # Shared Utilities & Database
├── 📁 public/                 # Static Assets
├── 📁 src/                    # React Application Source
├── 📄 README.md               # Main Documentation
├── 📄 DEPLOYMENT.md           # Deployment Guide
├── 📄 PROJECT_STRUCTURE.md    # This File
├── 📄 package.json            # Dependencies & Scripts
├── 📄 vite.config.ts          # Vite Configuration
├── 📄 tailwind.config.js      # Tailwind CSS Configuration
└── 📄 tsconfig.json           # TypeScript Configuration
```

## 🔌 API Directory (`/api`)

**Vercel Serverless Functions** - Backend API endpoints

```
api/
├── 📁 auth/                   # Authentication Endpoints
│   ├── 📄 register.js         # User Registration
│   ├── 📄 login.js            # User Login
│   └── 📄 me.js               # Get Current User
├── 📁 admin/                  # Admin Management
│   └── 📄 users.js            # User Management (Admin Only)
└── 📁 progress/               # Progress Tracking
    ├── 📄 save.js             # Save User Progress
    └── 📄 load.js             # Load User Progress
```

### **API Endpoint Details**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/login` | POST | User login | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/admin/users` | GET | List all users | Admin |
| `/api/progress/save` | POST | Save progress | Yes |
| `/api/progress/load` | GET | Load progress | Yes |

## 🛠️ Library Directory (`/lib`)

**Shared utilities and database operations**

```
lib/
└── 📄 db.js                   # Database Operations & Auth
```

### **Database Functions**
- User management (CRUD operations)
- Authentication middleware
- JWT token generation/verification
- Progress tracking
- Admin utilities

## 🎨 Source Directory (`/src`)

**React application source code**

```
src/
├── 📁 components/             # Reusable UI Components
│   ├── 📄 AuthForm.tsx        # Authentication Forms
│   ├── 📄 Navigation.tsx      # App Navigation
│   ├── 📄 QuestionCard.tsx    # Question Display
│   ├── 📄 ProgressBar.tsx     # Progress Indicators
│   └── 📄 AdminPanel.tsx      # Admin Interface
├── 📁 pages/                  # Page Components
│   ├── 📄 Dashboard.tsx       # Main Dashboard
│   ├── 📄 Practice.tsx        # Practice Questions
│   ├── 📄 Exam.tsx            # Full Exam Mode
│   ├── 📄 Analytics.tsx       # Progress Analytics
│   ├── 📄 Settings.tsx        # User Settings
│   └── 📄 Auth.tsx            # Authentication Page
├── 📁 services/               # API Services
│   ├── 📄 api.ts              # API Client
│   └── 📄 auth.ts             # Auth Service
├── 📁 stores/                 # State Management
│   ├── 📄 authStore.ts        # Authentication State
│   ├── 📄 progressStore.ts    # Progress State
│   └── 📄 examStore.ts        # Exam State
├── 📁 data/                   # Static Data
│   ├── 📄 questions.ts        # Question Database
│   └── 📄 domains.ts          # Domain Definitions
├── 📁 types/                  # TypeScript Types
│   ├── 📄 auth.ts             # Auth Types
│   ├── 📄 question.ts         # Question Types
│   └── 📄 progress.ts         # Progress Types
├── 📁 utils/                  # Utility Functions
│   ├── 📄 storage.ts          # Local Storage Utils
│   ├── 📄 validation.ts       # Form Validation
│   └── 📄 formatting.ts       # Data Formatting
├── 📄 App.tsx                 # Main App Component
├── 📄 main.tsx                # App Entry Point
└── 📄 index.css               # Global Styles
```

## 🎯 Key Components

### **Authentication System**
- **AuthForm.tsx**: Login/Register forms with validation
- **authStore.ts**: Global authentication state
- **api.ts**: HTTP client with token management

### **Question System**
- **QuestionCard.tsx**: Individual question display
- **questions.ts**: 529+ question database
- **examStore.ts**: Exam session management

### **Progress Tracking**
- **ProgressBar.tsx**: Visual progress indicators
- **progressStore.ts**: Progress state management
- **Analytics.tsx**: Detailed progress analysis

### **Admin System**
- **AdminPanel.tsx**: User management interface
- **users.js**: Admin API endpoints
- **Admin authentication**: Separate admin credentials

## 🗄️ Data Flow

### **Authentication Flow**
```
User Input → AuthForm → API Service → Serverless Function → Database → JWT Token → Client State
```

### **Progress Tracking Flow**
```
User Action → Progress Store → API Service → Serverless Function → Redis Database
```

### **Question Flow**
```
Static Data → Question Store → UI Components → User Interaction → Progress Update
```

## 🔧 Configuration Files

### **Vite Configuration (`vite.config.ts`)**
- Build optimization
- Development server setup
- Plugin configuration

### **Tailwind Configuration (`tailwind.config.js`)**
- Custom color scheme
- Component styling
- Responsive breakpoints

### **TypeScript Configuration (`tsconfig.json`)**
- Strict type checking
- Path aliases
- Build targets

## 📦 Dependencies

### **Production Dependencies**
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React Router**: Navigation

### **Backend Dependencies**
- **@upstash/redis**: Database client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **uuid**: Unique ID generation

## 🚀 Build Process

### **Development**
```bash
npm run dev          # Start development server
```

### **Production Build**
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Deployment**
- **Vercel**: Automatic deployment on git push
- **Serverless Functions**: Auto-deployed from `/api`
- **Static Assets**: CDN distribution

## 🔒 Security Architecture

### **Authentication**
- JWT tokens with 7-day expiration
- bcrypt password hashing with salt
- Secure HTTP-only token storage

### **Authorization**
- Route-based access control
- Admin-only endpoints
- User-specific data isolation

### **Data Protection**
- Input validation on all endpoints
- CORS configuration
- Environment variable protection

---

**This structure supports a scalable, maintainable, and secure multi-user exam preparation platform.**
