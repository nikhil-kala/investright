import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, BarChart3, Users, Shield, Activity, TrendingUp, MessageCircle, Clock, Bot, X, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { authService, User as UserType } from '../services/authService';

import { chatService } from '../services/chatService';
import CardManagerWithWebSearch from './CardManagerWithWebSearch';

// Conversation Card Component
const ConversationCard = ({ conversation }: { conversation: any }) => {
  const navigate = useNavigate();
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => navigate('/chat', { state: { conversationId: conversation.id } })}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {conversation.title || 'Untitled Conversation'}
              </h4>
              <div className="flex items-center space-x-3 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {conversation.message_count || conversation.messages?.length || 0} messages
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.created_at || conversation.date)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {conversation.last_message || conversation.messages?.[0]?.content || 'No messages yet'}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-xs text-gray-500">
                {conversation.user_email || 'Unknown User'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatTime(conversation.created_at || conversation.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get first name from username
const getFirstName = (username: string): string => {
  if (!username) return 'User';
  return username.split('.')[0] || username;
};

// Helper function to format display name
const formatDisplayName = (username: string): string => {
  if (!username) return 'Unknown User';
  const parts = username.split('.');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const firstName = parts[0];
    const lastName = parts[1];
    return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
};

export default function Dashboard() {
  useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  // Admin state
  const [showUserReport, setShowUserReport] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);
  const [allChats, setAllChats] = useState<any[]>([]);
  const [isLoadingAllChats, setIsLoadingAllChats] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showChatDetails, setShowChatDetails] = useState(false);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await loadChatConversations(user);
          await refreshUserList();
          if (user.role === 'admin') {
            await loadAllChats();
          }
      } else {
          navigate('/login');
      }
    } catch (error) {
        console.error('Error loading current user:', error);
        navigate('/login');
    } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [navigate]);

  // Load chat conversations
  const loadChatConversations = async (user: UserType) => {
    setIsLoadingChats(true);
    try {
      console.log('Dashboard: Loading conversations for user:', user.email);
      
      // Load conversations from localStorage
      const storedConversations = localStorage.getItem(`chat_conversations_${user.id}`);
      if (storedConversations) {
        try {
          const parsedConversations = JSON.parse(storedConversations);
          setConversations(parsedConversations);
          setTotalConversations(parsedConversations.length);
          console.log('Dashboard: Loaded conversations from localStorage:', parsedConversations.length);
        } catch (parseError) {
          console.error('Dashboard: Error parsing localStorage conversations:', parseError);
          setConversations([]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Dashboard: Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load all chats for admin
  const loadAllChats = async () => {
    setIsLoadingAllChats(true);
    try {
      console.log('Admin: Loading all conversations...');
      const result = await chatService.getAllConversations();
      
      if (result.success && result.conversations) {
        console.log('Admin: Loaded', result.conversations.length, 'conversations');
        setAllChats(result.conversations);
      } else {
        console.error('Error loading conversations:', result.error);
        setAllChats([]);
      }
    } catch (error) {
      console.error('Error loading all chats:', error);
      setAllChats([]);
    } finally {
      setIsLoadingAllChats(false);
    }
  };


  // Refresh user list
  const refreshUserList = async () => {
    try {
      const users = await authService.getAllUsers();
      setAllUsers(users);
      setTotalUsers(users.length);
      
      // Store in localStorage for dashboard display
      localStorage.setItem('dashboard_users', JSON.stringify(users));
    } catch (error) {
      console.error('Dashboard: Error refreshing user list:', error);
      // Try to get users from localStorage as fallback
      const storedUsers = localStorage.getItem('dashboard_users');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          setAllUsers(parsedUsers);
          setTotalUsers(parsedUsers.length);
        } catch (parseError) {
          console.error('Dashboard: Error parsing stored users:', parseError);
        }
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Handle conversation refresh
  const refreshConversations = async () => {
    if (currentUser) {
      console.log('Dashboard: Manual refresh triggered');
      await loadChatConversations(currentUser);
    }
  };


  // Handle chat selection for admin
  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setShowChatDetails(true);
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
              <div className="flex items-center space-x-3">
                {/* InvestRight Logo */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">IR</span>
                    </div>
                  </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">InvestRight</h1>
                  <p className="text-xs text-gray-500">Smart Investment Platform</p>
                </div>
                </div>
              </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatDisplayName(currentUser.username)}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
              </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
                Welcome back, {getFirstName(currentUser.username)}! 👋
              </h2>
              <p className="text-blue-100">
                Here's what's happening with your InvestRight account
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-3xl font-bold">{totalConversations}</p>
                <p className="text-blue-100">Total Conversations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-semibold text-gray-900">{totalConversations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-semibold text-gray-900">{conversations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-semibold text-gray-900">+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
              Recent Conversations
            </h3>
            <button
              onClick={refreshConversations}
              disabled={isLoadingChats}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoadingChats ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingChats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start a new chat to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conversations.slice(0, 6).map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          )}
        </div>

        {/* Card Manager */}
        <div className="mb-8">
          <CardManagerWithWebSearch />
        </div>

        {/* Admin Features */}
        {currentUser.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowUserReport(!showUserReport)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">User Management</p>
                  <p className="text-sm text-gray-600">View user listing report</p>
                </div>
              </button>

              <button 
                onClick={() => setShowAllChats(!showAllChats)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Chat Management</p>
                  <p className="text-sm text-gray-600">View all conversations</p>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View detailed analytics</p>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <Settings className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">System Settings</p>
                  <p className="text-sm text-gray-600">Configure system options</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* User Listing Report - Admin Only */}
        {currentUser.role === 'admin' && showUserReport && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Management Report
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshUserList}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowUserReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'admin').length}</div>
                <div className="text-sm text-blue-600">Admin Users</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'user').length}</div>
                <div className="text-sm text-green-600">Regular Users</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{allUsers.filter(u => u.role === 'moderator').length}</div>
                <div className="text-sm text-purple-600">Moderators</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{allUsers.filter(u => u.is_active).length}</div>
                <div className="text-sm text-orange-600">Active Users</div>
              </div>
            </div>

            {/* User Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name / Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDisplayName(user.username)}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'moderator' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {/* Chat Management - Admin Only */}
        {currentUser.role === 'admin' && showAllChats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                Chat Management ({allChats.length} conversations)
              </h3>
              <button
                onClick={() => setShowAllChats(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingAllChats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading all conversations...</p>
              </div>
            ) : allChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{chat.title || 'Untitled'}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(chat.created_at).toLocaleDateString()}
                            </span>
                          </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {chat.last_message || 'No messages yet'}
                    </p>
                      <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{chat.user_email}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {chat.message_count || 0} messages
                      </span>
                        </div>
                      </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Details Modal */}
        {showChatDetails && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chat Details</h3>
                  <button
                  onClick={() => setShowChatDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                  <X className="h-5 w-5" />
                  </button>
                </div>
              
                <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900">{selectedChat.title || 'Untitled'}</p>
                        </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedChat.user_email}</p>
                      </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedChat.created_at).toLocaleString()}</p>
                    </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Messages</label>
                  <p className="text-sm text-gray-900">{selectedChat.message_count || 0}</p>
                </div>
                {selectedChat.last_message && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Message</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedChat.last_message}
                    </p>
                  </div>
                )}
              </div>
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
                <p className="text-sm text-gray-500">Get help with your account</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Bot className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Start New Chat</p>
                <p className="text-sm text-gray-500">Ask our AI assistant</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-500">Manage your profile</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Track your progress</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}