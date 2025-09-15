import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, BarChart3, Users, Shield, Activity, Calendar, TrendingUp, MessageCircle, Clock, Bot, X, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { authService, User as UserType } from '../services/authService';
import { chatService } from '../services/chatService';
import CardManager from './CardManagerWithErrorHandling';

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
          
          {conversation.summary && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
              {conversation.summary}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(conversation.created_at || conversation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bot className="h-3 w-3" />
                <span>AI Assistant</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full group-hover:bg-green-600 transition-colors"></div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
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
  const [isMigratingUsers, setIsMigratingUsers] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  
  // Enhanced chat conversation management
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatSortBy, setChatSortBy] = useState<'date' | 'title' | 'messages'>('date');
  const [chatSortOrder, setChatSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chatFilterDate, setChatFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage, setConversationsPerPage] = useState(10);
  const [groupByDate, setGroupByDate] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Helper function to get first name only
  const getFirstName = (username: string) => {
    const parts = username.split('.');
    if (parts.length >= 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  };


  // Helper function to filter conversations by date
  const filterConversationsByDate = (conversations: any[], filter: string) => {
    if (filter === 'all') return conversations;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (filter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setDate(now.getDate() - 30);
        break;
    }
    
    return conversations.filter(conv => new Date(conv.date) >= filterDate);
  };

  // Helper function to sort conversations
  const sortConversations = (conversations: any[], sortBy: string, order: string) => {
    return [...conversations].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'messages':
          aValue = a.message_count || a.messages?.length || 0;
          bValue = b.message_count || b.messages?.length || 0;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Helper function to search conversations
  const searchConversations = (conversations: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(term) ||
      conv.summary?.toLowerCase().includes(term) ||
      conv.messages?.some((msg: any) => msg.text?.toLowerCase().includes(term))
    );
  };

  // Get filtered and sorted conversations
  const getProcessedConversations = () => {
    let processed = [...chatConversations];
    
    // Apply search filter
    processed = searchConversations(processed, chatSearchTerm);
    
    // Apply date filter
    processed = filterConversationsByDate(processed, chatFilterDate);
    
    // Apply sorting
    processed = sortConversations(processed, chatSortBy, chatSortOrder);
    
    return processed;
  };

  // Get paginated conversations
  const getPaginatedConversations = () => {
    const processed = getProcessedConversations();
    const startIndex = (currentPage - 1) * conversationsPerPage;
    const endIndex = startIndex + conversationsPerPage;
    const paginated = processed.slice(startIndex, endIndex);
    
    console.log('Pagination Debug:', {
      total: processed.length,
      perPage: conversationsPerPage,
      currentPage,
      startIndex,
      endIndex,
      paginatedCount: paginated.length,
      totalPages: getTotalPages()
    });
    
    return paginated;
  };


  // Get total pages
  const getTotalPages = () => {
    const processed = getProcessedConversations();
    return Math.ceil(processed.length / conversationsPerPage);
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get current user
    const user = authService.getCurrentUser();
    if (user) {
      // Force fix the created_at date
      const today = new Date().toDateString();
      const userCreatedDate = new Date(user.created_at).toDateString();
      
      console.log('Date comparison:', {
        userCreatedDate,
        today,
        isToday: userCreatedDate === today,
        userEmail: user.email
      });
      
      if (userCreatedDate === today) {
        console.log('Fixing created_at date for user:', user.email);
        
        // Set to 30 days ago for demo accounts, 15 days ago for others
        const daysAgo = user.email === 'demo@investright.com' ? 30 : 15;
        const newCreatedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        // Update the user object directly
        const fixedUser = {
          ...user,
          created_at: newCreatedAt
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(fixedUser));
        
        // Update auth service (using public method)
        // Note: We'll update the user through the service's internal state
        
        console.log('Fixed created_at from', user.created_at, 'to', newCreatedAt);
        
        // Force update the current user state
        setCurrentUser(fixedUser);
        
        // Force a re-render
        setForceUpdate(prev => prev + 1);
        
        loadChatConversations(fixedUser);
      } else {
      setCurrentUser(user);
      loadChatConversations(user);
      }
      
      // Count total users if admin
      if (user.role === 'admin') {
        setTotalUsers(countTotalUsers());
      }
    }
    setIsLoading(false);
  }, [navigate]);

  // Refresh conversations when user returns to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        console.log('Dashboard: Page became visible, refreshing conversations...');
        loadChatConversations(currentUser);
      }
    };

    const handleFocus = () => {
      if (currentUser) {
        console.log('Dashboard: Window focused, refreshing conversations...');
        loadChatConversations(currentUser);
      }
    };

    // Listen for custom events when conversations are saved
    const handleConversationSaved = () => {
      if (currentUser) {
        console.log('Dashboard: Conversation saved event detected, refreshing...');
        setTimeout(() => {
          loadChatConversations(currentUser);
        }, 1000); // Small delay to ensure database is updated
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('conversationSaved', handleConversationSaved);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('conversationSaved', handleConversationSaved);
    };
  }, [currentUser]);

  // Load user list when user report is shown
  useEffect(() => {
    if (showUserReport && currentUser?.role === 'admin') {
      refreshUserList();
    }
  }, [showUserReport, currentUser]);

  // Load users immediately when admin user logs in
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      // Load users immediately and also after a small delay to ensure component is fully mounted
      refreshUserList();
      setTimeout(() => {
        refreshUserList();
      }, 500);
    }
  }, [currentUser]);

  // Load all chats when admin chat view is shown
  useEffect(() => {
    if (showAllChats && currentUser?.role === 'admin') {
      loadAllChats();
      loadChatStats();
    }
  }, [showAllChats, currentUser]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [chatSearchTerm, chatSortBy, chatSortOrder, chatFilterDate, conversationsPerPage]);

  const loadChatConversations = async (user: UserType) => {
    setIsLoadingChats(true);
    try {
      console.log('Dashboard: Loading conversations for user:', user.email);
      
      // Try to load conversations from Supabase first
      const result = await chatService.getUserConversations(user.email);
      
      if (result.success && result.conversations) {
        console.log('Dashboard: Found', result.conversations.length, 'conversations from database');
        
        // Convert ConversationSummary to the format expected by the component
        const convertedConversations = result.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          date: conv.last_message_at.toISOString(),
          messages: [], // We don't need full messages for the list view
          summary: conv.summary,
          message_count: conv.message_count
        }));
        
        setChatConversations(convertedConversations);
        
        // Also store locally as backup
        localStorage.setItem(`chat_conversations_${user.id}`, JSON.stringify(convertedConversations));
        
        console.log('Dashboard: Successfully loaded conversations:', convertedConversations.length);
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

  // Add refresh button for conversations
  const refreshConversations = async () => {
    if (currentUser) {
      console.log('Dashboard: Manual refresh triggered');
      await loadChatConversations(currentUser);
      setRefreshKey(prev => prev + 1); // Force re-render
    }
  };

  const countTotalUsers = () => {
    let count = 0;
    try {
      // First try to get from the allUsers state if available
      if (allUsers && allUsers.length > 0) {
        count = allUsers.length;
        return count;
      }
      
      // Try to get from localStorage users
      const users = localStorage.getItem('users');
      if (users) {
        try {
        const parsedUsers = JSON.parse(users);
        if (Array.isArray(parsedUsers)) {
            count = parsedUsers.length;
            return count;
          }
        } catch (parseError) {
          console.error('Dashboard: Error parsing localStorage users:', parseError);
        }
      }
      
      // Try to get from dashboard_users
      const dashboardUsers = localStorage.getItem('dashboard_users');
      if (dashboardUsers) {
        try {
          const parsedUsers = JSON.parse(dashboardUsers);
          if (Array.isArray(parsedUsers)) {
            count = parsedUsers.length;
            return count;
          }
        } catch (parseError) {
          console.error('Dashboard: Error parsing dashboard_users:', parseError);
        }
      }
      
      // Count users from localStorage keys (fallback method)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          count++;
        }
      }
    } catch (error) {
      console.error('Dashboard: Error counting users:', error);
    }
    return count;
  };

  const refreshUserList = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }
    
    setIsLoadingUsers(true);
    try {
      const users = await authService.getAllUsers();
      setAllUsers(users);
      setTotalUsers(users.length);
      
      // Store in localStorage for persistence
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

  const handleMigrateUsers = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setIsMigratingUsers(true);
    setMigrationResult(null);
    try {
      const result = await authService.migrateLocalUsersToSupabase();
      const summary = `Migrated: ${result.migrated}, Errors: ${result.errors}${result.details && result.details.length ? `\n${result.details.slice(0,5).join('\n')}${result.details.length>5 ? '\n...' : ''}` : ''}`;
      setMigrationResult(summary);
      // Refresh lists after migration
      await refreshUserList();
    } catch (e) {
      setMigrationResult('Migration failed.');
    } finally {
      setIsMigratingUsers(false);
    }
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
                  {formatDisplayName(currentUser.username)}
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>Home</span>
              </button>
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
                Welcome back, {getFirstName(currentUser.username)}! 👋
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
                {/* Debug info - remove this later */}
                <p className="text-xs text-gray-400">
                  Debug: {currentUser.created_at} (Force update: {forceUpdate})
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

        {/* Enhanced Chat Conversations - NEW ORGANIZED VERSION */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-8">
          {/* NEW VERSION BANNER */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ✨ NEW ORGANIZED CHAT VIEW ACTIVE
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>Enhanced with stats, grouping, search, and beautiful cards!</p>
                </div>
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ✨ New Organized View
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  📄 Pagination: {conversationsPerPage} per page
                </span>
                {getTotalPages() > 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
            <button
              onClick={refreshConversations}
              disabled={isLoadingChats}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <svg className={`h-4 w-4 ${isLoadingChats ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Refresh</span>
            </button>
            <button 
              onClick={() => navigate('/chat')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                Start New Chat
            </button>
            </div>
          </div>

          {/* Quick Stats */}
          {chatConversations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Chats</p>
                    <p className="text-2xl font-bold text-blue-900">{chatConversations.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">This Week</p>
                    <p className="text-2xl font-bold text-green-900">
                      {chatConversations.filter(chat => {
                        const chatDate = new Date(chat.created_at || chat.date);
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return chatDate > weekAgo;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Total Messages</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {chatConversations.reduce((total, chat) => total + (chat.message_count || chat.messages?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {chatConversations.filter(chat => {
                        const chatDate = new Date(chat.created_at || chat.date);
                        const today = new Date();
                        return chatDate.toDateString() === today.toDateString();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          {chatConversations.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations by title or content..."
                  value={chatSearchTerm}
                  onChange={(e) => setChatSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Date Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={chatFilterDate}
                    onChange={(e) => setChatFilterDate(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={chatSortBy}
                    onChange={(e) => setChatSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="messages">Message Count</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Order:</label>
                  <select
                    value={chatSortOrder}
                    onChange={(e) => setChatSortOrder(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Group by date:</label>
                    <button
                      onClick={() => setGroupByDate(!groupByDate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        groupByDate ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          groupByDate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Results Count */}
                  <div className="text-sm text-gray-600">
                    {getProcessedConversations().length} of {chatConversations.length} conversations
                    {getTotalPages() > 1 && (
                      <span className="ml-2 text-blue-600">
                        (Page {currentPage} of {getTotalPages()})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                onClick={() => navigate('/chat')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Your First Chat
              </button>
            </div>
          ) : getProcessedConversations().length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h4>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button 
                onClick={() => {
                  setChatSearchTerm('');
                  setChatFilterDate('all');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
                        </div>
          ) : (
            <div>
              {/* Conversations List */}
              <div key={refreshKey} className="space-y-6">
                {(() => {
                  console.log('Rendering conversations with new organized view:', {
                    groupByDate,
                    totalConversations: chatConversations.length,
                    refreshKey
                  });
                  return null;
                })()}
                {groupByDate ? (
                  // Grouped by date view - show paginated results
                  (() => {
                    const paginatedConversations = getPaginatedConversations();
                    const grouped = paginatedConversations.reduce((groups: any, conversation) => {
                      const date = new Date(conversation.created_at || conversation.date);
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
                    
                    return Object.entries(grouped).map(([groupKey, conversations]) => (
                    <div key={groupKey}>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {groupKey}
                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {(conversations as any[]).length}
                        </span>
                      </h4>
                      <div className="grid gap-3">
                        {(conversations as any[]).map((conversation: any) => (
                          <ConversationCard key={conversation.id} conversation={conversation} />
                        ))}
                      </div>
                        </div>
                    ));
                  })()
                ) : (
                  // Paginated view
                  <div className="grid gap-3">
                    {getPaginatedConversations().map((conversation: any) => (
                      <ConversationCard key={conversation.id} conversation={conversation} />
                    ))}
                        </div>
                )}
                      </div>

              {/* Pagination - Show for both grouped and non-grouped views */}
              {getTotalPages() > 1 && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Page {currentPage} of {getTotalPages()}</span>
                      <span className="ml-2 text-gray-500">
                        Showing {((currentPage - 1) * conversationsPerPage) + 1} to {Math.min(currentPage * conversationsPerPage, getProcessedConversations().length)} of {getProcessedConversations().length} conversations
                      </span>
                    </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Show:</label>
                      <select
                        value={conversationsPerPage}
                        onChange={(e) => {
                          setConversationsPerPage(Number(e.target.value));
                          setCurrentPage(1); // Reset to first page
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                      </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                        const pageNum = i + 1;
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
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                      disabled={currentPage === getTotalPages()}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
              
              <button onClick={handleMigrateUsers} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50" disabled={isMigratingUsers}>
                <RefreshCcw className={`h-5 w-5 ${isMigratingUsers ? 'text-gray-400 animate-spin' : 'text-blue-600'}`} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Migrate Users</p>
                  <p className="text-sm text-gray-600">Move local users to database</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Migration Result Notice */}
        {currentUser.role === 'admin' && migrationResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <div className="font-medium mb-1">User Migration Result</div>
            <pre className="whitespace-pre-wrap">{migrationResult}</pre>
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
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mr-2"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('users');
                    localStorage.removeItem('dashboard_users');
                    refreshUserList();
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Force Refresh
                </button>
              </div>
            </div>

            {/* User Statistics */}
            {allUsers.length > 0 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'admin').length}</div>
                  <div className="text-sm text-blue-600">Admin Users</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'user').length}</div>
                  <div className="text-sm text-green-600">Regular Users</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{allUsers.filter(u => u.role === 'moderator').length}</div>
                  <div className="text-sm text-yellow-600">Moderators</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{allUsers.filter(u => u.is_active).length}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
            )}

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
                <button
                  onClick={refreshUserList}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
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
                        Name / Email
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
                                {formatDisplayName(user.username)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDisplayName(user.username)}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
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
                  filteredChats.map((chat) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {chat.user_email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {(() => {
                                // Try to find user by email to get their name
                                const user = allUsers.find(u => u.email === chat.user_email);
                                return user ? formatDisplayName(user.username) : chat.user_email;
                              })()}
                            </p>
                            <p className="text-sm text-gray-600">{chat.title}</p>
                            <p className="text-xs text-gray-500">{chat.user_email}</p>
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
                      User: {(() => {
                        const user = allUsers.find(u => u.email === selectedChat.user_email);
                        return user ? formatDisplayName(user.username) : selectedChat.user_email;
                      })()} • {selectedChat.message_count} messages
                    </p>
                    <p className="text-xs text-gray-500">
                      Email: {selectedChat.user_email}
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

        {/* Card Manager */}
        <div className="mb-8">
          <CardManager />
        </div>

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
