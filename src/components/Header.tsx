import React from 'react';
import { Menu, X, User, Shield, MessageCircle, ChevronDown, LogOut } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const location = useLocation();

  // Helper function to format username for display
  const formatDisplayName = (username: string) => {
    const parts = username.split('.');
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${firstName} ${lastName}`;
    }
    // Fallback: capitalize first letter of the whole username
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setIsUserDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
                {/* InvestRight Logo */}
                <div className="flex items-center space-x-2">
                  {/* Graphic Symbol */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                      <div className="relative">
                        {/* Upward trending line */}
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M3 18L9 12L15 16L21 6" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                        {/* Green circle at peak */}
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        {/* Green arrow above */}
                        <div className="absolute -top-3 -right-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-green-500"></div>
                      </div>
                    </div>
                  </div>
                  {/* Company Name */}
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-blue-700">Invest</span>
                    <span className="text-xl font-bold text-green-600 -mt-1">Right</span>
                  </div>
                </div>
            </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/our-story"
              className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
            >
              Our Story
            </Link>
            <Link
              to="/chat"
              className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
            >
              Contact
            </Link>
            {isAuthenticated ? (
              <div className="relative user-dropdown">
                {/* User Email Display with Dropdown */}
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {(() => {
                      const user = authService.getCurrentUser();
                      if (user) {
                        return formatDisplayName(user.username);
                      }
                      return '';
                    })()}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {(() => {
                          const user = authService.getCurrentUser();
                          if (user) {
                            return formatDisplayName(user.username);
                          }
                          return '';
                        })()}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Profile</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
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
                      return formatDisplayName(user.username);
                    }
                    return '';
                  })()}
                </span>
              </div>
            )}
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
          <div className="md:hidden py-2 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/our-story"
                className="text-gray-700 hover:text-blue-700 transition-colors font-medium"
              >
                Our Story
              </Link>
              <Link
                to="/chat"
                className="text-gray-700 hover:text-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
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
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
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