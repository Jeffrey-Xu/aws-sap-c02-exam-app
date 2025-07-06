import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, BarChart3, Settings, Home, Cloud, Users, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: ROUTES.HOME, label: 'Dashboard', icon: Home },
    { path: ROUTES.PRACTICE, label: 'Practice', icon: BookOpen },
    { path: ROUTES.EXAM, label: 'Exam Sim', icon: Clock },
    { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { path: ROUTES.SERVICES, label: 'AWS Reference', icon: Cloud },
    { path: ROUTES.ARCHITECT, label: 'Architect Guide', icon: Users },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    console.log('Mobile menu toggle clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle mobile menu item click
  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="relative">
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AWS</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">SAP-C02 Exam Prep</h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-gray-900">SAP-C02</h1>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
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
            <div className="lg:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-aws-orange transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleMobileMenuItemClick}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-aws-orange text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Header;
