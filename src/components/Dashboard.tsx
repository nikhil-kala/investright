import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, BarChart3, Users, Shield, Activity, Calendar, TrendingUp, MessageCircle, Clock, Bot, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { authService, User as UserType } from '../services/authService';
import { chatService, ConversationSummary } from '../services/chatService';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showUserReport, setShowUserReport] = useState(false);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);
  const [allChats, setAllChats] = useState<any[]>([]);
  const [isLoadingAllChats, setIsLoadingAllChats] = useState(false);
  const [chatStats, setChatStats] = useState<any>({});
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      
      // Count total users if admin
      if (user.role === 'admin') {
        setTotalUsers(countTotalUsers());
      }
    }
    setIsLoading(false);
  }, [navigate]);

  // Load user list when user report is shown
  useEffect(() => {
    if (showUserReport && currentUser?.role === 'admin') {
      refreshUserList();
    }
  }, [showUserReport, currentUser]);

  // Load all chats when admin chat view is shown
  useEffect(() => {
    if (showAllChats && currentUser?.role === 'admin') {
      loadAllChats();
      loadChatStats();
    }
  }, [showAllChats, currentUser]);

  const loadChatConversations = async (user: UserType) => {
    setIsLoadingChats(true);
    try {
      // Try to load conversations from Supabase first
      const result = await chatService.getUserConversations(user.email);
      
      if (result.success && result.conversations) {
        // Convert ConversationSummary to the format expected by the component
        const convertedConversations = result.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          date: conv.last_message_at.toISOString(),
          messages: [], // We don't need full messages for the list view
          summary: conv.summary
        }));
        
        setChatConversations(convertedConversations);
        
        // Also store locally as backup
        localStorage.setItem(`chat_conversations_${user.id}`, JSON.stringify(convertedConversations));
      } else {
        // Fallback to localStorage if Supabase fails
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
      }
    } catch (error) {
      console.error('Error loading chat conversations:', error);
      // Fallback to localStorage
      const storedChats = localStorage.getItem(`chat_conversations_${user.id}`);
      if (storedChats) {
        setChatConversations(JSON.parse(storedChats));
      }
    } finally {
      setIsLoadingChats(false);
    }
  };

  const countTotalUsers = () => {
    let count = 0;
    try {
      // Count users from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          count++;
        }
      }
      
      // Also count from the general users array if it exists
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        if (Array.isArray(parsedUsers)) {
          count = Math.max(count, parsedUsers.length);
        }
      }
    } catch (error) {
      console.error('Error counting users:', error);
    }
    return count;
  };

  const refreshUserList = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    setIsLoadingUsers(true);
    try {
      const users = await authService.getAllUsers();
      setAllUsers(users);
      setTotalUsers(users.length);
    } catch (error) {
      console.error('Error refreshing user list:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadAllChats = async () => {
    if (currentUser?.role !== 'admin') return;

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

  const loadChatStats = async () => {
    if (currentUser?.role !== 'admin') return;

    try {
      console.log('Admin: Loading chat statistics...');
      const result = await chatService.getConversationStats();
      
      if (result.success && result.stats) {
        console.log('Admin: Loaded chat stats:', result.stats);
        setChatStats(result.stats);
      } else {
        console.error('Error loading chat stats:', result.error);
        setChatStats({});
      }
    } catch (error) {
      console.error('Error loading chat stats:', error);
      setChatStats({});
    }
  };

  const handleViewChatDetails = (chat: any) => {
    setSelectedChat(chat);
  };

  const handleCloseChatDetails = () => {
    setSelectedChat(null);
  };

  const filteredChats = allChats.filter(chat => 
    chat.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetPassword = async (userId: number, username: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const newPassword = prompt(`Enter new password for user ${username}:`);
    if (!newPassword || newPassword.trim() === '') {
      alert('Password cannot be empty');
      return;
    }
    
    try {
      const result = await authService.resetUserPassword(userId, newPassword);
      if (result.success) {
        alert(`Password reset successfully for ${username}`);
        // Refresh the user list to show updated data
        refreshUserList();
      } else {
        alert(`Failed to reset password: ${result.message}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('An error occurred while resetting the password');
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
              <div className="flex items-center space-x-3">
                {/* InvestRight Logo */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <div className="relative">
                      {/* Upward trending line */}
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M3 18L9 12L15 16L21 6" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      {/* Green circle at peak */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      {/* Green arrow above */}
                      <div className="absolute -top-2.5 -right-1 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-green-500"></div>
                    </div>
                  </div>
                </div>
                {/* Company Name */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-blue-700">Invest</span>
                  <span className="text-lg font-bold text-green-600 -mt-1">Right</span>
                </div>
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
              <div className="relative">
                {/* Upward trending line */}
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M3 18L9 12L15 16L21 6" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Green circle at peak */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                {/* Green arrow above */}
                <div className="absolute -top-4 -right-1 w-0 h-0 border-l-3 border-r-3 border-b-5 border-l-transparent border-r-transparent border-b-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

          {/* Total Users - Only show for admin */}
          {currentUser.role === 'admin' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}
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

        {/* User Listing Report - Admin Only */}
        {currentUser.role === 'admin' && showUserReport && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Listing Report
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Total Users: {allUsers.length}
                </span>
                <button
                  onClick={refreshUserList}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No users found</h4>
                <p className="text-gray-600">No registered users in the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username.split('.')[0] || user.username} {user.username.split('.')[1] || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : user.role === 'moderator'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString() + ' ' + 
                              new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleResetPassword(user.id, user.username)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                Hide
              </button>
            </div>

            {/* Chat Statistics */}
            {chatStats && Object.keys(chatStats).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Conversations</p>
                      <p className="text-2xl font-bold text-blue-900">{chatStats.totalConversations || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Messages</p>
                      <p className="text-2xl font-bold text-green-900">{chatStats.totalMessages || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Active Users</p>
                      <p className="text-2xl font-bold text-purple-900">{chatStats.uniqueUsers || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">This Week</p>
                      <p className="text-2xl font-bold text-orange-900">{chatStats.conversationsThisWeek || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search conversations by user email, title, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Loading State */}
            {isLoadingAllChats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading conversations...</p>
              </div>
            ) : (
              /* Conversations List */
              <div className="space-y-4">
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat, index) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {chat.user_email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{chat.user_email}</p>
                            <p className="text-sm text-gray-600">{chat.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {chat.message_count} messages
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(chat.last_message_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{chat.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Created: {new Date(chat.created_at).toLocaleDateString()}</span>
                          <span>Last activity: {new Date(chat.last_message_at).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handleViewChatDetails(chat)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'No conversations match your search.' : 'No conversations found.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Details Modal */}
        {selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Conversation Details</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      User: {selectedChat.user_email} • {selectedChat.message_count} messages
                    </p>
                  </div>
                  <button
                    onClick={handleCloseChatDetails}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-4">
                  {selectedChat.messages && selectedChat.messages.map((message: any, index: number) => (
                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.sender === 'user' ? 'User' : 'InvestRight Bot'}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
