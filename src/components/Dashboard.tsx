import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, BarChart3, Users, Shield, Activity, Calendar, TrendingUp, MessageCircle, Clock, Bot } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { authService, User as UserType } from '../services/authService';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get current user
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadChatConversations(user);
    }
    setIsLoading(false);
  }, [navigate]);

  const loadChatConversations = async (user: UserType) => {
    setIsLoadingChats(true);
    try {
      // Load chat conversations from localStorage for demo purposes
      // In a real app, this would come from your backend/database
      const storedChats = localStorage.getItem(`chat_conversations_${user.id}`);
      if (storedChats) {
        setChatConversations(JSON.parse(storedChats));
      } else {
        // Create some sample chat conversations for demo
        const sampleConversations = [
          {
            id: 1,
            title: 'Investment Strategy Discussion',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            messages: [
              { sender: 'user', text: 'What investment strategy would you recommend for a beginner?' },
              { sender: 'bot', text: 'For beginners, I recommend starting with a diversified portfolio...' }
            ],
            summary: 'Discussed beginner investment strategies and portfolio diversification'
          },
          {
            id: 2,
            title: 'Market Analysis Request',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            messages: [
              { sender: 'user', text: 'Can you analyze the current market trends?' },
              { sender: 'bot', text: 'Based on current market data, I can see several trends...' }
            ],
            summary: 'Analyzed current market trends and provided insights'
          }
        ];
        setChatConversations(sampleConversations);
        localStorage.setItem(`chat_conversations_${user.id}`, JSON.stringify(sampleConversations));
      }
    } catch (error) {
      console.error('Error loading chat conversations:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.username.split('.')[0] || currentUser.username} {currentUser.username.split('.')[1] || ''}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                Welcome back, {currentUser.username.split('.')[0] || currentUser.username}! 👋
              </h2>
              <p className="text-blue-100">
                Here's what's happening with your InvestRight account
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentUser.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                currentUser.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Role</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{currentUser.role}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentUser.last_login 
                    ? new Date(currentUser.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
              Recent Chat Conversations
            </h3>
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Start New Chat →
            </button>
          </div>

          {isLoadingChats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading conversations...</p>
            </div>
          ) : chatConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h4>
              <p className="text-gray-600 mb-4">Start chatting with our AI assistant to see your conversation history here.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Your First Chat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatConversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/', { state: { openChat: true, conversationId: conversation.id } })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {conversation.messages.length} messages
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{conversation.summary}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(conversation.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bot className="h-3 w-3" />
                          <span>AI Assistant</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(conversation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Features */}
        {currentUser.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">User Management</p>
                  <p className="text-sm text-gray-600">Manage user accounts</p>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View system analytics</p>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <Settings className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">System Settings</p>
                  <p className="text-sm text-gray-600">Configure system</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/contact')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Contact Support</p>
                <p className="text-sm text-gray-600">Get help</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/our-story')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Our Story</p>
                <p className="text-sm text-gray-600">Learn more</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Home</p>
                <p className="text-sm text-gray-600">Go to homepage</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Profile</p>
                <p className="text-sm text-gray-600">Edit profile & password</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
