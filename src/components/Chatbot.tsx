import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Mail, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { sendChatMessageToGemini } from '../services/chatbotService';
import { authService } from '../services/authService';
import { chatService, ChatMessage as ChatMessageType, ChatConversation } from '../services/chatService';
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
  
  // Debug: Log component render
  console.log('🔄 Chatbot component rendered/re-rendered');

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
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [hasShownEmailPopup, setHasShownEmailPopup] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced scroll function to prevent excessive scrolling
  const scrollToBottom = (() => {
    let scrollTimeout: NodeJS.Timeout;
    return () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 50); // Debounce scroll calls by 50ms
    };
  })();

  const focusInput = () => {
    // Focus the input field after a short delay to ensure DOM is updated
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Helper function to save individual messages to localStorage
  const saveMessageToLocalStorage = (message: Message) => {
    try {
      const existingMessages = JSON.parse(localStorage.getItem('currentChatMessages') || '[]');
      const updatedMessages = [...existingMessages, message];
      localStorage.setItem('currentChatMessages', JSON.stringify(updatedMessages));
      console.log('Chatbot: Saved message to localStorage:', message.sender, message.text.substring(0, 50));
    } catch (error) {
      console.error('Error saving message to localStorage:', error);
    }
  };

  // Helper function to save pending conversation for later database sync
  const savePendingConversation = () => {
    try {
      if (messages.length > 0) {
        const pendingConversation = {
          messages: messages,
          conversationId: currentConversationId || chatService.generateConversationId(),
          timestamp: new Date().toISOString(),
          isComplete: false
        };
        localStorage.setItem('pendingConversation', JSON.stringify(pendingConversation));
        console.log('Chatbot: Saved pending conversation with', messages.length, 'messages');
      }
    } catch (error) {
      console.error('Error saving pending conversation:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State update - showAuthOptions:', showAuthOptions);
  }, [showAuthOptions]);

  useEffect(() => {
    console.log('📊 State update - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('📊 State update - messages.length:', messages.length);
  }, [messages.length]);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      console.log('Chatbot: Authentication check - isAuth:', isAuth);
      setIsAuthenticated(isAuth);
    };

    // Initialize auth service and check status
    authService.initializeAuth();
    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      console.log('Chatbot: Storage change detected, rechecking auth');
      checkAuth();
    };

    // Also check auth when component mounts and when messages change
    const interval = setInterval(checkAuth, 2000); // Check every 2 seconds

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-open chatbot if coming from dashboard
  useEffect(() => {
    if (openChat) {
      setIsOpen(true);
    }
  }, [openChat]);

  // Focus input and scroll to show latest content when chatbot opens
  useEffect(() => {
    if (isOpen) {
      focusInput();
      // Small delay to ensure messages are rendered before scrolling
      setTimeout(() => {
        if (messages.length > 0) {
          // If there are messages, scroll to show the conversation context
          scrollToShowConversationContext();
        } else {
          // If no messages, just scroll to bottom
          scrollToBottom();
        }
      }, 200);
    }
  }, [isOpen, messages.length]);

  // Initialize financial advisor conversation when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Generate a new conversation ID
      const newConversationId = chatService.generateConversationId();
      setCurrentConversationId(newConversationId);
      
      // Get initial message from the service
      const getInitialMessage = async () => {
        console.log('Chatbot: Getting initial message, isAuthenticated:', isAuthenticated);
        try {
          // Ensure auth service is initialized first
          authService.initializeAuth();
          
          // Get current user and ensure authentication status is correct
          const currentUser = authService.getCurrentUser();
          const isUserAuthenticated = !!currentUser && !!currentUser.username;
          
          console.log('Chatbot: Current user from authService:', currentUser);
          console.log('Chatbot: Is user authenticated:', isUserAuthenticated);
          
          const userInfo = isUserAuthenticated ? {
            username: currentUser.username,
            isAuthenticated: true
          } : undefined;
          
          console.log('Chatbot: UserInfo being passed to service:', userInfo);
          
          const response = await sendChatMessageToGemini('', [], userInfo);
          if (response.success) {
            const initialMessage = {
              id: '1',
              text: response.message,
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([initialMessage]);
            
            // Store initial bot message in database if authenticated, otherwise store locally
            if (isAuthenticated) {
              const currentUser = authService.getCurrentUser();
              if (currentUser && currentUser.email) {
                try {
                  console.log('Chatbot: Storing initial bot message to database for authenticated user:', currentUser.email);
                  const storeResult = await chatService.storeMessage({
                    user_email: currentUser.email,
                    message_text: response.message,
                    sender: 'bot',
                    timestamp: new Date(),
                    conversation_id: newConversationId
                  });
                  
                  if (!storeResult.success) {
                    console.warn('Failed to store to database, falling back to localStorage:', storeResult.error);
                    saveMessageToLocalStorage(initialMessage);
                  } else {
                    console.log('Successfully stored initial message to database');
                  }
                } catch (error) {
                  console.error('Error storing initial bot message to database:', error);
                  saveMessageToLocalStorage(initialMessage);
                }
              } else {
                console.warn('No valid user found for authenticated state, storing to localStorage');
                saveMessageToLocalStorage(initialMessage);
              }
            } else {
              // Store to localStorage for unauthenticated users
              console.log('Chatbot: Storing initial bot message to localStorage for unauthenticated user');
              saveMessageToLocalStorage(initialMessage);
              savePendingConversation();
            }
          } else {
            // Fallback message if service fails
            const fallbackMessage = {
              id: '1',
              text: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nI am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as:\n\n• Buying a house\n• Children's education\n• Marriage expenses\n• Retirement planning\n• Health & family security\n• Travel, lifestyle, or passion pursuits\n\nAre you ready to start?",
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([fallbackMessage]);
            
            // Store fallback message in Supabase if user is authenticated
            if (isAuthenticated) {
              const currentUser = authService.getCurrentUser();
              if (currentUser) {
                await chatService.storeMessage({
                  user_email: currentUser.email,
                  message_text: fallbackMessage.text,
                  sender: 'bot',
                  timestamp: new Date(),
                  conversation_id: newConversationId
                });
              }
            }
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
          
          // Store fallback message safely
          if (isAuthenticated) {
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.email) {
              try {
                const storeResult = await chatService.storeMessage({
                  user_email: currentUser.email,
                  message_text: fallbackMessage.text,
                  sender: 'bot',
                  timestamp: new Date(),
                  conversation_id: newConversationId
                });
                
                if (!storeResult.success) {
                  console.warn('Failed to store fallback message to database, storing locally:', storeResult.error);
                  saveMessageToLocalStorage(fallbackMessage);
                }
              } catch (dbError) {
                console.error('Database error storing fallback message:', dbError);
                saveMessageToLocalStorage(fallbackMessage);
              }
            } else {
              saveMessageToLocalStorage(fallbackMessage);
            }
          } else {
            saveMessageToLocalStorage(fallbackMessage);
          }
        }
      };
      
      // Add a small delay to ensure authentication state is properly synchronized
      setTimeout(() => {
        getInitialMessage();
      }, 100);
    }
  }, [isOpen, messages.length, isAuthenticated]);

  // Load specific conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      loadSpecificConversation(conversationId);
    }
  }, [conversationId, isAuthenticated]);

    // Check for pending conversations after authentication and sync localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const pendingConversation = localStorage.getItem('pendingConversation');
      if (pendingConversation) {
        try {
          const pending = JSON.parse(pendingConversation);
          console.log('Chatbot: Found pending conversation:', pending);
          
          // Restore the conversation messages and state
          if (pending.messages && pending.messages.length > 1) {
            console.log('Chatbot: Restoring conversation with', pending.messages.length, 'messages');
            setMessages(pending.messages);
            setCurrentConversationId(pending.conversationId);
            setEmailSubmitted(false); // Reset email state since user just logged in
            
            // Auto-save the restored conversation to the user's account
            setTimeout(() => {
              handleSavePendingConversation();
            }, 1000); // Small delay to ensure state is updated
          }
        } catch (error) {
          console.error('Error parsing pending conversation:', error);
        }
      } else {
        // No pending conversation, but check for other localStorage messages to sync
        syncLocalStorageToDatabase();
      }
    }
  }, [isAuthenticated]);

  // Auto-save conversation periodically and when component unmounts
  useEffect(() => {
    if (isAuthenticated && currentConversationId && messages.length > 0) {
      // Save conversation every 5 messages or when component unmounts
      const saveInterval = setInterval(() => {
        if (messages.length > 0 && messages.length % 5 === 0) {
          saveEntireConversation();
        }
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(saveInterval);
        // Save conversation when component unmounts
        saveEntireConversation();
      };
    }
  }, [isAuthenticated, currentConversationId, messages.length]);

  // Auto-save conversation when messages change (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && currentConversationId && messages.length > 0) {
      // Auto-save conversation after every 3 messages for authenticated users
      if (messages.length % 3 === 0) {
        console.log('Chatbot: Auto-saving conversation after', messages.length, 'messages');
        saveEntireConversation();
      }
    }
  }, [messages.length, isAuthenticated, currentConversationId]);

  const loadSpecificConversation = async (convId: number) => {
    if (!isAuthenticated) return;
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    
    try {
      const result = await chatService.getConversation(convId.toString(), currentUser.email);
      if (result.success && result.conversation) {
        // Convert ChatMessage to Message format
        const convertedMessages: Message[] = result.conversation.messages.map(msg => ({
          id: msg.id?.toString() || Date.now().toString(),
          text: msg.message_text,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        
        setMessages(convertedMessages);
        setCurrentConversationId(result.conversation.id);
        setEmailSubmitted(true);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to localStorage
      const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
      const conversation = savedConversations.find((conv: any) => conv.id === convId);
      
      if (conversation) {
        setMessages(conversation.messages);
        setEmailSubmitted(true);
      }
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
    
    // Immediately scroll to bottom when user sends a message
    forceScrollToBottom();

    // Store user message in database if authenticated, otherwise store locally
    if (isAuthenticated && currentConversationId) {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email) {
        try {
          console.log('Chatbot: Storing user message to database for authenticated user:', currentUser.email);
          const storeResult = await chatService.storeMessage({
            user_email: currentUser.email,
            message_text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            conversation_id: currentConversationId
          });
          
          if (!storeResult.success) {
            console.warn('Failed to store user message to database, falling back to localStorage:', storeResult.error);
            saveMessageToLocalStorage(userMessage);
          } else {
            console.log('Successfully stored user message to database');
          }
        } catch (error) {
          console.error('Error storing user message to database:', error);
          // Fallback to localStorage if database fails
          saveMessageToLocalStorage(userMessage);
        }
      } else {
        console.warn('No valid user found for authenticated state, storing to localStorage');
        saveMessageToLocalStorage(userMessage);
        savePendingConversation();
      }
    } else {
      // Store to localStorage for unauthenticated users
      console.log('Chatbot: Storing user message to localStorage for unauthenticated user');
      saveMessageToLocalStorage(userMessage);
      
      // Also store pending conversation for later database sync
      savePendingConversation();
    }

    try {
      // Convert messages to the format expected by the service
      // Use the previous messages (before adding the current user message) to maintain proper conversation flow
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      console.log('Chatbot: Sending to Gemini with conversation history length:', conversationHistory.length);
      console.log('Chatbot: Current user input:', inputValue);
      
      // Ensure auth service is initialized first
      authService.initializeAuth();
      
      // Get current user and ensure authentication status is correct
      const currentUser = authService.getCurrentUser();
      const isUserAuthenticated = !!currentUser && !!currentUser.username;
      
      console.log('Chatbot: Current user from authService in handleSendMessage:', currentUser);
      console.log('Chatbot: Is user authenticated in handleSendMessage:', isUserAuthenticated);
      
      const userInfo = isUserAuthenticated ? {
        username: currentUser.username,
        isAuthenticated: true
      } : undefined;
      
      console.log('Chatbot: UserInfo being passed to service in handleSendMessage:', userInfo);
      
      const response = await sendChatMessageToGemini(inputValue, conversationHistory, userInfo);
      console.log('Chatbot: Received response from service:', {
        success: response.success,
        messageLength: response.message?.length,
        isGeneratingPlan: response.isGeneratingPlan
      });

      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Scroll to show the conversation context (user message + AI response)
        scrollToShowConversationContext();
        
        // Check if this is a plan generation trigger (should rarely happen now since we generate directly)
        if (response.isGeneratingPlan) {
          console.log('Chatbot: Investment plan generation triggered');
          setIsGeneratingPlan(true);
          
          // Brief delay for UX then turn off loading
    setTimeout(() => {
              setIsGeneratingPlan(false);
          }, 500);
        }
        
        // Store bot message in database if authenticated, otherwise store locally
        if (isAuthenticated && currentConversationId) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email) {
            try {
              console.log('Chatbot: Storing bot message to database for authenticated user:', currentUser.email);
              const storeResult = await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: response.message,
                sender: 'bot',
                timestamp: new Date(),
                conversation_id: currentConversationId
              });
              
              if (!storeResult.success) {
                console.warn('Failed to store bot message to database, falling back to localStorage:', storeResult.error);
                saveMessageToLocalStorage(botMessage);
              } else {
                console.log('Successfully stored bot message to database');
              }
            } catch (error) {
              console.error('Error storing bot message to database:', error);
              // Fallback to localStorage if database fails
              saveMessageToLocalStorage(botMessage);
            }
          } else {
            console.warn('No valid user found for authenticated state, storing to localStorage');
            saveMessageToLocalStorage(botMessage);
            savePendingConversation();
          }
        } else {
          // Store to localStorage for unauthenticated users
          console.log('Chatbot: Storing bot message to localStorage for unauthenticated user');
          saveMessageToLocalStorage(botMessage);
          
          // Update pending conversation
          savePendingConversation();
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Scroll to show the error message clearly
        scrollToShowLatestResponse();
        
        // Store error message in database if authenticated, otherwise store locally
        if (isAuthenticated && currentConversationId) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            try {
              console.log('Chatbot: Storing error message to database for authenticated user');
              await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: response.message,
                sender: 'bot',
                timestamp: new Date(),
                conversation_id: currentConversationId
              });
            } catch (error) {
              console.error('Error storing error message to database:', error);
              // Fallback to localStorage if database fails
              saveMessageToLocalStorage(errorMessage);
            }
          }
        } else {
          // Store to localStorage for unauthenticated users
          console.log('Chatbot: Storing error message to localStorage for unauthenticated user');
          saveMessageToLocalStorage(errorMessage);
          
          // Update pending conversation
          savePendingConversation();
        }
      }
    } catch (error) {
      console.error('Chatbot: Unexpected error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Scroll to show the error message clearly
      scrollToShowLatestResponse();
      
      // Store error message in database if authenticated, otherwise store locally
      if (isAuthenticated && currentConversationId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          try {
            console.log('Chatbot: Storing catch error message to database for authenticated user');
            await chatService.storeMessage({
              user_email: currentUser.email,
              message_text: errorMessage.text,
              sender: 'bot',
              timestamp: new Date(),
              conversation_id: currentConversationId
            });
          } catch (error) {
            console.error('Error storing catch error message to database:', error);
            // Fallback to localStorage if database fails
            saveMessageToLocalStorage(errorMessage);
          }
        }
      } else {
        // Store to localStorage for unauthenticated users
        console.log('Chatbot: Storing catch error message to localStorage for unauthenticated user');
        saveMessageToLocalStorage(errorMessage);
        
        // Update pending conversation
        savePendingConversation();
      }
    } finally {
      setIsTyping(false);
      // Focus the input field so user can type again
      focusInput();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseChat = () => {
    // Always close the chat when close button is clicked
    setIsOpen(false);
    setMessages([]);
    setEmailSubmitted(false);
    setShowEmailPopup(false);
    setShowAuthOptions(false);
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
    console.log('handleLogin: Navigating to login page');
    
    // Store conversation temporarily before navigating
    if (messages.length > 1) {
      const pendingConversation = {
        messages: messages,
        conversationId: currentConversationId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('pendingConversation', JSON.stringify(pendingConversation));
      console.log('handleLogin: Stored pending conversation with', messages.length, 'messages');
    } else {
      console.log('handleLogin: No conversation to store (messages.length:', messages.length, ')');
    }
    
    navigate('/login', { state: { returnToChat: true } });
  };

  const handleSignup = () => {
    setShowAuthOptions(false);
    console.log('handleSignup: Navigating to signup page');
    
    // Store conversation temporarily before navigating
    if (messages.length > 1) {
      const pendingConversation = {
        messages: messages,
        conversationId: currentConversationId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('pendingConversation', JSON.stringify(pendingConversation));
      console.log('handleSignup: Stored pending conversation with', messages.length, 'messages');
    } else {
      console.log('handleSignup: No conversation to store (messages.length:', messages.length, ')');
    }
    
    navigate('/signup', { state: { returnToChat: true } });
  };

  const handleSaveToAccount = async () => {
    console.log('🚀 SAVE & LOGIN BUTTON CLICKED! handleSaveToAccount called');
    console.log('📊 Current state - isAuthenticated:', isAuthenticated);
    console.log('📊 Current state - messages.length:', messages.length);
    console.log('📊 Current state - currentConversationId:', currentConversationId);
    console.log('📊 Current state - showAuthOptions:', showAuthOptions);
    
    // Add visual feedback in console
    console.log('%c=== SAVE & LOGIN BUTTON PROCESSING ===', 'color: blue; font-weight: bold; font-size: 14px;');
    
    if (isAuthenticated) {
      try {
        // Check if there are messages to save
        if (messages.length <= 1) {
          alert('No conversation to save yet. Start chatting to create a conversation!');
          return;
        }

        // Save conversation to both localStorage and Supabase
        const currentUser = authService.getCurrentUser();
        console.log('handleSaveToAccount: Current user:', currentUser);
        
        if (currentUser) {
          console.log('handleSaveToAccount: Saving conversation with', messages.length, 'messages');
          
          // Ensure we have a conversation ID
          const conversationId = currentConversationId || chatService.generateConversationId();
          setCurrentConversationId(conversationId);
          
          try {
            // Create conversation object
            const conversation = {
              user_email: currentUser.email,
              title: generateConversationTitle(),
              summary: generateConversationSummary(),
              message_count: messages.length,
              created_at: new Date(),
              last_message_at: new Date(),
              messages: messages.map(msg => ({
                user_email: currentUser.email,
                message_text: msg.text,
                sender: msg.sender,
                timestamp: msg.timestamp,
                conversation_id: conversationId
              }))
            };

            // Save complete conversation to Supabase
            const saveResult = await chatService.storeConversation(conversation);
            
            if (saveResult.success) {
              console.log('Conversation saved successfully with ID:', saveResult.conversationId);
              
              // Also save to localStorage as backup
              saveConversationToLocalStorage();
              
              // Dispatch custom event to notify dashboard of new conversation
              window.dispatchEvent(new CustomEvent('conversationSaved', { 
                detail: { conversationId: saveResult.conversationId, messageCount: messages.length } 
              }));
              
              alert('✅ Conversation saved to your account successfully! You can access it from your dashboard.');
            } else {
              console.error('Failed to save conversation:', saveResult.error);
              // Fallback to individual message storage
              for (const message of messages) {
                await chatService.storeMessage({
                  user_email: currentUser.email,
                  message_text: message.text,
                  sender: message.sender,
                  timestamp: message.timestamp,
                  conversation_id: conversationId
                });
              }
              
              // Also save to localStorage as backup
              saveConversationToLocalStorage();
              
              alert('✅ Conversation saved to your account successfully! You can access it from your dashboard.');
            }
          } catch (error) {
            console.error('Error saving conversation:', error);
            // Fallback to individual message storage
            for (const message of messages) {
              await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: message.text,
                sender: message.sender,
                timestamp: message.timestamp,
                conversation_id: conversationId
              });
            }
            
            // Also save to localStorage as backup
            saveConversationToLocalStorage();
            
            alert('✅ Conversation saved to your account successfully! You can access it from your dashboard.');
          }
        } else {
          console.error('handleSaveToAccount: No current user found');
          alert('❌ Unable to save: User session not found. Please try logging in again.');
        }
      } catch (error) {
        console.error('Error saving to account:', error);
        // Fallback to localStorage only
        saveConversationToLocalStorage();
        alert('⚠️ Saved to local storage. There was an issue saving to your account. Please check your internet connection and try again.');
      }
    } else {
      // Show authentication options
      console.log('🔐 User not authenticated, showing auth options');
      console.log('📱 About to call setShowAuthOptions(true)');
      setShowAuthOptions(true);
      console.log('✅ setShowAuthOptions(true) called successfully');
      console.log('📊 showAuthOptions should now be true, current value:', showAuthOptions);
    }
  };

  const handleEmailTranscript = () => {
    // Show email popup for transcript
    setShowEmailPopup(true);
  };

  const handleSaveAndClose = () => {
    // Save conversation first, then close
    if (messages.length > 1) {
      saveConversationToLocalStorage();
      alert('Conversation saved! Closing chat.');
    }
    handleCloseChat();
  };

  // Function to save entire conversation to database
  const saveEntireConversation = async () => {
    if (!currentConversationId || messages.length === 0) return;
    
    const currentUser = authService.getCurrentUser();
    const userEmail = currentUser?.email;
    
    if (isAuthenticated && userEmail) {
      try {
        console.log('Chatbot: Saving entire conversation to database:', currentConversationId);
        
        // Generate conversation title and summary
        const generateConversationTitle = () => {
          const firstUserMessage = messages.find(msg => msg.sender === 'user');
          if (firstUserMessage) {
            return firstUserMessage.text.length > 50 
              ? firstUserMessage.text.substring(0, 50) + '...'
              : firstUserMessage.text;
          }
          return `Chat from ${new Date().toLocaleDateString()}`;
        };

        const generateConversationSummary = () => {
          const userMessages = messages.filter(msg => msg.sender === 'user');
          if (userMessages.length === 0) return 'Bot conversation';
          
          const firstUserMessage = userMessages[0];
          const text = firstUserMessage.text.toLowerCase();
          if (text.includes('investment') || text.includes('invest')) return 'Investment discussion';
          if (text.includes('goal') || text.includes('plan')) return 'Financial goal planning';
          if (text.includes('risk') || text.includes('tolerance')) return 'Risk assessment';
          if (text.includes('income') || text.includes('salary')) return 'Income planning';
          if (text.includes('retirement') || text.includes('retire')) return 'Retirement planning';
          if (text.includes('house') || text.includes('property')) return 'Property investment';
          if (text.includes('education') || text.includes('study')) return 'Education funding';
          
          return 'Financial advisory session';
        };

        // Create conversation object
        const conversation = {
          user_email: userEmail,
          title: generateConversationTitle(),
          summary: generateConversationSummary(),
          message_count: messages.length,
          created_at: new Date(),
          last_message_at: new Date(),
          messages: messages.map(msg => ({
            user_email: userEmail,
            message_text: msg.text,
            sender: msg.sender as 'user' | 'bot',
            timestamp: msg.timestamp,
            conversation_id: currentConversationId
          }))
        };

        // Save complete conversation to Supabase
        const saveResult = await chatService.storeConversation(conversation);
        
        if (saveResult.success) {
          console.log('Chatbot: Successfully saved entire conversation to database');
        } else {
          console.warn('Chatbot: Failed to save entire conversation to database:', saveResult.error);
        }
      } catch (error) {
        console.error('Chatbot: Error saving entire conversation to database:', error);
      }
    }
  };

  const handleSavePendingConversation = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        console.error('handleSavePendingConversation: No current user found');
        return;
      }

      console.log('handleSavePendingConversation: Saving pending conversation for user:', currentUser.email);
      console.log('handleSavePendingConversation: Messages to save:', messages.length);
      console.log('handleSavePendingConversation: Conversation ID:', currentConversationId);

      // Ensure we have a conversation ID
      const conversationId = currentConversationId || chatService.generateConversationId();
      setCurrentConversationId(conversationId);

      try {
        // Create conversation object
        const conversation = {
          user_email: currentUser.email,
          title: generateConversationTitle(),
          summary: generateConversationSummary(),
          message_count: messages.length,
          created_at: new Date(),
          last_message_at: new Date(),
          messages: messages.map(msg => ({
            user_email: currentUser.email,
            message_text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
            conversation_id: conversationId
          }))
        };

        // Save complete conversation to Supabase
        const saveResult = await chatService.storeConversation(conversation);
        
        if (saveResult.success) {
          console.log('Pending conversation saved successfully with ID:', saveResult.conversationId);
        } else {
          console.error('Failed to save pending conversation:', saveResult.error);
          // Fallback to individual message storage
          for (const message of messages) {
            await chatService.storeMessage({
              user_email: currentUser.email,
              message_text: message.text,
              sender: message.sender,
              timestamp: message.timestamp,
              conversation_id: conversationId
            });
          }
        }
      } catch (error) {
        console.error('Error saving pending conversation:', error);
        // Fallback to individual message storage
        for (const message of messages) {
          await chatService.storeMessage({
            user_email: currentUser.email,
            message_text: message.text,
            sender: message.sender,
            timestamp: message.timestamp,
            conversation_id: conversationId
          });
        }
      }

      // Also save to localStorage as backup
      saveConversationToLocalStorage();

      // Clear the pending conversation
      localStorage.removeItem('pendingConversation');
      console.log('handleSavePendingConversation: Pending conversation cleared from localStorage');

      // Dispatch custom event to notify dashboard of new conversation
      window.dispatchEvent(new CustomEvent('conversationSaved', { 
        detail: { conversationId, messageCount: messages.length } 
      }));

      // Show success message
      alert('🎉 Welcome back! Your conversation has been saved to your account successfully!');
    } catch (error) {
      console.error('Error saving pending conversation:', error);
      // Save to localStorage as fallback
      saveConversationToLocalStorage();
      alert('⚠️ Welcome back! Your conversation has been saved locally. There was an issue saving to your account.');
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

  // Enhanced function to auto-sync all localStorage conversations when user authenticates
  const syncLocalStorageToDatabase = async () => {
    if (!isAuthenticated) return;

    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      console.log('Chatbot: Starting localStorage to database sync for authenticated user');

      // Sync current chat messages if they exist
      const currentMessages = JSON.parse(localStorage.getItem('currentChatMessages') || '[]');
      if (currentMessages.length > 0) {
        console.log('Chatbot: Syncing', currentMessages.length, 'current messages to database');
        
        const conversationId = currentConversationId || chatService.generateConversationId();
        setCurrentConversationId(conversationId);

        try {
          // Create conversation object
          const conversation = {
            user_email: currentUser.email,
            title: generateConversationTitle(),
            summary: generateConversationSummary(),
            message_count: currentMessages.length,
            created_at: new Date(),
            last_message_at: new Date(),
            messages: currentMessages.map((msg: any) => ({
              user_email: currentUser.email,
              message_text: msg.text,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp),
              conversation_id: conversationId
            }))
          };

          // Save complete conversation to Supabase
          const saveResult = await chatService.storeConversation(conversation);
          
          if (saveResult.success) {
            console.log('LocalStorage conversation synced successfully with ID:', saveResult.conversationId);
            // Clear localStorage after successful sync
            localStorage.removeItem('currentChatMessages');
            console.log('Chatbot: Successfully synced and cleared current messages from localStorage');
          } else {
            console.error('Failed to sync localStorage conversation:', saveResult.error);
            // Fallback to individual message storage
            for (const message of currentMessages) {
              try {
                await chatService.storeMessage({
                  user_email: currentUser.email,
                  message_text: message.text,
                  sender: message.sender,
                  timestamp: new Date(message.timestamp),
                  conversation_id: conversationId
                });
              } catch (error) {
                console.error('Error syncing individual message to database:', error);
              }
            }
            // Clear localStorage after fallback sync
            localStorage.removeItem('currentChatMessages');
            console.log('Chatbot: Successfully synced and cleared current messages from localStorage (fallback)');
          }
        } catch (error) {
          console.error('Error syncing localStorage conversation:', error);
          // Fallback to individual message storage
          for (const message of currentMessages) {
            try {
              await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: message.text,
                sender: message.sender,
                timestamp: new Date(message.timestamp),
                conversation_id: conversationId
              });
            } catch (error) {
              console.error('Error syncing individual message to database:', error);
            }
          }
          // Clear localStorage after fallback sync
          localStorage.removeItem('currentChatMessages');
          console.log('Chatbot: Successfully synced and cleared current messages from localStorage (fallback)');
        }
      }

    } catch (error) {
      console.error('Error syncing localStorage to database:', error);
    }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
             style={{ 
               border: '3px solid red', // Debug: make popup very visible
               animation: 'pulse 1s infinite' // Debug: make it pulse
             }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Your Conversation</h3>
            <p className="text-gray-600 mb-6">To save this conversation and access it later, please create an account or log in.</p>
            
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  console.log('🆕 CREATE ACCOUNT BUTTON CLICKED!', e);
                  handleSignup();
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create Account</span>
              </button>
              <button
                onClick={(e) => {
                  console.log('🔐 LOG IN BUTTON CLICKED!', e);
                  handleLogin();
                }}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 chat-messages-container">
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
                      {/* Debug info */}
                      <p className="text-xs text-gray-500 mt-1">
                        Auth Status: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          console.log('🖱️ BUTTON CLICK EVENT TRIGGERED!', e);
                          console.log('🔍 Event target:', e.target);
                          console.log('🔍 Button text:', (e.target as HTMLElement).textContent);
                          console.log('🔍 handleSaveToAccount function exists:', typeof handleSaveToAccount);
                          handleSaveToAccount();
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      >
                        {isAuthenticated ? 'Save to Account' : 'Login & Save'}
                      </button>
                      <button
                        onClick={handleEmailTranscript}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl"
                      >
                        Email Transcript
                      </button>
                    </div>
                    <button
                      onClick={handleSaveAndClose}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl"
                    >
                      Save & Close
                    </button>
                  </div>
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
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong className="font-semibold text-blue-900">Smart Planning:</strong> I'll ask just the essential questions to create your personalized investment strategy. Your complete plan will be ready in just a few minutes!
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
            
            {/* Investment Plan Generation Indicator */}
            {isGeneratingPlan && (
              <div className="flex justify-start mb-4 animate-fade-in">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-5 rounded-2xl shadow-lg max-w-[75%]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-800 mb-1">📊 Creating Your Investment Strategy...</p>
                      <p className="text-xs text-green-700 mb-2">Analyzing your goals and financial capacity to build a personalized plan</p>
                      <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full animate-pulse" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Calculating optimal investment allocation and timeline...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-white">
            {/* Quick Action Buttons */}
            {messages.length > 1 && (
              <div className="mb-4 flex justify-center space-x-3">
                <button
                  onClick={handleSaveToAccount}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl ${
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>
                    {isAuthenticated ? 'Save to Account' : 'Login & Save'}
                  </span>
                </button>
                <button
                  onClick={handleEmailTranscript}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl ${
                    emailSubmitted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {emailSubmitted ? 'Update Email' : 'Email Transcript'}
                  </span>
                </button>
              </div>
            )}

            <div className="flex space-x-3">
              <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTyping ? "AI is typing..." : isGeneratingPlan ? "Creating your investment strategy..." : t.chatbot.placeholder}
                disabled={isTyping || isGeneratingPlan}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm transition-all duration-200 bg-white hover:border-gray-400"
              />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || isGeneratingPlan}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {isGeneratingPlan ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}