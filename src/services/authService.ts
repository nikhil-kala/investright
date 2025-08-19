import { supabase } from '../lib/supabase';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message: string;
  token?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // First, try localStorage authentication for demo accounts
      const localStorageUser = this.authenticateFromLocalStorage(credentials);
      if (localStorageUser) {
        return localStorageUser;
      }

      // If no localStorage user found, try Supabase authentication
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase not configured and no demo account found'
        };
      }

      // Call the authenticate_user function in Supabase
      const { data, error } = await supabase.rpc('authenticate_user', {
        user_email: credentials.email,
        user_password: credentials.password
      });

      if (error) {
        console.error('Authentication error:', error);
        return {
          success: false,
          message: 'Authentication failed: ' + error.message
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = data[0];
      
      // Generate a session token
      const sessionToken = this.generateSessionToken();
      
      // Store user session in Supabase
      await this.createUserSession(user.user_id, sessionToken);
      
      // Update last login
      await this.updateLastLogin(user.user_id);
      
      // Store in local state
      this.currentUser = {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role as 'admin' | 'user' | 'moderator',
        is_active: user.is_active,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      this.sessionToken = sessionToken;

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      localStorage.setItem('sessionToken', sessionToken);

      return {
        success: true,
        user: this.currentUser,
        message: 'Login successful',
        token: sessionToken
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  // Authenticate user from localStorage (for demo purposes)
  private authenticateFromLocalStorage(credentials: LoginCredentials): AuthResponse | null {
    try {
      // Check if user exists in localStorage
      const userKey = `user_${credentials.email}`;
      const storedUser = localStorage.getItem(userKey);
      
      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);
      
      // Check if password matches
      if (user.password !== credentials.password) {
        return null;
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Generate a session token
      const sessionToken = this.generateSessionToken();
      
      // Update last login
      user.last_login = new Date().toISOString();
      localStorage.setItem(userKey, JSON.stringify(user));
      
      // Store in local state
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as 'admin' | 'user' | 'moderator',
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      };
      this.sessionToken = sessionToken;

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      localStorage.setItem('sessionToken', sessionToken);

      return {
        success: true,
        user: this.currentUser,
        message: 'Login successful (Demo Account)',
        token: sessionToken
      };

    } catch (error) {
      console.error('LocalStorage authentication error:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<AuthResponse> {
    try {
      if (this.sessionToken) {
        // Remove session from Supabase
        await this.removeUserSession(this.sessionToken);
      }

      // Clear local state
      this.currentUser = null;
      this.sessionToken = null;

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('sessionToken');

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.sessionToken;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get session token
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  // Initialize auth state from localStorage
  initializeAuth(): void {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('sessionToken');
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.sessionToken = storedToken;
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.clearAuth();
    }
  }

  // Clear all auth data
  private clearAuth(): void {
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
  }

  // Generate a random session token
  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Create user session in database
  private async createUserSession(userId: number, token: string): Promise<void> {
    if (!supabase) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: token,
        expires_at: expiresAt.toISOString(),
        ip_address: '127.0.0.1', // You can get real IP in production
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Error creating user session:', error);
    }
  }

  // Remove user session from database
  private async removeUserSession(token: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', token);

    if (error) {
      console.error('Error removing user session:', error);
    }
  }

  // Update last login timestamp
  private async updateLastLogin(userId: number): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Validate session token
  async validateSession(token: string): Promise<boolean> {
    try {
      if (!supabase) return false;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', token)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if user exists in localStorage (for signup validation)
  checkUserExists(email: string): boolean {
    try {
      const userKey = `user_${email}`;
      return !!localStorage.getItem(userKey);
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Initialize auth state when the service is imported
authService.initializeAuth();
