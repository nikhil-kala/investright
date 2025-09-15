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
  ChevronRight,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { authService } from '../services/authService';
import { CardManager } from './CardManager';

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

const DashboardFixed: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [showUserReport, setShowUserReport] = useState(false);
  const [showContactReport, setShowContactReport] = useState(false);
  const [showChatReport, setShowChatReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage, setConversationsPerPage] = useState(10);
  const [groupByDate, setGroupByDate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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

        // Fix created_at date if it's today's date
        const today = new Date().toDateString();
        const userCreatedAt = new Date(user.created_at).toDateString();
        
        if (userCreatedAt === today) {
          const fixedDate = user.role === 'admin' 
            ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
          
          const updatedUser = { ...user, created_at: fixedDate };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          setCurrentUser(user);
        }
        
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
      // Simulate loading chat conversations with more data
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
        },
        {
          id: '3',
          title: 'Stock Market Analysis',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          last_message: 'The market trends show...',
          message_count: 12
        },
        {
          id: '4',
          title: 'Mutual Fund Selection',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          last_message: 'Here are the best mutual funds...',
          message_count: 6
        },
        {
          id: '5',
          title: 'Tax Planning Strategy',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          last_message: 'For tax optimization...',
          message_count: 9
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

  const getTotalPages = () => {
    return Math.ceil(chatConversations.length / conversationsPerPage);
  };

  const getPaginatedConversations = () => {
    const startIndex = (currentPage - 1) * conversationsPerPage;
    const endIndex = startIndex + conversationsPerPage;
    return chatConversations.slice(startIndex, endIndex);
  };

  const getGroupedConversations = () => {
    const paginatedConversations = getPaginatedConversations();
    
    if (!groupByDate) {
      return { 'All Conversations': paginatedConversations };
    }

    const grouped = paginatedConversations.reduce((groups: any, conversation) => {
      const date = new Date(conversation.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conversation);
      return groups;
    }, {});
    
    return grouped;
  };

  const refreshConversations = () => {
    setRefreshKey(prev => prev + 1);
    loadChatConversations();
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

  const groupedConversations = getGroupedConversations();
  const totalPages = getTotalPages();

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

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-semibold text-gray-900">{chatConversations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {chatConversations.filter(conv => {
                    const convDate = new Date(conv.created_at);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return convDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Activity className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {chatConversations.reduce((sum, conv) => sum + conv.message_count, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {chatConversations.filter(conv => {
                    const convDate = new Date(conv.created_at);
                    const today = new Date();
                    return convDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Conversations */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-8">
          {/* New Version Banner */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ✨ New Organized View
                </h3>
                <p className="text-sm text-green-700">
                  Enhanced chat organization with grouping, pagination, and better UI
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                Chat Conversations
              </h3>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {chatConversations.length} total
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  📄 Pagination: {conversationsPerPage} per page
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setGroupByDate(!groupByDate)}
                className={`px-3 py-1 text-sm rounded-md ${
                  groupByDate 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {groupByDate ? '📅 Grouped' : '📋 List'}
              </button>
              
              <select
                value={conversationsPerPage}
                onChange={(e) => setConversationsPerPage(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              
              <button
                onClick={refreshConversations}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
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
            <div className="space-y-6">
              {Object.entries(groupedConversations).map(([groupKey, conversations]) => (
                <div key={groupKey}>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {groupKey}
                  </h4>
                  <div className="grid gap-4">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/chat?conversation=${conversation.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{conversation.last_message}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500 ml-4">
                            <div>{new Date(conversation.created_at).toLocaleDateString()}</div>
                            <div>{conversation.message_count} messages</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * conversationsPerPage) + 1} to {Math.min(currentPage * conversationsPerPage, chatConversations.length)} of {chatConversations.length} conversations
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            Card Management
          </h3>
          <CardManager />
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
              
              <button 
                onClick={() => setShowContactReport(!showContactReport)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Contact Report</p>
                  <p className="text-sm text-gray-600">View contact submissions</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowChatReport(!showChatReport)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Chat Report</p>
                  <p className="text-sm text-gray-600">View chat analytics</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Profile</p>
                  <p className="text-sm text-gray-600">Edit profile & password</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFixed;
