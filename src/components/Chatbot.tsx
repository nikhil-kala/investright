import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useLanguage } from '../hooks/useLanguage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const { t } = useLanguage();

  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = t.chatbot.responses[Math.floor(Math.random() * t.chatbot.responses.length)];
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden sm:inline font-medium">{t.chatbot.buttonText}</span>
          </button>
        )}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1 rounded">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">{t.chatbot.title}</h3>
                <p className="text-xs text-blue-100">{t.chatbot.status}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">{t.chatbot.buttonText}</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%]`}>
                  {message.sender === 'bot' && (
                    <div className="bg-blue-100 p-1 rounded-full flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-700" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-700 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="bg-blue-700 p-1 rounded-full flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.chatbot.placeholder}
                placeholder={t.chatbot.placeholder}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-700 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}