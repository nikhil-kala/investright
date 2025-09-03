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

  // Store a complete conversation in Supabase
  async storeConversation(conversation: Omit<ChatConversation, 'id'>): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      // First, create a conversation record
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_email: conversation.user_email,
          title: conversation.title,
          summary: conversation.summary,
          message_count: conversation.message_count,
          created_at: conversation.created_at.toISOString(),
          last_message_at: conversation.last_message_at.toISOString()
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return { success: false, error: convError.message };
      }

      const conversationId = convData.id;

      // Then store all messages with the conversation ID
      for (const message of conversation.messages) {
        await this.storeMessage({
          ...message,
          conversation_id: conversationId
        });
      }

      return { success: true, conversationId };
    } catch (error) {
      console.error('Error in storeConversation:', error);
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

      // First try to get conversations from the conversations table if it exists
      try {
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_email', userEmail)
          .order('last_message_at', { ascending: false });

        if (!convError && conversations && conversations.length > 0) {
          console.log('Found conversations from conversations table:', conversations.length);
          return { 
            success: true, 
            conversations: conversations.map(conv => ({
              id: conv.id,
              title: conv.title,
              summary: conv.summary,
              message_count: conv.message_count,
              created_at: new Date(conv.created_at),
              last_message_at: new Date(conv.last_message_at)
            }))
          };
        }
      } catch (tableError) {
        console.log('Conversations table not available, falling back to message grouping');
      }

      // Fallback: Get unique conversation IDs for the user from chat_messages
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
        console.log('No conversations found for user:', userEmail);
        return { success: true, conversations: [] };
      }

      // Get unique conversation IDs
      const uniqueConversationIds = [...new Set(conversationIds.map(c => c.conversation_id))];
      console.log('Found unique conversation IDs:', uniqueConversationIds);

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

      console.log('Generated conversations from messages:', conversations.length);
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

  // Admin method: Get all conversations from all users
  async getAllConversations(): Promise<{ success: boolean; conversations?: any[]; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      // Get all unique conversation IDs with user info
      const { data: conversationData, error: convError } = await supabase
        .from('chat_messages')
        .select('conversation_id, user_email, timestamp')
        .order('timestamp', { ascending: false });

      if (convError) {
        console.error('Error getting all conversations:', convError);
        return { success: false, error: convError.message };
      }

      if (!conversationData || conversationData.length === 0) {
        return { success: true, conversations: [] };
      }

      // Group by conversation ID and get unique conversations
      const conversationMap = new Map();
      
      conversationData.forEach(item => {
        if (!conversationMap.has(item.conversation_id)) {
          conversationMap.set(item.conversation_id, {
            id: item.conversation_id,
            user_email: item.user_email,
            first_message_time: item.timestamp
          });
        }
      });

      const conversations = [];

      // Get detailed info for each conversation
      for (const [convId, convInfo] of conversationMap) {
        const { data: messages, error: msgError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convId)
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
            user_email: convInfo.user_email,
            title,
            summary,
            message_count: messages.length,
            created_at: new Date(firstMessage.timestamp),
            last_message_at: new Date(lastMessage.timestamp),
            messages: messages // Include all messages for admin view
          });
        }
      }

      // Sort by last message date (newest first)
      conversations.sort((a, b) => b.last_message_at.getTime() - a.last_message_at.getTime());

      return { success: true, conversations };
    } catch (error) {
      console.error('Error in getAllConversations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Admin method: Get conversation stats
  async getConversationStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      // Get total conversation count
      const { data: conversations, error: convError } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .order('timestamp', { ascending: false });

      if (convError) {
        return { success: false, error: convError.message };
      }

      const uniqueConversations = [...new Set(conversations?.map(c => c.conversation_id) || [])];
      
      // Get total message count
      const { count: totalMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      if (msgError) {
        return { success: false, error: msgError.message };
      }

      // Get unique users count
      const { data: users, error: userError } = await supabase
        .from('chat_messages')
        .select('user_email');

      if (userError) {
        return { success: false, error: userError.message };
      }

      const uniqueUsers = [...new Set(users?.map(u => u.user_email) || [])];

      // Get conversations from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentConversations, error: recentError } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .gte('timestamp', weekAgo.toISOString());

      if (recentError) {
        return { success: false, error: recentError.message };
      }

      const recentUniqueConversations = [...new Set(recentConversations?.map(c => c.conversation_id) || [])];

      return {
        success: true,
        stats: {
          totalConversations: uniqueConversations.length,
          totalMessages: totalMessages || 0,
          uniqueUsers: uniqueUsers.length,
          conversationsThisWeek: recentUniqueConversations.length
        }
      };
    } catch (error) {
      console.error('Error in getConversationStats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Migrate all locally stored chats to Supabase for the current authenticated user
  async migrateLocalChatsToSupabase(userEmail: string): Promise<{ success: boolean; migrated: number; errors: number; details?: string[] }> {
    const details: string[] = [];
    try {
      if (!supabase) {
        return { success: false, migrated: 0, errors: 0, details: ['Supabase not configured'] };
      }

      // Gather messages from known localStorage keys
      const migratedMessages: any[] = [];

      // 1) Current chat messages
      try {
        const current = localStorage.getItem('currentChatMessages');
        if (current) {
          const msgs = JSON.parse(current);
          if (Array.isArray(msgs)) {
            migratedMessages.push({ type: 'current', messages: msgs });
          }
        }
      } catch {
        details.push('Failed to parse currentChatMessages');
      }

      // 2) Pending conversation (has messages + conversationId)
      let pendingConversationId: string | null = null;
      try {
        const pending = localStorage.getItem('pendingConversation');
        if (pending) {
          const parsed = JSON.parse(pending);
          if (parsed && Array.isArray(parsed.messages)) {
            pendingConversationId = parsed.conversationId || null;
            migratedMessages.push({ type: 'pending', messages: parsed.messages, conversationId: pendingConversationId });
          }
        }
      } catch {
        details.push('Failed to parse pendingConversation');
      }

      // Nothing to migrate
      if (migratedMessages.length === 0) {
        return { success: true, migrated: 0, errors: 0, details: ['No local chat data found'] };
      }

      let migrated = 0;
      let errors = 0;

      // For each message batch, write to chat_messages
      for (const batch of migratedMessages) {
        const conversationId = batch.conversationId || this.generateConversationId();
        for (const m of batch.messages) {
          try {
            const sender = (m.sender === 'user' || m.sender === 'bot') ? m.sender : (m.sender === 'assistant' ? 'bot' : 'user');
            const timestamp = new Date(m.timestamp || Date.now());
            const messageText = m.text || m.message_text || '';
            if (!messageText) continue;

            const result = await this.storeMessage({
              user_email: userEmail,
              message_text: messageText,
              sender,
              timestamp,
              conversation_id: conversationId
            });

            if (result.success) migrated++; else { errors++; details.push(result.error || 'Unknown store error'); }
          } catch (e) {
            errors++;
            details.push((e as Error).message);
          }
        }
      }

      // Clear local copies after migration
      localStorage.removeItem('currentChatMessages');
      localStorage.removeItem('pendingConversation');

      return { success: errors === 0, migrated, errors, details };
    } catch (e) {
      return { success: false, migrated: 0, errors: 1, details: [(e as Error).message] };
    }
  }
}

// Create and export a singleton instance
export const chatService = new ChatService();
