import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';
// import { CardManager } from './CardManager';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  last_message: string;
  message_count: number;
}

const DashboardSimple: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [showUserReport, setShowUserReport] = useState(false);
  const [showContactReport, setShowContactReport] = useState(false);
  const [showChatReport, setShowChatReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Get current user
        const user = authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setCurrentUser(user);
        
        // Load chat conversations
        await loadChatConversations();
        
      } catch (err) {
        console.error('Error initializing dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const loadChatConversations = async () => {
    try {
      // Simulate loading chat conversations
      const mockConversations: ChatConversation[] = [
        {
          id: '1',
          title: 'Investment Planning Discussion',
          created_at: new Date().toISOString(),
          last_message: 'Let me help you plan your investment strategy...',
          message_count: 5
        },
        {
          id: '2',
          title: 'Retirement Planning',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_message: 'Based on your current savings...',
          message_count: 8
        }
      ];
      
      setChatConversations(mockConversations);
    } catch (err) {
      console.error('Error loading chat conversations:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const formatDisplayName = (name: string) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getFirstName = (name: string) => {
    return formatDisplayName(name.split(' ')[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Welcome, {getFirstName(currentUser.username)}!
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {getFirstName(currentUser.username)}!
              </h2>
              <p className="text-blue-100">
                Member since {new Date(currentUser.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{chatConversations.length}</div>
              <div className="text-blue-100">Total Conversations</div>
            </div>
          </div>
        </div>

        {/* Chat Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
            Chat Conversations
          </h3>
          
          {chatConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start a Conversation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/chat?conversation=${conversation.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{conversation.last_message}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(conversation.created_at).toLocaleDateString()}</div>
                      <div>{conversation.message_count} messages</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            Card Management
          </h3>
          <p className="text-gray-500">Card management feature will be available soon.</p>
        </div>

        {/* Admin Features */}
        {currentUser.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowUserReport(!showUserReport)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">User Report</p>
                  <p className="text-sm text-gray-600">View user analytics</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSimple;
