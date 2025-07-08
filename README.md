# AWS SAP-C02 Exam Preparation App

A comprehensive study platform for the AWS Solutions Architect Professional (SAP-C02) certification exam.

## 🚀 Features

### 📊 **Dashboard & Progress Tracking**
- **Exam Countdown**: Clean countdown display showing days remaining
- **Domain Progress**: Accurate mastery tracking across all 5 exam domains
  - Design Solutions for Organizational Complexity (72 questions)
  - Design for New Solutions (154 questions)
  - Migration Planning (113 questions)
  - Cost Control (32 questions)
  - Continuous Improvement for Existing Solutions (158 questions)
- **Question Status Overview**: Track New, Practicing, Mastered, and Needs Review questions
- **Study Analytics**: Time tracking, accuracy rates, and streak counters

### 📝 **Practice Modes**
- **Practice Questions**: 529 comprehensive questions with detailed explanations
- **AWS Flashcards**: Quick concept reinforcement
- **Full Exam Simulator**: 75 questions, 180-minute timed practice
- **Smart Filtering**: Filter by domain, status, bookmarks, and search

### 🎯 **Learning Features**
- **Intelligent Question Categorization**: AI-powered domain classification
- **Progress Persistence**: Auto-save with backup/restore functionality
- **Bookmarking System**: Save important questions for review
- **Manual Status Override**: Mark questions as mastered or needs review
- **Detailed Explanations**: Comprehensive answer explanations with AWS service details

### 🔧 **Technical Features**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live progress tracking and statistics
- **Data Export/Import**: Backup and restore study progress
- **Loading States**: Smooth user experience with loading indicators

## 🏗️ **Architecture**

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Zustand** for state management

### **Data Management**
- **Local Storage** for progress persistence
- **JSON-based** question bank (529 questions)
- **Automatic backup** system with cleanup
- **Real-time synchronization**

### **Deployment**
- **Vercel** hosting with automatic deployments
- **GitHub Actions** for CI/CD
- **Environment-based** configuration

## 📁 **Project Structure**

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (ExamCountdown, ProgressBar, etc.)
│   └── ui/              # UI primitives
├── pages/               # Main application pages
│   ├── HomePage.tsx     # Dashboard with progress tracking
│   ├── PracticePage.tsx # Question practice interface
│   └── ExamPage.tsx     # Full exam simulator
├── stores/              # Zustand state management
│   ├── questionStore.ts # Question data and filtering
│   └── progressStore.ts # Progress tracking and persistence
├── utils/               # Utility functions
│   └── questionUtils.ts # Question categorization and helpers
├── data/                # Static data files
│   └── questions.json   # Complete question bank
└── types/               # TypeScript type definitions
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone https://github.com/Jeffrey-Xu/aws-sap-c02-exam-app.git

# Navigate to project directory
cd aws-sap-c02-exam-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Configure your environment variables
# (Add any required API keys or configuration)
```

## 📊 **Question Distribution**

The app includes 529 carefully curated questions distributed across AWS SAP-C02 exam domains:

| Domain | Questions | Percentage |
|--------|-----------|------------|
| Design Solutions for Organizational Complexity | 72 | 13.6% |
| Design for New Solutions | 154 | 29.1% |
| Migration Planning | 113 | 21.4% |
| Cost Control | 32 | 6.0% |
| Continuous Improvement for Existing Solutions | 158 | 29.9% |

## 🔄 **Recent Updates**

### **v2.1.0 - Dashboard Improvements**
- ✅ Fixed Domain Progress to show accurate mastery statistics
- ✅ Removed non-functional "View Analytics" link
- ✅ Simplified exam countdown to show days only
- ✅ Added comprehensive loading states
- ✅ Improved question categorization accuracy

### **v2.0.0 - Major Overhaul**
- 🎯 Complete UI/UX redesign
- 📊 Enhanced progress tracking system
- 🔄 Automatic backup and restore functionality
- 📱 Mobile-responsive design
- ⚡ Performance optimizations

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### **Code Quality**
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks

## 📈 **Performance**

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Time**: < 2s initial load
- **Memory Usage**: Efficient state management

## 🔒 **Data Privacy**

- All study progress stored locally in browser
- No personal data transmitted to external servers
- Optional backup/restore functionality
- GDPR compliant data handling

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- AWS documentation and best practices
- Community feedback and contributions
- Open source libraries and tools used

## 📞 **Support**

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Jeffrey-Xu/aws-sap-c02-exam-app/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Jeffrey-Xu/aws-sap-c02-exam-app/discussions)

---

**Good luck with your AWS SAP-C02 certification journey! 🎯**
