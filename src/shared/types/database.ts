export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: number;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: number;
          user_email: string | null;
          message_text: string;
          sender: 'user' | 'bot';
          timestamp: string;
          conversation_id: string | null;
        };
        Insert: {
          id?: number;
          user_email?: string | null;
          message_text: string;
          sender: 'user' | 'bot';
          timestamp?: string;
          conversation_id?: string | null;
        };
        Update: {
          id?: number;
          user_email?: string | null;
          message_text?: string;
          sender?: 'user' | 'bot';
          timestamp?: string;
          conversation_id?: string | null;
        };
      };
      chat_transcripts: {
        Row: {
          id: number;
          user_email: string;
          conversation_summary: string | null;
          message_count: number;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: number;
          user_email: string;
          conversation_summary?: string | null;
          message_count?: number;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: number;
          user_email?: string;
          conversation_summary?: string | null;
          message_count?: number;
          created_at?: string;
          sent_at?: string | null;
        };
      };
      users: {
        Row: {
          id: number;
          username: string;
          email: string;
          password_hash: string;
          role: 'admin' | 'user' | 'moderator';
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          profile_data: any;
        };
        Insert: {
          id?: number;
          username: string;
          email: string;
          password_hash: string;
          role?: 'admin' | 'user' | 'moderator';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          profile_data?: any;
        };
        Update: {
          id?: number;
          username?: string;
          email?: string;
          password_hash?: string;
          role?: 'admin' | 'user' | 'moderator';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          profile_data?: any;
        };
      };
      user_sessions: {
        Row: {
          id: number;
          user_id: number;
          session_token: string;
          expires_at: string;
          created_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: number;
          user_id: number;
          session_token: string;
          expires_at: string;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: number;
          user_id?: number;
          session_token?: string;
          expires_at?: string;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      user_permissions: {
        Row: {
          id: number;
          user_id: number;
          permission_name: string;
          granted_at: string;
          granted_by: number | null;
        };
        Insert: {
          id?: number;
          user_id: number;
          permission_name: string;
          granted_at?: string;
          granted_by?: number | null;
        };
        Update: {
          id?: number;
          user_id?: number;
          permission_name?: string;
          granted_at?: string;
          granted_by?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_conversation_summary: {
        Args: {
          conv_id: string;
        };
        Returns: {
          message_count: number;
          first_message: string;
          last_message: string;
          conversation_duration: string;
        }[];
      };
      hash_password: {
        Args: {
          password: string;
        };
        Returns: string;
      };
      create_admin_user: {
        Args: {
          admin_username: string;
          admin_email: string;
          admin_password: string;
        };
        Returns: number;
      };
      authenticate_user: {
        Args: {
          user_email: string;
          user_password: string;
        };
        Returns: {
          user_id: number;
          username: string;
          email: string;
          role: string;
          is_active: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
