import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id?: number;
  user_email: string;
  message_text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  conversation_id: string;
}

export interface ChatConversation {
  id: string;
  user_email: string;
  title: string;
  summary: string;
  message_count: number;
  created_at: Date;
  last_message_at: Date;
  messages: ChatMessage[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  summary: string;
  message_count: number;
  created_at: Date;
  last_message_at: Date;
}

class ChatService {
  // Store a new message in Supabase
  async storeMessage(message: Omit<ChatMessage, 'id'>): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_email: message.user_email,
          message_text: message.message_text,
          sender: message.sender,
          timestamp: message.timestamp.toISOString(),
          conversation_id: message.conversation_id
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Error in storeMessage:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get all conversations for a user
  async getUserConversations(userEmail: string): Promise<{ success: boolean; conversations?: ConversationSummary[]; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      // Get unique conversation IDs for the user
      const { data: conversationIds, error: convError } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .eq('user_email', userEmail)
        .order('timestamp', { ascending: false });

      if (convError) {
        console.error('Error getting conversation IDs:', convError);
        return { success: false, error: convError.message };
      }

      if (!conversationIds || conversationIds.length === 0) {
        return { success: true, conversations: [] };
      }

      // Get unique conversation IDs
      const uniqueConversationIds = [...new Set(conversationIds.map(c => c.conversation_id))];

      // Get conversation summaries
      const conversations: ConversationSummary[] = [];
      
      for (const convId of uniqueConversationIds) {
        const { data: messages, error: msgError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convId)
          .eq('user_email', userEmail)
          .order('timestamp', { ascending: true });

        if (msgError) {
          console.error('Error getting messages for conversation:', convId, msgError);
          continue;
        }

        if (messages && messages.length > 0) {
          const firstMessage = messages[0];
          const lastMessage = messages[messages.length - 1];
          
          // Generate title from first user message
          let title = 'Investment Discussion';
          const firstUserMessage = messages.find(m => m.sender === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.message_text.length > 50 
              ? firstUserMessage.message_text.substring(0, 50) + '...'
              : firstUserMessage.message_text;
          }

          // Generate summary from conversation
          const summary = this.generateConversationSummary(messages);

          conversations.push({
            id: convId,
            title,
            summary,
            message_count: messages.length,
            created_at: new Date(firstMessage.timestamp),
            last_message_at: new Date(lastMessage.timestamp)
          });
        }
      }

      // Sort by last message date (newest first)
      conversations.sort((a, b) => b.last_message_at.getTime() - a.last_message_at.getTime());

      return { success: true, conversations };
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get full conversation with messages
  async getConversation(conversationId: string, userEmail: string): Promise<{ success: boolean; conversation?: ChatConversation; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_email', userEmail)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting conversation:', error);
        return { success: false, error: error.message };
      }

      if (!messages || messages.length === 0) {
        return { success: false, error: 'Conversation not found' };
      }

      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      
      // Generate title and summary
      let title = 'Investment Discussion';
      const firstUserMessage = messages.find(m => m.sender === 'user');
      if (firstUserMessage) {
        title = firstUserMessage.message_text.length > 50 
          ? firstUserMessage.message_text.substring(0, 50) + '...'
          : firstUserMessage.message_text;
      }

      const summary = this.generateConversationSummary(messages);

      const conversation: ChatConversation = {
        id: conversationId,
        user_email: userEmail,
        title,
        summary,
        message_count: messages.length,
        created_at: new Date(firstMessage.timestamp),
        last_message_at: new Date(lastMessage.timestamp),
        messages: messages.map(msg => ({
          id: msg.id,
          user_email: msg.user_email,
          message_text: msg.message_text,
          sender: msg.sender as 'user' | 'bot',
          timestamp: new Date(msg.timestamp),
          conversation_id: msg.conversation_id
        }))
      };

      return { success: true, conversation };
    } catch (error) {
      console.error('Error in getConversation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Generate a conversation summary
  private generateConversationSummary(messages: any[]): string {
    if (messages.length === 0) return 'No messages';
    
    const userMessages = messages.filter(m => m.sender === 'user');
    const botMessages = messages.filter(m => m.sender === 'bot');
    
    if (userMessages.length === 0) return 'Bot conversation';
    if (botMessages.length === 0) return 'User inquiry';
    
    // Try to find the main topic from user messages
    const firstUserMessage = userMessages[0];
    if (firstUserMessage) {
      const text = firstUserMessage.message_text.toLowerCase();
      if (text.includes('investment') || text.includes('invest')) return 'Investment discussion';
      if (text.includes('goal') || text.includes('plan')) return 'Financial goal planning';
      if (text.includes('risk') || text.includes('tolerance')) return 'Risk assessment';
      if (text.includes('income') || text.includes('salary')) return 'Income planning';
      if (text.includes('retirement') || text.includes('retire')) return 'Retirement planning';
      if (text.includes('house') || text.includes('property')) return 'Property investment';
      if (text.includes('education') || text.includes('study')) return 'Education funding';
    }
    
    return 'Financial advisory session';
  }

  // Create a new conversation ID
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store conversation in localStorage as fallback
  storeConversationLocally(conversation: ChatConversation): void {
    try {
      const key = `chat_conversations_${conversation.user_email}`;
      const existing = localStorage.getItem(key);
      let conversations = existing ? JSON.parse(existing) : [];
      
      // Remove existing conversation with same ID if exists
      conversations = conversations.filter((c: any) => c.id !== conversation.id);
      
      // Add new conversation
      conversations.unshift(conversation);
      
      // Keep only last 10 conversations
      if (conversations.length > 10) {
        conversations = conversations.slice(0, 10);
      }
      
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error storing conversation locally:', error);
    }
  }

  // Get conversations from localStorage as fallback
  getConversationsLocally(userEmail: string): ConversationSummary[] {
    try {
      const key = `chat_conversations_${userEmail}`;
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('Error getting conversations locally:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const chatService = new ChatService();
