# 🔄 USER REGISTRATION & DATA SAVING WORKFLOW

## 📋 Complete User Registration Flow

```mermaid
graph TD
    A[User visits /auth] --> B{Already Authenticated?}
    B -->|Yes| C[Redirect to Dashboard]
    B -->|No| D[Show Auth Page]
    
    D --> E[User clicks 'Create Account']
    E --> F[SignupForm Component]
    
    F --> G[User fills form]
    G --> H[Form Validation]
    
    H --> I{Validation Passes?}
    I -->|No| J[Show Field Errors]
    J --> G
    
    I -->|Yes| K[Check User Limit]
    K --> L{Under 20 users?}
    L -->|No| M[Show 'Max users reached']
    L -->|Yes| N[Call authStore.signup()]
    
    N --> O[AuthStore Processing]
    O --> P[Email Format Validation]
    P --> Q[Password Strength Check]
    Q --> R[Password Confirmation Match]
    R --> S[Check if Email Exists]
    
    S --> T{Email Already Exists?}
    T -->|Yes| U[Return 'User Exists' Error]
    T -->|No| V[Generate User Data]
    
    V --> W[Create Salt & Hash Password]
    W --> X[Generate Unique User ID]
    X --> Y[Create StoredUser Object]
    
    Y --> Z[Save to localStorage]
    Z --> AA[Create User Session]
    AA --> BB[Set Authentication State]
    BB --> CC[Initialize User Progress]
    CC --> DD[Redirect to Dashboard]
```

## 🗄️ Data Storage Architecture

### 1. **User Authentication Data**
```
localStorage Key: 'aws_exam_app_users'
Storage Type: Array of StoredUser objects
Location: Browser localStorage (domain-specific)

Structure:
[
  {
    id: "user_mct1qsi4_ureo9cja1y",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe", 
    passwordHash: "hashed_password",
    salt: "random_salt",
    createdAt: "2025-07-07T11:57:26.860Z",
    lastLoginAt: "2025-07-07T15:49:17.701Z",
    isEmailVerified: true
  }
]
```

### 2. **User Session Data**
```
localStorage Key: 'aws_exam_app_session'
Storage Type: Zustand persist state
Location: Browser localStorage

Structure:
{
  state: {
    user: {
      id: "user_mct1qsi4_ureo9cja1y",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      isEmailVerified: true
    },
    isAuthenticated: true
  }
}
```

### 3. **User Progress Data**
```
localStorage Key: 'progress-store-{userId}'
Storage Type: UserProgress object
Location: Browser localStorage

Structure:
{
  questionProgress: {
    "1": {
      questionId: 1,
      attempts: 3,
      correctAttempts: 1,
      lastAttempted: "2025-07-07T16:00:00.000Z",
      status: "practicing",
      timeSpent: 120,
      notes: [],
      bookmarked: false
    }
  },
  totalQuestions: 529,
  masteredQuestions: 0,
  categoryProgress: {},
  studyStreak: 0,
  examAttempts: [],
  totalStudyTime: 0
}
```

## 🔄 Step-by-Step Registration Process

### **Phase 1: User Interface**
1. **User Navigation**: User visits `/auth` page
2. **Component Loading**: AuthPage component loads
3. **Form Display**: SignupForm component renders
4. **User Input**: User fills registration form
5. **Client Validation**: Real-time form validation

### **Phase 2: Form Submission**
6. **Form Submit**: User clicks "Create Account"
7. **Validation Check**: Final form validation
8. **User Limit Check**: Verify under 20 users
9. **API Call**: Call `authStore.signup(formData)`

### **Phase 3: Server-Side Processing**
10. **Email Validation**: Check email format
11. **Password Validation**: Check password strength
12. **Duplicate Check**: Verify email doesn't exist
13. **Data Generation**: Create salt, hash password
14. **User ID Generation**: Generate unique user ID

### **Phase 4: Data Persistence**
15. **User Creation**: Create StoredUser object
16. **Array Update**: Add to existing users array
17. **localStorage Write**: Save updated users array
18. **Session Creation**: Create user session
19. **State Update**: Set authentication state

### **Phase 5: Progress Initialization**
20. **Progress Store**: Initialize empty progress
21. **User Isolation**: Create user-specific progress key
22. **Auto-Save Setup**: Start progress auto-save
23. **Navigation**: Redirect to dashboard

## 🏗️ Data Architecture Overview

```
Browser localStorage (Domain-Specific)
├── aws_exam_app_users (Centralized User Database)
│   ├── User 1: Jeffrey Xu
│   ├── User 2: Tim Xu  
│   └── User N: (up to 20 users)
│
├── aws_exam_app_session (Current Session)
│   └── Currently logged-in user data
│
├── progress-store-user_mct1qsi4_ureo9cja1y (User 1 Progress)
├── progress-store-user_mctb91pr_0k8fpretmm6f (User 2 Progress)
└── progress-store-{userId} (Individual Progress Data)
```

## 🔐 Security & Isolation

### **User Data Security**
- **Password Hashing**: bcrypt-style hashing with salt
- **Unique Salts**: Each user has unique salt
- **No Plain Text**: Passwords never stored in plain text
- **Email Verification**: All users auto-verified

### **Data Isolation**
- **User-Specific Progress**: Each user has separate progress store
- **Session Management**: Single active session per browser
- **Browser-Specific**: Data isolated per browser/domain
- **No Cross-User Access**: Users can't access others' data

## 🌐 Multi-Browser Behavior

### **Centralized but Browser-Specific**
```
Chrome Browser:
├── localStorage['aws_exam_app_users'] = [User A, User B]
├── User A Progress Data
└── User B Progress Data

Safari Browser:
├── localStorage['aws_exam_app_users'] = [User C, User D]  
├── User C Progress Data
└── User D Progress Data

Firefox Browser:
├── localStorage['aws_exam_app_users'] = [User E]
└── User E Progress Data
```

### **Key Implications**
- **Same Domain**: All users share same storage within browser
- **Different Browsers**: Completely separate user databases
- **Incognito Mode**: Separate storage from normal browsing
- **Device Specific**: No sync across devices

## 🚨 Common Issues & Solutions

### **Issue 1: User Not Found in Admin Panel**
**Cause**: User created in different browser/session
**Solution**: Check admin panel in all browsers used

### **Issue 2: Registration Fails Silently**
**Cause**: User limit reached (20 users max)
**Solution**: Check user count, clear old test accounts

### **Issue 3: Progress Not Saving**
**Cause**: User not properly authenticated
**Solution**: Verify session state and user ID

### **Issue 4: Duplicate Users**
**Cause**: Same email in different browsers
**Solution**: Email validation only works within same browser

## 📊 Admin Panel Data Flow

```
Admin Panel Access:
1. Navigate to /admin
2. Authenticate (admin/nimda)
3. Read localStorage['aws_exam_app_users']
4. For each user, read progress-store-{userId}
5. Calculate metrics and display
6. Auto-refresh every 30 seconds
```

## 🔧 Technical Implementation

### **Storage Keys Used**
- `aws_exam_app_users` - Main user database
- `aws_exam_app_session` - Current session (Zustand)
- `progress-store-{userId}` - Individual progress data
- `admin_authenticated` - Admin panel session

### **User ID Format**
- Pattern: `user_{random}_{random}`
- Example: `user_mct1qsi4_ureo9cja1y`
- Unique per registration
- Used for progress data isolation

### **Data Persistence**
- **Immediate**: User data saved immediately on registration
- **Auto-Save**: Progress auto-saved every 30 seconds
- **Manual Save**: On navigation/tab close
- **Session Restore**: On browser restart

This workflow shows that user registration is **centralized within each browser** but **isolated across different browsers/devices**.
