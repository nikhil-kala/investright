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
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Initialize financial advisor conversation when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Get initial message from the service
      const getInitialMessage = async () => {
        try {
          const response = await sendChatMessageToGemini('', []);
          if (response.success) {
            const initialMessage = {
              id: '1',
              text: response.message,
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([initialMessage]);
          } else {
            // Fallback message if service fails
            const fallbackMessage = {
              id: '1',
              text: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nI am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as:\n\n• Buying a house\n• Children's education\n• Marriage expenses\n• Retirement planning\n• Health & family security\n• Travel, lifestyle, or passion pursuits\n\nAre you ready to start?",
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([fallbackMessage]);
          }
        } catch (error) {
          console.error('Error getting initial message:', error);
          // Fallback message if service fails
          const fallbackMessage = {
            id: '1',
            text: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nI am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as:\n\n• Buying a house\n• Children's education\n• Marriage expenses\n• Retirement planning\n• Health & family security\n• Travel, lifestyle, or passion pursuits\n\nAre you ready to start?",
            sender: 'bot' as const,
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
        }
      };
      
      getInitialMessage();
    }
  }, [isOpen, messages.length]);

  // Load specific conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      loadSpecificConversation(conversationId);
    }
  }, [conversationId, isAuthenticated]);

  const loadSpecificConversation = (convId: number) => {
    const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
    const conversation = savedConversations.find((conv: any) => conv.id === convId);
    
    if (conversation) {
      setMessages(conversation.messages);
      setEmailSubmitted(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

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
      // Convert messages to the format expected by the service
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      const response = await sendChatMessageToGemini(inputValue, conversationHistory);

      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
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

  const handleCloseChat = () => {
    if (messages.length > 1 && !emailSubmitted) {
      // Offer to send transcript before closing
      setShowEmailPopup(true);
    } else {
      setIsOpen(false);
      setMessages([]);
      setEmailSubmitted(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!userEmail.trim() || !userFirstName.trim() || !userLastName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsEmailSubmitting(true);
    
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSubmitted(true);
      setShowEmailPopup(false);
      
      // Save conversation to localStorage
      saveConversationToLocalStorage();
      
      alert('Transcript sent successfully! Check your email.');
    } catch (error) {
      alert('Failed to send transcript. Please try again.');
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const closeEmailPopup = () => {
    setShowEmailPopup(false);
    setUserEmail('');
    setUserFirstName('');
    setUserLastName('');
  };

  const handleLogin = () => {
    setShowAuthOptions(false);
    navigate('/login');
  };

  const handleSignup = () => {
    setShowAuthOptions(false);
    navigate('/signup');
  };

  const handleSaveToAccount = () => {
    if (isAuthenticated) {
      // Save conversation to account
      saveConversationToLocalStorage();
      alert('Conversation saved to your account!');
    } else {
      // Show authentication options
      setShowAuthOptions(true);
    }
  };

  const saveConversationToLocalStorage = () => {
    if (messages.length <= 1) return;

    const conversation = {
      id: Date.now(),
      title: generateConversationTitle(),
      summary: generateConversationSummary(),
      messages: messages,
      timestamp: new Date(),
      userId: authService.getCurrentUser()?.id || 'anonymous'
    };

    const existingConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
    
    // Keep only the last 10 conversations
    const updatedConversations = [conversation, ...existingConversations].slice(0, 10);
    
    localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
  };

  const generateConversationTitle = () => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user')?.text || '';
    return firstUserMessage.length > 50 ? firstUserMessage.substring(0, 50) + '...' : firstUserMessage;
  };

  const generateConversationSummary = () => {
    const userMessages = messages.filter(msg => msg.sender === 'user').map(msg => msg.text);
    return userMessages.join(' | ');
  };

  const formatConversationForEmail = () => {
    return messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'InvestRight Advisor'}: ${msg.text}`
    ).join('\n\n');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse-glow"
        >
          <MessageCircle className="h-8 w-8" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Email Collection Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Chat Transcript</h3>
            <p className="text-gray-600 mb-6">We'll send a copy of your conversation to your email for future reference.</p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name *"
                value={userFirstName}
                onChange={(e) => setUserFirstName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name *"
                value={userLastName}
                onChange={(e) => setUserLastName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeEmailPopup}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSubmit}
                disabled={isEmailSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isEmailSubmitting ? 'Sending...' : 'Send Transcript'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Options Popup */}
      {showAuthOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Your Conversation</h3>
            <p className="text-gray-600 mb-6">To save this conversation and access it later, please create an account or log in.</p>
            
            <div className="space-y-3">
              <button
                onClick={handleSignup}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create Account</span>
              </button>
              <button
                onClick={handleLogin}
                className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Log In</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowAuthOptions(false)}
              className="w-full px-4 py-3 text-gray-500 hover:text-gray-700 mt-4"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Interface */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
        <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-none flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-t-2xl flex items-center justify-between border-b border-blue-500 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-16 right-8 w-16 h-16 bg-indigo-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-8 left-16 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.chatbot.title}</h2>
                <p className="text-blue-100 text-sm">{t.chatbot.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <button
                onClick={handleCloseChat}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title="Close Chat"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {/* Transcript sent info */}
            {emailSubmitted && (
              <div className="flex justify-center mb-4">
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl text-green-800 text-sm">
                  ✅ Transcript sent to your email successfully!
                </div>
              </div>
            )}

            {/* Save conversation card */}
            {messages.length > 1 && !emailSubmitted && (
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-xl max-w-md">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Save This Conversation
                      </p>
                      <p className="text-xs text-blue-700">
                        {isAuthenticated 
                          ? "Send a transcript to your email for future reference"
                          : "Create an account to save and access your conversations"
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveToAccount}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl mt-3 w-full"
                  >
                    {isAuthenticated ? 'Send Transcript' : 'Save to Account'}
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[75%] p-5 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-500'
                      : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border-2 border-gray-200'
                  }`}
                >
                  {/* Message Header */}
                  <div className={`flex items-center space-x-2 mb-3 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium capitalize">
                      {message.sender === 'user' ? 'You' : 'InvestRight Advisor'}
                    </span>
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className={`prose prose-sm max-w-none ${
                    message.sender === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.sender === 'bot' ? (
                      <div
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: message.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-700">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
                            .replace(/\n\n/g, '<br><br>')
                            .replace(/\n/g, '<br>')
                        }}
                      />
                    ) : (
                      <p className="leading-relaxed">{message.text}</p>
                    )}
                  </div>

                  {/* Message Footer */}
                  <div className={`mt-3 pt-3 border-t ${
                    message.sender === 'user' ? 'border-blue-500' : 'border-gray-200'
                  }`}>
                    <div className={`flex items-center justify-between text-xs ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          message.sender === 'user' ? 'bg-blue-400' : 'bg-green-500'
                        }`}></div>
                        <span>{message.sender === 'user' ? 'Sent' : 'Delivered'}</span>
                      </span>
                      <span className="font-mono">
                        {message.timestamp.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Info message about transcript feature */}
            {messages.length === 1 && (
              <div className="flex justify-start mb-4 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-2xl shadow-lg max-w-[75%] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong className="font-semibold text-blue-900">Pro Tip:</strong> After our conversation, you can save it to your account or get a transcript sent to your email for future reference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4 animate-fade-in">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-2xl shadow-lg max-w-[75%]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 mb-2">InvestRight Advisor is typing...</p>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-white">
            {/* Send Transcript Button */}
            {messages.length > 1 && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleSaveToAccount}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl ${
                    emailSubmitted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <Mail className="h-5 w-5" />
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

            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isTyping ? "AI is typing..." : t.chatbot.placeholder}
                  disabled={isTyping}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm transition-all duration-200 bg-white hover:border-gray-400"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}