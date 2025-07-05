import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, BarChart3, Settings, Home, Cloud, Users } from 'lucide-react';
import { ROUTES } from '../../constants';

const Header: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: ROUTES.HOME, label: 'Dashboard', icon: Home },
    { path: ROUTES.PRACTICE, label: 'Practice', icon: BookOpen },
    { path: ROUTES.EXAM, label: 'Exam Sim', icon: Clock },
    { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { path: ROUTES.SERVICES, label: 'AWS Reference', icon: Cloud },
    { path: ROUTES.ARCHITECT, label: 'Architect Guide', icon: Users },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
  ];
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AWS</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SAP-C02 Exam Prep</h1>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-aws-orange text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
