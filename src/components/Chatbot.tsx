import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Mail, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { sendChatMessageToGemini } from '../services/chatbotService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  openChat?: boolean;
  conversationId?: number;
}

export default function Chatbot({ openChat = false, conversationId }: ChatbotProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t.chatbot.welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownEmailPopup, setHasShownEmailPopup] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check authentication status
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

  // Auto-open chatbot if coming from dashboard
  useEffect(() => {
    if (openChat) {
      setIsOpen(true);
    }
  }, [openChat]);

  // Load specific conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      loadSpecificConversation(conversationId);
    }
  }, [conversationId, isAuthenticated]);

  const loadSpecificConversation = (convId: number) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;
      
      const storedChats = localStorage.getItem(`chat_conversations_${currentUser.id}`);
      if (storedChats) {
        const allConversations = JSON.parse(storedChats);
        const conversation = allConversations.find((conv: any) => conv.id === convId);
        
        if (conversation) {
          setMessages(conversation.messages);
          // Add a welcome back message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: `Welcome back! I've loaded your conversation about "${conversation.title}". How can I help you continue?`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [welcomeMessage, ...conversation.messages]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };



  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to Gemini API
      const result = await sendChatMessageToGemini(userMessage.text);
      
      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Save conversation to localStorage if user is authenticated
        if (isAuthenticated && messages.length >= 1) {
          saveConversationToLocalStorage();
        }
      } else {
        // Handle API error with a fallback message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I apologize, but I'm experiencing technical difficulties. Please try again later. (Error: ${result.message})`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an unexpected error. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveConversationToLocalStorage = () => {
    if (!isAuthenticated || messages.length < 2) return;
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;
      
      const conversation = {
        id: Date.now(),
        title: generateConversationTitle(messages),
        date: new Date().toISOString(),
        messages: messages,
        summary: generateConversationSummary(messages)
      };
      
      // Get existing conversations
      const existingConversations = localStorage.getItem(`chat_conversations_${currentUser.id}`);
      let allConversations = existingConversations ? JSON.parse(existingConversations) : [];
      
      // Add new conversation
      allConversations.unshift(conversation);
      
      // Keep only last 10 conversations
      allConversations = allConversations.slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem(`chat_conversations_${currentUser.id}`, JSON.stringify(allConversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const generateConversationTitle = (msgs: Message[]): string => {
    if (msgs.length === 0) return 'New Conversation';
    
    const firstUserMessage = msgs.find(msg => msg.sender === 'user');
    if (!firstUserMessage) return 'New Conversation';
    
    const text = firstUserMessage.text;
    if (text.length <= 30) return text;
    return text.substring(0, 30) + '...';
  };

  const generateConversationSummary = (msgs: Message[]): string => {
    if (msgs.length === 0) return 'No messages';
    
    const userMessages = msgs.filter(msg => msg.sender === 'user');
    if (userMessages.length === 0) return 'No user messages';
    
    const firstUserMessage = userMessages[0].text;
    if (firstUserMessage.length <= 50) return firstUserMessage;
    return firstUserMessage.substring(0, 50) + '...';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || !userFirstName.trim() || !userLastName.trim()) return;

    setIsEmailSubmitting(true);
    
    try {
      // Here you would typically send the email via your backend
      // For now, we'll simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close popup and show success message
      setShowEmailPopup(false);
      setEmailSubmitted(true); // Mark email as submitted
      
      // Add a success message to the chat
      const successMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Transcript sent successfully to ${userEmail}!\n\nDear ${userFirstName} ${userLastName},\n\nYour email includes:\n• Complete conversation with timestamps\n• Key investment insights discussed\n• Actionable recommendations\n• Summary of important points\n\nCheck your inbox for the detailed transcript. You can also request additional transcripts anytime using the button below.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const closeEmailPopup = () => {
    setShowEmailPopup(false);
    setUserEmail('');
    setUserFirstName('');
    setUserLastName('');
    setEmailSubmitted(false); // Reset email submission status
  };

  const handleLogin = () => {
    setShowAuthOptions(false);
    setIsOpen(false);
    navigate('/login');
  };

  const handleSignup = () => {
    setShowAuthOptions(false);
    setIsOpen(false);
    navigate('/signup', { 
      state: { 
        from: '/dashboard' // Redirect to dashboard after signup and login
      } 
    });
  };

  const handleSaveToAccount = () => {
    if (isAuthenticated) {
      // User is authenticated, show email popup
      setShowEmailPopup(true);
    } else {
      // User is not authenticated, show auth options
      setShowAuthOptions(true);
    }
  };

  const handleCloseChat = async () => {
    // If user has provided email and there are messages, offer to send transcript
    if (emailSubmitted && messages.length > 1) {
      const shouldSend = window.confirm(
        `Would you like me to send the complete conversation transcript to ${userFirstName} ${userLastName} at ${userEmail}?`
      );
      
      if (shouldSend) {
        try {
          // Simulate sending the transcript
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert(`Transcript sent to ${userFirstName} ${userLastName} at ${userEmail}! Check your inbox.`);
        } catch (error) {
          console.error('Error sending transcript:', error);
        }
      }
    }
    
    setIsOpen(false);
  };

  const formatConversationForEmail = () => {
    return messages.map(msg => {
      const time = msg.timestamp.toLocaleTimeString();
      const sender = msg.sender === 'user' ? 'You' : 'AI Assistant';
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');
  };

  return (
    <>
      {/* Email Collection Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {emailSubmitted ? 'Update Email Address' : 'Send Chat Transcript'}
              </h3>
              <p className="text-gray-600">
                {emailSubmitted 
                  ? 'Change your email address to receive future chat transcripts.'
                  : 'Get the complete AI conversation sent directly to your inbox. Perfect for saving important investment advice and insights.'
                }
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeEmailPopup}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEmailSubmitting || !userEmail.trim() || !userFirstName.trim() || !userLastName.trim()}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isEmailSubmitting ? 'Sending...' : (emailSubmitted ? 'Update Email' : 'Send Transcript')}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {emailSubmitted 
                  ? 'We\'ll send future transcripts to your new email address'
                  : 'We\'ll send you a complete transcript of this conversation'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Options Popup */}
      {showAuthOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Save Conversation to Your Account
              </h3>
              <p className="text-gray-600">
                Create an account or sign in to save this conversation and access it anytime from your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSignup}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </button>
              
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
              
              <button
                onClick={() => setShowAuthOptions(false)}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Maybe Later
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Your conversation will be saved securely and accessible from your account dashboard
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t.chatbot.title}</h3>
                <p className="text-sm text-blue-100">{t.chatbot.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmailPopup(true)}
                className={`p-2 rounded-lg transition-colors ${
                  emailSubmitted 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                }`}
                title={emailSubmitted ? 'Email registered - Click to update' : 'Send transcript to email'}
              >
                <Mail className="h-4 w-4" />
              </button>
              <button
                onClick={handleCloseChat}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {emailSubmitted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Transcripts will be sent to: <span className="font-medium">{userFirstName} {userLastName}</span> at <span className="font-medium">{userEmail}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEmailPopup(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
            
                               {messages.length > 1 && !emailSubmitted && (
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <div className="bg-blue-100 p-2 rounded-full">
                             <Mail className="h-4 w-4 text-blue-600" />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-blue-900">
                               Save This Conversation
                             </p>
                             <p className="text-xs text-blue-700">
                               {isAuthenticated 
                                 ? 'Get a complete transcript sent to your email'
                                 : 'Create an account to save and access this conversation anytime'
                               }
                             </p>
                           </div>
                         </div>
                         <button
                           onClick={handleSaveToAccount}
                           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                         >
                           {isAuthenticated ? 'Send Transcript' : 'Save to Account'}
                         </button>
                       </div>
                     </div>
                   )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
                               {/* Info message about transcript feature */}
                   {messages.length === 1 && (
                     <div className="flex justify-start">
                       <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg max-w-[80%]">
                         <p className="text-sm text-blue-800">
                           💡 <strong>Tip:</strong> After our conversation, you can save it to your account or get a transcript sent to your email for future reference.
                         </p>
                       </div>
                     </div>
                   )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
                               {/* Send Transcript Button */}
                   {messages.length > 1 && (
                     <div className="mb-3 flex justify-center">
                       <button
                         onClick={handleSaveToAccount}
                         className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${
                           emailSubmitted 
                             ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' 
                             : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md'
                         }`}
                       >
                         <Mail className="h-4 w-4" />
                         <span>
                           {emailSubmitted 
                             ? 'Update Email' 
                             : isAuthenticated 
                               ? 'Send Transcript to Email' 
                               : 'Save to Account'
                           }
                         </span>
                       </button>
                     </div>
                   )}
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTyping ? "AI is typing..." : t.chatbot.placeholder}
                disabled={isTyping}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}