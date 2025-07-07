import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Users, Award, CheckCircle, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import Button from '../components/common/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AWS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SAP-C02 Exam Prep</h1>
              </div>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="flex items-center">
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="flex items-center">
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg">
                <Shield className="h-8 w-8 text-aws-orange" />
                <span className="text-xl font-bold text-gray-900">AWS Solutions Architect Professional</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master the <span className="text-aws-orange">SAP-C02</span> Certification
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive exam preparation platform with 529+ practice questions, 
              detailed explanations, and expert-level analysis to help you pass the 
              AWS Solutions Architect Professional certification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="flex items-center text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="flex items-center text-lg px-8 py-4">
                  <LogIn size={20} className="mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Pass SAP-C02
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive study materials designed by AWS experts
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">529+ Practice Questions</h3>
              <p className="text-gray-600">
                Comprehensive question bank with detailed explanations and reasoning analysis
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-User Platform</h3>
              <p className="text-gray-600">
                Individual accounts with personalized progress tracking and settings
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Analysis</h3>
              <p className="text-gray-600">
                Detailed reasoning for each option with AWS services identification
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Simulation</h3>
              <p className="text-gray-600">
                Full-length practice exams with real exam conditions and timing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Comprehensive Coverage</h3>
                    <p className="text-gray-600">All SAP-C02 exam domains covered with detailed explanations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
                    <p className="text-gray-600">Monitor your learning progress and identify weak areas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Explanations</h3>
                    <p className="text-gray-600">Detailed reasoning for every answer choice</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                    <p className="text-gray-600">Individual user accounts with data isolation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center">
                <div className="bg-aws-orange rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join our platform and start your journey to AWS Solutions Architect Professional certification
                </p>
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    Create Free Account
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Limited to 20 users • Email verification required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AWS</span>
              </div>
              <span className="text-xl font-semibold">SAP-C02 Exam Prep</span>
            </div>
            <p className="text-gray-400 mb-4">
              Comprehensive AWS Solutions Architect Professional certification preparation
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
