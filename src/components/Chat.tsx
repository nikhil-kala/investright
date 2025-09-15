import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Mail, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { sendChatMessageToGemini, createNewChatSession, saveConversationToDatabase } from '../services/chatbotService';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { useNavigate, useLocation } from 'react-router-dom';
// import Header from './Header';
// import Footer from './Footer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chat() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('Chat: Component rendering with location state:', location.state);
  console.log('Chat: Current pathname:', location.pathname);
  
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
  // const [hasShownEmailPopup, setHasShownEmailPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of chat (unused)
  // const scrollToBottom = () => {
  //   setTimeout(() => {
  //     if (messagesEndRef.current) {
  //       messagesEndRef.current.scrollIntoView({ 
  //         behavior: 'smooth',
  //         block: 'end'
  //       });
  //     }
  //   }, 100);
  // };

  // Function to save entire conversation to database
  const saveEntireConversation = async () => {
    if (!currentConversationId || messages.length === 0) return;
    
    const currentUser = authService.getCurrentUser();
    const userEmail = currentUser?.email;
    
    if (isAuthenticated && userEmail) {
      try {
        console.log('Chat: Saving entire conversation to database:', currentConversationId);
        
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
          console.log('Chat: Successfully saved entire conversation to database');
        } else {
          console.warn('Chat: Failed to save entire conversation to database:', saveResult.error);
        }
      } catch (error) {
        console.error('Chat: Error saving entire conversation to database:', error);
      }
    }
  };

  // Debounced scroll function to prevent excessive scrolling
  const scrollChatToBottom = (() => {
    let scrollTimeout: NodeJS.Timeout;
    return () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        console.log('Chat: Scrolled chat container to bottom');
      }
      }, 50); // Debounce scroll calls by 50ms
    };
  })();

  // Migrate any existing localStorage chats to DB as a guest (unauthenticated)
  const migrateLocalChatsAsGuest = async () => {
    try {
      console.log('Chat: Migrating local chats as guest...');
      // 1) Pending conversation block
      const pending = localStorage.getItem('pendingConversation');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            const convId = parsed.conversationId || chatService.generateConversationId();
            const guestEmail = `guest+${convId}@investright.local`;
            let successCount = 0;
            for (const msg of parsed.messages) {
              try {
                const sender = (msg.sender === 'user' || msg.sender === 'bot') ? msg.sender : 'user';
                await chatService.storeMessage({
                  user_email: guestEmail,
                  message_text: msg.text,
                  sender,
                  timestamp: new Date(msg.timestamp || Date.now()),
                  conversation_id: convId
                });
                successCount++;
              } catch (e) {
                console.error('Chat: Guest migrate pending message failed:', e);
              }
            }
            if (successCount > 0) {
              console.log('Chat: Guest migration (pending) success count:', successCount);
              localStorage.removeItem('pendingConversation');
            }
          }
        } catch (e) {
          console.error('Chat: Failed to parse pendingConversation for guest migration:', e);
        }
      }

      // 2) currentChatMessages block
      const current = localStorage.getItem('currentChatMessages');
      if (current) {
        try {
          const msgs = JSON.parse(current);
          if (Array.isArray(msgs) && msgs.length > 0) {
            const convId = currentConversationId || chatService.generateConversationId();
            if (!currentConversationId) setCurrentConversationId(convId);
            const guestEmail = `guest+${convId}@investright.local`;
            let successCount = 0;
            for (const m of msgs) {
              try {
                const sender = (m.sender === 'user' || m.sender === 'bot') ? m.sender : 'user';
                await chatService.storeMessage({
                  user_email: guestEmail,
                  message_text: m.text,
                  sender,
                  timestamp: new Date(m.timestamp || Date.now()),
                  conversation_id: convId
                });
                successCount++;
              } catch (e) {
                console.error('Chat: Guest migrate current message failed:', e);
              }
            }
            if (successCount > 0) {
              console.log('Chat: Guest migration (currentChatMessages) success count:', successCount);
              localStorage.removeItem('currentChatMessages');
            }
          }
        } catch (e) {
          console.error('Chat: Failed to parse currentChatMessages for guest migration:', e);
        }
      }
    } catch (error) {
      console.error('Chat: Error migrating local chats as guest:', error);
    }
  };

  // Get conversation ID from location state if coming from dashboard
  const conversationId = location.state?.conversationId;

  // Load specific conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      loadSpecificConversation(conversationId);
    }
  }, [conversationId, isAuthenticated]);

  const focusInput = () => {
    setTimeout(() => {
      if (inputRef.current && !isTyping && !isGeneratingPlan) {
        inputRef.current.focus();
        console.log('Chat: Input focused');
      }
    }, 100);
  };

  const focusInputAfterMessage = () => {
    setTimeout(() => {
      if (inputRef.current && !isTyping && !isGeneratingPlan) {
        inputRef.current.focus();
        console.log('Chat: Input focused after message');
      }
    }, 200);
  };

  // Local storage chat writes removed: all chats go to database directly.

  // Focus input when typing state changes (when typing completes)
  useEffect(() => {
    if (!isTyping && !isGeneratingPlan) {
      focusInputAfterMessage();
    }
  }, [isTyping, isGeneratingPlan]);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        console.log('Chat: Authentication check - isAuth:', isAuth);
        setIsAuthenticated(isAuth);
        setAuthError(null);
      } catch (error) {
        console.error('Chat: Authentication check error:', error);
        setAuthError('Authentication check failed');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    // Initialize auth service and check status
    authService.initializeAuth();
    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      console.log('Chat: Storage change detected, rechecking auth');
      checkAuth();
    };

    // Also check auth when component mounts and when messages change
    const interval = setInterval(checkAuth, 1000); // Check every 1 second for faster response

    // Listen for custom auth events
    const handleAuthEvent = () => {
      console.log('Chat: Auth event detected, rechecking auth');
      checkAuth();
    };

    // Listen for window focus events to refocus input
    const handleWindowFocus = () => {
      console.log('Chat: Window focused, refocusing input');
      focusInputAfterMessage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthEvent);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthEvent);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    focusInput();
    
    // Initial scroll to bottom when component mounts
    setTimeout(() => scrollChatToBottom(), 300);

    // If not authenticated, migrate any local chats as guest immediately
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setTimeout(() => {
        migrateLocalChatsAsGuest();
      }, 200);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollChatToBottom();
  }, [messages]);

  // Fallback authentication check when component mounts
  useEffect(() => {
    console.log('Chat: Fallback auth check triggered');
    
    // If we're on the chat page and the user should be authenticated (e.g., coming from login)
    // but the auth state isn't properly set, try to reinitialize
    const checkAndReinitializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('sessionToken');
      
      console.log('Chat: Checking stored auth data - user:', !!storedUser, 'token:', !!storedToken, 'isAuthenticated:', isAuthenticated);
      
      if (storedUser && storedToken && !isAuthenticated) {
        console.log('Chat: Found stored auth data but state not synchronized, reinitializing...');
        authService.initializeAuth();
        
        // Force a re-check after a short delay
        setTimeout(() => {
          const isAuth = authService.isAuthenticated();
          console.log('Chat: Re-authentication check result:', isAuth);
          setIsAuthenticated(isAuth);
        }, 200);
      }
    };

    // Check after a short delay to allow other components to initialize
    setTimeout(checkAndReinitializeAuth, 300);
  }, [isAuthenticated]);

  // Initialize financial advisor conversation when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      // Create a new chat session
      const initializeChatSession = async () => {
        let sessionResult: { success: boolean; conversationId: string; error?: string } = { success: false, conversationId: '', error: 'Not initialized' };
        let userEmail: string | undefined;
        let isUserAuthenticated: boolean = false;
        
        try {
          const currentUser = authService.getCurrentUser();
          userEmail = currentUser?.email;
          isUserAuthenticated = isAuthenticated && !!userEmail;
          
          console.log('Chat: Initializing new chat session for user:', userEmail, 'Authenticated:', isUserAuthenticated);
          
          // Create new chat session
          const sessionResult = await createNewChatSession(userEmail, isUserAuthenticated);
          if (sessionResult.success) {
            setCurrentConversationId(sessionResult.conversationId);
            console.log('Chat: Chat session created with ID:', sessionResult.conversationId);
          } else {
            console.error('Chat: Failed to create chat session:', sessionResult.error);
            // Fallback to local conversation ID
            const fallbackId = chatService.generateConversationId();
            setCurrentConversationId(fallbackId);
          }
          
          // Get initial message from the service
          const response = await sendChatMessageToGemini('', [], { 
            username: currentUser?.username, 
            isAuthenticated: isUserAuthenticated 
          }, sessionResult.conversationId);
          
          if (response.success) {
            const initialMessage = {
              id: '1',
              text: response.message,
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([initialMessage]);
            
            // Scroll will be handled by useEffect
            
            // Save initial conversation to database if authenticated
            if (isUserAuthenticated && userEmail) {
              try {
                console.log('Chat: Saving initial conversation to database for authenticated user:', userEmail);
                const saveResult = await saveConversationToDatabase(
                  sessionResult.conversationId,
                  [{ role: 'assistant', content: response.message }],
                  userEmail,
                  true
                );
                
                if (saveResult.success) {
                  console.log('Chat: Successfully saved initial conversation to database');
                  } else {
                  console.warn('Chat: Failed to save initial conversation to database:', saveResult.error);
                  }
                } catch (error) {
                console.error('Chat: Error saving initial conversation to database:', error);
                }
              } else {
              const guestEmail = `guest+${sessionResult.conversationId}@investright.local`;
              try {
                await chatService.storeMessage({
                  user_email: guestEmail,
                  message_text: initialMessage.text,
                  sender: 'bot',
                  timestamp: initialMessage.timestamp,
                  conversation_id: sessionResult.conversationId
                });
              } catch (e) {
                console.error('Chat: Failed to store initial bot message for guest:', e);
              }
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
            
            // Scroll will be handled by useEffect
            
            // Store fallback message in Supabase if user is authenticated
            if (isUserAuthenticated && userEmail && sessionResult) {
              try {
                await saveConversationToDatabase(
                  sessionResult.conversationId,
                  [{ role: 'assistant', content: fallbackMessage.text }],
                  userEmail,
                  true
                );
              } catch (error) {
                console.error('Error saving fallback message to database:', error);
              }
            } else {
              const guestEmail = `guest+${sessionResult.conversationId}@investright.local`;
              try {
                await chatService.storeMessage({
                  user_email: guestEmail,
                  message_text: fallbackMessage.text,
                  sender: 'bot',
                  timestamp: fallbackMessage.timestamp,
                  conversation_id: sessionResult.conversationId
                });
              } catch (e) {
                console.error('Error saving guest fallback message to database:', e);
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
          
          // Scroll will be handled by useEffect
          
          // Store fallback message in Supabase if user is authenticated
            if (isUserAuthenticated && userEmail && sessionResult) {
              try {
                await saveConversationToDatabase(
                  sessionResult.conversationId,
                  [{ role: 'assistant', content: fallbackMessage.text }],
                  userEmail,
                  true
                );
              } catch (error) {
                console.error('Error saving fallback message to database:', error);
              }
            } else {
              const guestEmail = `guest+${sessionResult.conversationId}@investright.local`;
              try {
              await chatService.storeMessage({
                  user_email: guestEmail,
                message_text: fallbackMessage.text,
                sender: 'bot',
                  timestamp: fallbackMessage.timestamp,
                  conversation_id: sessionResult.conversationId
              });
              } catch (e) {
                console.error('Error saving guest fallback message to database:', e);
            }
          }
        }
      };
      
      initializeChatSession();
    }
  }, [messages.length, isAuthenticated]);

  // Auto-sync local chats exactly once when authenticated
  const didAutoSyncRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || didAutoSyncRef.current) return;
    didAutoSyncRef.current = true;
    console.log('Chat: Authenticated. Starting auto-sync of local chats...');
      setTimeout(() => {
        const pendingConversation = localStorage.getItem('pendingConversation');
        if (pendingConversation) {
          try {
            const parsed = JSON.parse(pendingConversation);
          if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
              console.log('Chat: Found pending conversation with', parsed.messages.length, 'messages');
              setMessages(parsed.messages);
              setCurrentConversationId(parsed.conversationId);
            // no-op: emailSubmitted removed
              // Scroll will be handled by useEffect
              setTimeout(() => {
                handleSavePendingConversation();
            }, 500);
            return;
            }
          } catch (error) {
            console.error('Error parsing pending conversation:', error);
          }
      }
      console.log('Chat: No pending conversation, syncing currentChatMessages to database...');
      syncLocalStorageToDatabase();
    }, 300);
  }, [isAuthenticated]);

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
        // no-op: emailSubmitted removed
        
        // Scroll will be handled by useEffect
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to localStorage
      const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
      const conversation = savedConversations.find((conv: any) => conv.id === convId);
      
      if (conversation) {
        setMessages(conversation.messages);
        // no-op: emailSubmitted removed
        
        // Scroll will be handled by useEffect
      }
    }
  };

  // Sync localStorage conversations to database when authenticated
  const syncLocalStorageToDatabase = async () => {
    try {
      console.log('Chat: Syncing localStorage conversations to database...');
      
      // Get current chat messages from localStorage
      const currentMessages = localStorage.getItem('currentChatMessages');
      if (currentMessages) {
        const parsedMessages = JSON.parse(currentMessages);
        if (parsedMessages.length > 0) {
          console.log('Chat: Found', parsedMessages.length, 'current messages to sync');
          
          // Create a new conversation in the database
          const conversationData = {
            title: `Chat from ${new Date().toLocaleDateString()}`,
            summary: 'Conversation synced from localStorage',
            messages: parsedMessages.map((msg: any) => ({
              sender: msg.sender,
              message_text: msg.text,
              timestamp: msg.timestamp
            }))
          };
          
          // Since createConversation doesn't exist, we'll store messages individually
          const conversationId = chatService.generateConversationId();
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email) {
            let successCount = 0;
            for (const msg of conversationData.messages) {
              try {
                const result = await chatService.storeMessage({
                  user_email: currentUser.email,
                  message_text: msg.message_text,
                  sender: msg.sender as 'user' | 'bot',
                  timestamp: new Date(msg.timestamp),
                  conversation_id: conversationId
                });
                if (result.success) successCount++;
              } catch (error) {
                console.error('Error storing message:', error);
              }
            }
            
            if (successCount > 0) {
              console.log('Chat: Successfully synced localStorage conversation to database');
              setCurrentConversationId(conversationId);
              
              // Scroll to bottom after syncing
              setTimeout(() => scrollChatToBottom(), 200);
              
              // Clear localStorage after successful sync
              localStorage.removeItem('currentChatMessages');
            } else {
              console.log('Chat: Failed to sync localStorage conversation - no messages were stored successfully');
            }
          } else {
            console.log('Chat: No current user or user email found during sync');
          }
        } else {
          console.log('Chat: No messages found in localStorage to sync');
        }
      } else {
        console.log('Chat: No currentChatMessages found in localStorage');
      }
    } catch (error) {
      console.error('Error syncing localStorage to database:', error);
      // Don't let sync errors break the component
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
    
    // Enhanced scrolling for first user message - scroll both chat container and messages
    setTimeout(() => scrollChatToBottom(), 100);
    
    // Also scroll when typing starts
    setTimeout(() => scrollChatToBottom(), 50);
    
    // Additional scroll for first message to ensure it's visible
    if (messages.length === 0) {
      console.log('Chat: First user message detected, applying enhanced scrolling');
      // Multiple scroll attempts for first message to ensure visibility
      setTimeout(() => scrollChatToBottom(), 200);
      setTimeout(() => scrollChatToBottom(), 400);
      setTimeout(() => scrollChatToBottom(), 600);
      // Also scroll the page itself to ensure chat is visible
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 300);
    }

            // Store user message in database if authenticated, otherwise store locally
        if (isAuthenticated && currentConversationId) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email) {
            try {
              console.log('Chat: Storing user message to database for authenticated user:', currentUser.email);
              const storeResult = await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: inputValue,
                sender: 'user',
                timestamp: new Date(),
                conversation_id: currentConversationId
              });
              
              if (!storeResult.success) {
                console.warn('Failed to store user message to database:', storeResult.error);
              } else {
                console.log('Successfully stored user message to database');
              }
            } catch (error) {
              console.error('Error storing user message to database:', error);
            }
          } else {
            console.warn('No valid user found for authenticated state, writing as guest');
            const guestEmail = `guest+${currentConversationId}@investright.local`;
            await chatService.storeMessage({
              user_email: guestEmail,
              message_text: userMessage.text,
              sender: 'user',
              timestamp: userMessage.timestamp,
              conversation_id: currentConversationId
            });
          }
        } else {
          // Unauthenticated: write to DB using guest email
          const guestConvId = currentConversationId || chatService.generateConversationId();
          if (!currentConversationId) setCurrentConversationId(guestConvId);
          const guestEmail = `guest+${guestConvId}@investright.local`;
          await chatService.storeMessage({
            user_email: guestEmail,
            message_text: userMessage.text,
            sender: 'user',
            timestamp: userMessage.timestamp,
            conversation_id: guestConvId
          });
        }

      try {
        // Convert messages to the format expected by the service
        // Use the previous messages (before adding the current user message) to maintain proper conversation flow
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

        console.log('Chat: Sending to Gemini with conversation history length:', conversationHistory.length);
        console.log('Chat: Current user input:', inputValue);
        const response = await sendChatMessageToGemini(inputValue, conversationHistory, { 
          username: authService.getCurrentUser()?.username, 
          isAuthenticated 
        }, currentConversationId);
        console.log('Chat: Received response from service:', {
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
        
        // Enhanced scrolling after bot message - scroll both chat container and messages
        setTimeout(() => scrollChatToBottom(), 100);

        // Store bot message in database if authenticated, otherwise store locally
        if (isAuthenticated && currentConversationId) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.email) {
            try {
              console.log('Chat: Storing bot message to database for authenticated user:', currentUser.email);
              const storeResult = await chatService.storeMessage({
                user_email: currentUser.email,
                message_text: response.message,
                sender: 'bot',
                timestamp: new Date(),
                conversation_id: currentConversationId
              });
              
              if (!storeResult.success) {
                console.warn('Failed to store bot message to database:', storeResult.error);
              } else {
                console.log('Successfully stored bot message to database');
              }
            } catch (error) {
              console.error('Error storing bot message to database:', error);
            }
          } else {
            console.warn('No valid user found for authenticated state, writing as guest');
            const guestEmail = `guest+${currentConversationId}@investright.local`;
            await chatService.storeMessage({
              user_email: guestEmail,
              message_text: botMessage.text,
              sender: 'bot',
              timestamp: botMessage.timestamp,
              conversation_id: currentConversationId
            });
          }
        } else {
          // Unauthenticated: write to DB using guest email
          const guestConvId = currentConversationId || chatService.generateConversationId();
          if (!currentConversationId) setCurrentConversationId(guestConvId);
          const guestEmail = `guest+${guestConvId}@investright.local`;
          await chatService.storeMessage({
            user_email: guestEmail,
            message_text: botMessage.text,
            sender: 'bot',
            timestamp: botMessage.timestamp,
            conversation_id: guestConvId
          });
        }

        // Check if this is a plan generation trigger (should rarely happen now since we generate directly)
        if (response.isGeneratingPlan) {
          console.log('Chat: Investment plan generation triggered');
          setIsGeneratingPlan(true);
          
          // Scroll to bottom when plan generation starts
          setTimeout(() => scrollChatToBottom(), 100);
          
          // Brief delay for UX then turn off loading
          setTimeout(() => {
              setIsGeneratingPlan(false);
              // Focus input after plan generation completes
              focusInputAfterMessage();
              
              // Scroll to bottom when plan generation completes
              setTimeout(() => scrollChatToBottom(), 100);
          }, 500);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        // Do not write errors to localStorage
        
        // Scroll to bottom after error message
        setTimeout(() => scrollChatToBottom(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      // Do not write errors to localStorage
      
      // Scroll to bottom after error message
      setTimeout(() => scrollChatToBottom(), 100);
    } finally {
      setIsTyping(false);
      // Focus input after message is sent and typing is complete
      focusInputAfterMessage();
      
      // Scroll to bottom when typing completes
      setTimeout(() => scrollChatToBottom(), 100);
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSendMessage();
  //   }
  // };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || !userFirstName.trim() || !userLastName.trim()) return;

    setIsEmailSubmitting(true);
    // no-op: emailSubmitted removed
    setShowEmailPopup(false);

    // Save pending conversation directly to DB
    await handleSavePendingConversation();

    // Show auth options
    setShowAuthOptions(true);
    setIsEmailSubmitting(false);
  };

  const handleSaveToAccount = () => {
    console.log('Chat: handleSaveToAccount called');
    console.log('Chat: Current state - showAuthOptions:', showAuthOptions, 'isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('Chat: User is authenticated, saving conversation...');
      handleSavePendingConversation();
    } else {
      console.log('Chat: User not authenticated, showing auth options...');
      setShowAuthOptions(true);
    }
  };

  // Removed manual sync handler; auto-sync occurs when authenticated.

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
        console.log('Chat: Auto-saving conversation after', messages.length, 'messages');
        saveEntireConversation();
      }
    }
  }, [messages.length, isAuthenticated, currentConversationId]);

  const handleSavePendingConversation = async () => {
    try {
      console.log('Chat: Saving pending conversation to account...');
      
      if (messages.length === 0) {
        console.log('Chat: No messages to save');
        alert('ℹ️ No messages to save yet. Start a conversation first!');
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.email) {
        console.log('Chat: No current user or user email found');
        alert('❌ User information not available. Please try logging in again.');
        return;
      }

      if (!currentConversationId) {
        console.log('Chat: No conversation ID, creating new conversation...');
        
        const conversationId = chatService.generateConversationId();
        setCurrentConversationId(conversationId);
        
        let successCount = 0;
        let failedCount = 0;
        
        for (const msg of messages) {
          try {
            const storeResult = await chatService.storeMessage({
              user_email: currentUser.email,
              message_text: msg.text,
              sender: msg.sender as 'user' | 'bot',
              timestamp: msg.timestamp,
              conversation_id: conversationId
            });
            
            if (storeResult.success) {
              successCount++;
            } else {
              console.warn('Failed to store message:', storeResult.error);
              failedCount++;
            }
          } catch (error) {
            console.error('Error storing message:', error);
            failedCount++;
          }
        }
        
        if (successCount > 0) {
          console.log('Chat: Successfully stored', successCount, 'messages, failed:', failedCount);
          
          // Scroll to bottom after syncing messages
          setTimeout(() => scrollChatToBottom(), 200);
          
          // Clear pending conversation only if we had some success
          localStorage.removeItem('pendingConversation');
          localStorage.removeItem('currentChatMessages');
          
          // Dispatch custom event to notify dashboard of new conversation
          window.dispatchEvent(new CustomEvent('conversationSaved', { 
            detail: { conversationId, messageCount: successCount } 
          }));
          
          if (failedCount === 0) {
            alert('✅ Conversation saved to your account successfully!');
          } else {
            alert(`✅ Conversation saved! (${successCount} messages saved, ${failedCount} failed)`);
          }
        } else {
          console.error('Chat: Failed to save any messages');
          alert('❌ Failed to save conversation. Please check your connection and try again.');
        }
      } else {
        console.log('Chat: Conversation already exists with ID:', currentConversationId);
        
        // For existing conversations, just confirm it's already saved
        alert('✅ This conversation is already saved to your account!');
        
        // Clear any pending data since conversation exists
        localStorage.removeItem('pendingConversation');
        localStorage.removeItem('currentChatMessages');
      }
    } catch (error) {
      console.error('Chat: Error saving pending conversation:', error);
      
      // Provide more specific error message
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          alert('❌ Network error. Please check your connection and try again.');
        } else if (error.message.includes('auth')) {
          alert('❌ Authentication error. Please log in again.');
        } else {
          alert('❌ An unexpected error occurred. Please try again.');
        }
      } else {
        alert('❌ An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLogin = async () => {
    console.log('Chat: handleLogin called');
    setShowAuthOptions(false);
    
    // Save pending conversation before navigating
    await handleSavePendingConversation();
    
    // Navigate to login page with return to chat flag
    navigate('/login', { 
      state: { 
        returnToChat: true,
        from: { pathname: '/chat' }
      } 
    });
  };

  const handleSignup = async () => {
    console.log('Chat: handleSignup called');
    setShowAuthOptions(false);
    
    // Save pending conversation before navigating
    await handleSavePendingConversation();
    
    // Navigate to signup page with return to chat flag
    navigate('/signup', { 
      state: { 
        returnToChat: true,
        from: { pathname: '/chat' } 
      } 
    });
  };

  // Show loading state while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication check failed
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-600">{authError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safety check: ensure we have proper authentication state
  if (isAuthenticated) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      console.log('Chat: Authentication state inconsistent, showing error');
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <p className="text-yellow-700">Authentication incomplete. Please refresh the page or log in again.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  }

  // Main chat interface - wrapped in try-catch to prevent white blank page
  try {
    return (
      <section id="chat" className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.chatbot.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.chatbot.subtitle}
            </p>
          </div>

          {/* Chat Container */}
          <div className="max-w-4xl mx-auto">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6 min-h-[500px] max-h-[600px] overflow-y-auto cursor-pointer border border-gray-100 hover:shadow-2xl transition-all duration-300"
              onClick={() => focusInputAfterMessage()}
            >
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-blue-500' 
                            : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {message.sender === 'user' ? 'You' : 'AI Assistant'}
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {isGeneratingPlan && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="text-sm text-green-700 font-medium">Generating your personalized financial plan...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                    disabled={isTyping || isGeneratingPlan}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isGeneratingPlan}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                  Send
                </button>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 mt-6">
                {!isAuthenticated && (
                  <button
                    onClick={handleSaveToAccount}
                    className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    💾 Save & Login
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleSavePendingConversation}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    💾 Save Chat
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Email Popup */}
          {showEmailPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Save Your Progress</h3>
                  <p className="text-gray-600">Enter your details to save this conversation and continue later.</p>
                </div>
                
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={userFirstName}
                      onChange={(e) => setUserFirstName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={userLastName}
                      onChange={(e) => setUserLastName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEmailPopup(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEmailSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isEmailSubmitting ? 'Saving...' : 'Save Progress'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Auth Options Popup */}
          {showAuthOptions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account or Login</h3>
                  <p className="text-gray-600">Your conversation has been saved. Create an account or login to access it anytime.</p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignup}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </button>
                  
                  <button
                    onClick={handleLogin}
                    className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Log In</span>
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAuthOptions(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Continue without account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Chat component rendering error:', error);
    // Fallback UI if main render fails
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-600">Something went wrong loading the chat. Please refresh the page.</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
