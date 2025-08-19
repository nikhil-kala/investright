import React from 'react';
import { TrendingUp, Menu, X, User, Shield } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSelector from './LanguageSelector';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Header() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-700 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{t.header.brand}</span>
            </Link>
          </div>

          {/* User Display - Show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-900">
                {(() => {
                  const user = authService.getCurrentUser();
                  if (user) {
                    const firstName = user.username.split('.')[0] || user.username;
                    const lastName = user.username.split('.')[1] || '';
                    return `${firstName} ${lastName}`.trim();
                  }
                  return '';
                })()}
              </span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/our-story"
              className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
            >
              Our Story
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
            >
              Contact
            </Link>
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={changeLanguage}
            />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={async () => {
                    await authService.logout();
                    setIsAuthenticated(false);
                    window.location.href = '/';
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : location.pathname === '/' ? (
              <Link
                to="/login"
                className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                {t.header.getStarted}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile User Display */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-2.5 w-2.5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-900">
                  {(() => {
                    const user = authService.getCurrentUser();
                    if (user) {
                      const firstName = user.username.split('.')[0] || user.username;
                      const lastName = user.username.split('.')[1] || '';
                      return `${firstName} ${lastName}`.trim();
                    }
                    return '';
                  })()}
                </span>
              </div>
            )}
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={changeLanguage}
            />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/our-story"
                className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
              >
                Our Story
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await authService.logout();
                      setIsAuthenticated(false);
                      window.location.href = '/';
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium w-full flex items-center justify-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : location.pathname === '/' ? (
                <Link
                  to="/login"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium w-full flex items-center justify-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              ) : (
                <Link
                  to="/"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium w-full text-center"
                >
                  {t.header.getStarted}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}