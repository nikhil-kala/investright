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
