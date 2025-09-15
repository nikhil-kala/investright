import React, { useState, useEffect } from 'react';
import { Users, Award, Target, Heart, Wrench, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { chatService } from '../services/chatService';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [totalChats, setTotalChats] = useState(0);
  const [totalLifeGoalAmount, setTotalLifeGoalAmount] = useState(0);

  // Function to count all chat conversations from localStorage
  const countAllChatConversations = () => {
    let totalCount = 0;
    
    try {
      // Count conversations from all users
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_conversations_')) {
          const conversations = localStorage.getItem(key);
          if (conversations) {
            const parsedConversations = JSON.parse(conversations);
            if (Array.isArray(parsedConversations)) {
              totalCount += parsedConversations.length;
            }
          }
        }
      }
      
      // Also count from the general users array if it exists
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach(user => {
            const userChats = localStorage.getItem(`chat_conversations_${user.id}`);
            if (userChats) {
              const parsedUserChats = JSON.parse(userChats);
              if (Array.isArray(parsedUserChats)) {
                totalCount += parsedUserChats.length;
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error counting chat conversations:', error);
    }
    
    return totalCount;
  };

  // Enhanced function to extract amounts from message text
  const extractAmountsFromText = (text: string): number => {
    // Use a Set to store unique amount matches to avoid double counting
    const uniqueAmounts = new Set<string>();
    
    // Comprehensive regex pattern to catch all amount formats
    const pattern = /(?:₹|Rs\.?|need|goal|want|require|target|save|buy|purchase|invest|investing|investment|cost|costs|price|worth|value)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|crore|crores|cr|lac|lacs)\b/gi;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const number = match[1];
      const unit = match[2].toLowerCase();
      
      // Create a unique key for this amount to avoid duplicates
      const amountKey = `${number}_${unit}`;
      uniqueAmounts.add(amountKey);
    }
    
    // Calculate total from unique amounts
    let totalAmount = 0;
    uniqueAmounts.forEach(amountKey => {
      const [number, unit] = amountKey.split('_');
      const numValue = parseFloat(number);
      
      if (!isNaN(numValue)) {
        if (unit.includes('lakh') || unit.includes('lac')) {
          totalAmount += numValue * 0.01; // Convert lakhs to crores
        } else if (unit.includes('crore') || unit.includes('cr')) {
          totalAmount += numValue;
        }
      }
    });
    
    return totalAmount;
  };

  // Function to calculate total life goal amounts from chat conversations
  const calculateTotalLifeGoalAmounts = async () => {
    let totalAmount = 0;
    
    try {
      console.log('🔢 Starting goal amount calculation...');
      
      // Extract amounts from localStorage conversations (existing functionality)
      console.log('📱 Extracting from localStorage conversations...');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_conversations_')) {
          const conversations = localStorage.getItem(key);
          if (conversations) {
            const parsedConversations = JSON.parse(conversations);
            if (Array.isArray(parsedConversations)) {
              parsedConversations.forEach(conversation => {
                if (conversation.messages && Array.isArray(conversation.messages)) {
                  conversation.messages.forEach((message: any) => {
                    // Only extract from user messages, not bot messages
                    if (message.sender === 'user' || message.role === 'user') {
                      const messageText = message.text || message.content || '';
                      if (messageText && messageText.trim()) {
                        const amount = extractAmountsFromText(messageText);
                        if (amount > 0) {
                          console.log(`💰 Found amount: ₹${amount} CR from: "${messageText.substring(0, 50)}..."`);
                          totalAmount += amount;
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        }
      }
      
      // Extract amounts from database conversations (Supabase)
      console.log('🗄️ Extracting from database conversations...');
      const databaseResult = await chatService.getAllConversations();
      
      if (databaseResult.success && databaseResult.conversations) {
        console.log(`📊 Found ${databaseResult.conversations.length} database conversations`);
        
        databaseResult.conversations.forEach(conversation => {
          if (conversation.messages && Array.isArray(conversation.messages)) {
            conversation.messages.forEach((message: any) => {
              // Only extract from user messages, not bot messages
              if (message.sender === 'user') {
                const messageText = message.message_text || '';
                if (messageText && messageText.trim()) {
                  const amount = extractAmountsFromText(messageText);
                  if (amount > 0) {
                    console.log(`💰 Found DB amount: ₹${amount} CR from: "${messageText.substring(0, 50)}..."`);
                    totalAmount += amount;
                  }
                }
              }
            });
          }
        });
      } else {
        console.log('ℹ️ No database conversations found or error:', databaseResult.error);
      }
      
      // Check pending conversations in localStorage
      console.log('⏳ Checking pending conversations...');
      const pendingConversation = localStorage.getItem('pendingConversation');
      if (pendingConversation) {
        try {
          const parsed = JSON.parse(pendingConversation);
          if (parsed.messages && Array.isArray(parsed.messages)) {
            parsed.messages.forEach((message: any) => {
              // Only extract from user messages, not bot messages
              if (message.sender === 'user') {
                const messageText = message.text || '';
                if (messageText && messageText.trim()) {
                  const amount = extractAmountsFromText(messageText);
                  if (amount > 0) {
                    console.log(`💰 Found pending amount: ₹${amount} CR from: "${messageText.substring(0, 50)}..."`);
                    totalAmount += amount;
                  }
                }
              }
            });
          }
        } catch (e) {
          console.error('Error parsing pending conversation:', e);
        }
      }
      
      const finalAmount = Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
      console.log(`✅ Total goal amount calculated: ₹${finalAmount} CR`);
      
      return finalAmount;
      
    } catch (error) {
      console.error('Error calculating total life goal amounts:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Function to load data asynchronously
    const loadData = async () => {
      console.log('🔄 Loading About component data...');
      setTotalChats(countAllChatConversations());
      
      const goalAmount = await calculateTotalLifeGoalAmounts();
      setTotalLifeGoalAmount(goalAmount);
    };
    
    // Load data on component mount
    loadData();
    
    // Set up interval to update counts every 60 seconds (increased to reduce API calls)
    const interval = setInterval(async () => {
      console.log('🔄 Refreshing About component data...');
      setTotalChats(countAllChatConversations());
      
      const goalAmount = await calculateTotalLifeGoalAmounts();
      setTotalLifeGoalAmount(goalAmount);
    }, 60000);
    
    // Listen for storage changes to update counts in real-time
    const handleStorageChange = async () => {
      console.log('📱 Storage change detected, updating data...');
      setTotalChats(countAllChatConversations());
      
      const goalAmount = await calculateTotalLifeGoalAmounts();
      setTotalLifeGoalAmount(goalAmount);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t.about.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t.about.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {totalChats > 0 ? `${totalChats}+` : '0'}
                </div>
                <div className="text-sm text-gray-600">{t.about.activeInvestors}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {totalLifeGoalAmount > 0 ? `₹${totalLifeGoalAmount} CR+` : '₹0 CR+'}
                </div>
                <div className="text-sm text-gray-600">{t.about.assetsUnderManagement}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/chat')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {t.about.startJourney}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <Users className="h-8 w-8 text-blue-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.communityFocused.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.communityFocused.description}</p>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-xl">
              <Wrench className="h-8 w-8 text-emerald-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Built By Experts</h3>
              <p className="text-gray-600 text-sm">{t.about.awardWinning.description}</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-xl">
              <Target className="h-8 w-8 text-amber-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.goalOriented.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.goalOriented.description}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl">
              <Heart className="h-8 w-8 text-purple-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.transparent.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.transparent.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}