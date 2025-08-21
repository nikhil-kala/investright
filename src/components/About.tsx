import React, { useState, useEffect } from 'react';
import { Users, Award, Target, Heart, Wrench } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function About() {
  const { t } = useLanguage();
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

  // Function to calculate total life goal amounts from chat conversations
  const calculateTotalLifeGoalAmounts = () => {
    let totalAmount = 0;
    
    try {
      // Extract amounts from all chat conversations
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
                    if (message.role === 'user') {
                      // Look for amounts in user messages (e.g., "I need 50 lakhs", "goal is 2 crore")
                      const amountMatches = message.content.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|crore|crores|cr|cr\+|lakh\+|lakhs\+)/gi);
                      if (amountMatches) {
                        amountMatches.forEach((match: string) => {
                          const [number, unit] = match.toLowerCase().split(/\s+/);
                          const numValue = parseFloat(number);
                          if (!isNaN(numValue)) {
                            if (unit.includes('lakh')) {
                              totalAmount += numValue * 0.01; // Convert lakhs to crores
                            } else if (unit.includes('crore') || unit.includes('cr')) {
                              totalAmount += numValue;
                            }
                          }
                        });
                      }
                      
                      // Also look for amounts in numbers followed by "CR" or "crore"
                      const crMatches = message.content.match(/(\d+(?:\.\d+)?)\s*(?:CR|cr|crore|crores)/gi);
                      if (crMatches) {
                        crMatches.forEach((match: string) => {
                          const number = match.toLowerCase().replace(/\s*(?:cr|crore|crores)/i, '');
                          const numValue = parseFloat(number);
                          if (!isNaN(numValue)) {
                            totalAmount += numValue;
                          }
                        });
                      }
                    }
                  });
                }
              });
            }
          }
        }
      }
      
      // Also check from the general users array if it exists
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach(user => {
            const userChats = localStorage.getItem(`chat_conversations_${user.id}`);
            if (userChats) {
              const parsedUserChats = JSON.parse(userChats);
              if (Array.isArray(parsedUserChats)) {
                parsedUserChats.forEach(conversation => {
                  if (conversation.messages && Array.isArray(conversation.messages)) {
                    conversation.messages.forEach((message: any) => {
                      if (message.role === 'user') {
                        // Look for amounts in user messages
                        const amountMatches = message.content.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|crore|crores|cr|cr\+|lakh\+|lakhs\+)/gi);
                        if (amountMatches) {
                          amountMatches.forEach((match: string) => {
                            const [number, unit] = match.toLowerCase().split(/\s+/);
                            const numValue = parseFloat(number);
                            if (!isNaN(numValue)) {
                              if (unit.includes('lakh')) {
                                totalAmount += numValue * 0.01; // Convert lakhs to crores
                              } else if (unit.includes('crore') || unit.includes('cr')) {
                                totalAmount += numValue;
                              }
                            }
                          });
                        }
                        
                        // Also look for amounts in numbers followed by "CR" or "crore"
                        const crMatches = message.content.match(/(\d+(?:\.\d+)?)\s*(?:CR|cr|crore|crores)/gi);
                        if (crMatches) {
                          crMatches.forEach((match: string) => {
                            const number = match.toLowerCase().replace(/\s*(?:cr|crore|crores)/i, '');
                            const numValue = parseFloat(number);
                            if (!isNaN(numValue)) {
                              totalAmount += numValue;
                            }
                          });
                        }
                      }
                    });
                  }
                });
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error calculating life goal amounts:', error);
    }
    
    return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
  };

  useEffect(() => {
    // Count conversations and calculate amounts on component mount
    setTotalChats(countAllChatConversations());
    setTotalLifeGoalAmount(calculateTotalLifeGoalAmounts());
    
    // Set up interval to update counts every 30 seconds
    const interval = setInterval(() => {
      setTotalChats(countAllChatConversations());
      setTotalLifeGoalAmount(calculateTotalLifeGoalAmounts());
    }, 30000);
    
    // Listen for storage changes to update counts in real-time
    const handleStorageChange = () => {
      setTotalChats(countAllChatConversations());
      setTotalLifeGoalAmount(calculateTotalLifeGoalAmounts());
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

            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              {t.about.startJourney}
            </button>
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