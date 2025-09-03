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

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  message: string;
}

// Lightweight client-side SHA-256 hashing to match the DB function hash_password
async function hashPasswordClientSide(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
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
        const parsedUser = JSON.parse(storedUser);
        
        // Validate that the user object has required fields
        if (parsedUser && parsedUser.email && parsedUser.id) {
          this.currentUser = parsedUser;
          this.sessionToken = storedToken;
          console.log('Auth initialized successfully for user:', parsedUser.email);
        } else {
          console.warn('Invalid user data found in localStorage, clearing auth');
          this.clearAuth();
        }
      } else {
        console.log('No stored auth found, user not authenticated');
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

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      // First try to get from Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching users from Supabase:', error);
            // Don't throw error, fall back to localStorage
          } else if (data && data.length > 0) {
            return data.map(user => ({
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role as 'admin' | 'user' | 'moderator',
              is_active: user.is_active,
              created_at: user.created_at,
              last_login: user.last_login
            }));
          }
        } catch (supabaseError) {
          console.error('Supabase query failed, falling back to localStorage:', supabaseError);
        }
      }

      // Fallback to localStorage
      const users = localStorage.getItem('users');
      if (users) {
        try {
          const parsedUsers = JSON.parse(users);
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            return parsedUsers.sort((a, b) => 
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
          }
        } catch (parseError) {
          console.error('Error parsing localStorage users:', parseError);
        }
      }

      // If no users found anywhere, create some sample users for demo
      const sampleUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@investright.com',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        },
        {
          id: 2,
          username: 'john_doe',
          email: 'john@example.com',
          role: 'user',
          is_active: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 3,
          username: 'jane_smith',
          email: 'jane@example.com',
          role: 'user',
          is_active: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
          id: 4,
          username: 'moderator1',
          email: 'mod@example.com',
          role: 'moderator',
          is_active: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          last_login: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          id: 5,
          username: 'alex_wilson',
          email: 'alex@example.com',
          role: 'user',
          is_active: true,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          last_login: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        },
        {
          id: 6,
          username: 'sarah_jones',
          email: 'sarah@example.com',
          role: 'user',
          is_active: false,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 7,
          username: 'mike_brown',
          email: 'mike@example.com',
          role: 'user',
          is_active: true,
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          last_login: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        },
        {
          id: 8,
          username: 'lisa_davis',
          email: 'lisa@example.com',
          role: 'moderator',
          is_active: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          last_login: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        }
      ];

      // Store sample users in localStorage for future use
      localStorage.setItem('users', JSON.stringify(sampleUsers));
      
      return sampleUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Update user profile (first name, last name, email)
  async updateUserProfile(userId: number, firstName: string, lastName: string, email: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const newUsername = `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`;
      
      // First try to update in Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .update({ 
            username: newUsername,
            email: email,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating profile in Supabase:', error);
          throw error;
        }

        if (data) {
          // Update current user in memory
          if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser.username = data.username;
            this.currentUser.email = data.email;
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }

          const updatedUser: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role as 'admin' | 'user' | 'moderator',
            is_active: data.is_active,
            created_at: data.created_at,
            last_login: data.last_login
          };

          return {
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
          };
        }
      }

      // Fallback: Update in localStorage
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        const userIndex = parsedUsers.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          parsedUsers[userIndex].username = newUsername;
          parsedUsers[userIndex].email = email;
          parsedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('users', JSON.stringify(parsedUsers));
        }
      }

      // Update current user in memory
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.username = newUsername;
        this.currentUser.email = email;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }

      return {
        success: true,
        message: 'Profile updated successfully (local storage)'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Failed to update profile: ' + (error as Error).message
      };
    }
  }

  // Reset user password (admin only)
  async resetUserPassword(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // First try to update in Supabase
      if (supabase) {
        const { error } = await supabase
          .from('users')
          .update({ 
            password_hash: newPassword, // In production, this should be hashed
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating password in Supabase:', error);
          throw error;
        }
      }

      // Also update in localStorage as backup
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        const userIndex = parsedUsers.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          parsedUsers[userIndex].password_hash = newPassword;
          parsedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('users', JSON.stringify(parsedUsers));
        }
      }

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Failed to reset password: ' + (error as Error).message
      };
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

  // Create demo users for testing
  createDemoUsers(): void {
    try {
      // Check if demo users already exist
      if (this.checkUserExists('demo@investright.com')) {
        console.log('Demo users already exist');
        return;
      }

      // Create demo admin user
      const demoAdmin = {
        id: 1,
        username: 'DemoAdmin',
        email: 'demo@investright.com',
        password: 'demo123',
        role: 'admin' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      };

      // Create demo regular user
      const demoUser = {
        id: 2,
        username: 'DemoUser',
        email: 'user@investright.com',
        password: 'user123',
        role: 'user' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      };

      // Store demo users
      localStorage.setItem(`user_${demoAdmin.email}`, JSON.stringify(demoAdmin));
      localStorage.setItem(`user_${demoUser.email}`, JSON.stringify(demoUser));

      console.log('Demo users created successfully');
      console.log('Admin: demo@investright.com / demo123');
      console.log('User: user@investright.com / user123');
    } catch (error) {
      console.error('Error creating demo users:', error);
    }
  }

  async register(input: RegisterInput): Promise<RegisterResponse> {
    try {
      const username = `${input.firstName.trim().toLowerCase()}.${input.lastName.trim().toLowerCase()}`;
      const role: 'admin' | 'user' | 'moderator' = input.role || 'user';
      const nowIso = new Date().toISOString();

      if (supabase) {
        // Hash password client-side to align with authenticate_user()
        const passwordHash = await hashPasswordClientSide(input.password);

        const { data, error } = await supabase
          .from('users')
          .insert({
            username,
            email: input.email,
            password_hash: passwordHash,
            role,
            is_active: true,
            created_at: nowIso,
            updated_at: nowIso,
            last_login: null
          })
          .select('*')
          .single();

        if (error) {
          // Unique constraint or other DB error
          return { success: false, message: error.message };
        }

        if (!data) {
          return { success: false, message: 'Registration failed. No data returned.' };
        }

        const user: User = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role as 'admin' | 'user' | 'moderator',
          is_active: data.is_active,
          created_at: data.created_at,
          last_login: data.last_login
        };

        return { success: true, user, message: 'Account created successfully' };
      }

      // Fallback (no Supabase configured): store in localStorage as a single source
      const userAccount = {
        id: Date.now(),
        username,
        email: input.email,
        // plaintext for demo fallback only
        password: input.password,
        role,
        is_active: true,
        created_at: nowIso,
        last_login: null
      };

      localStorage.setItem(`user_${input.email}`, JSON.stringify(userAccount));
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(userAccount);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      const fallbackUser: User = {
        id: userAccount.id,
        username: userAccount.username,
        email: userAccount.email,
        role: userAccount.role,
        is_active: userAccount.is_active,
        created_at: userAccount.created_at,
        last_login: userAccount.last_login
      };

      return { success: true, user: fallbackUser, message: 'Account created successfully (local)' };
    } catch (error) {
      return { success: false, message: (error instanceof Error ? error.message : 'Unknown registration error') };
    }
  }

  async migrateLocalUsersToSupabase(): Promise<{ success: boolean; migrated: number; skipped: number; errors: number; details?: string[] }> {
    const details: string[] = [];
    try {
      if (!supabase) {
        return { success: false, migrated: 0, skipped: 0, errors: 0, details: ['Supabase not configured'] };
      }

      const localUsers: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.email) {
                localUsers.push(parsed);
              }
            } catch {
              details.push(`Failed to parse ${key}`);
            }
          }
        }
      }

      try {
        const consolidated = localStorage.getItem('users');
        if (consolidated) {
          const parsed = JSON.parse(consolidated);
          if (Array.isArray(parsed)) {
            parsed.forEach(u => {
              if (u && u.email && !localUsers.find(x => x.email === u.email)) {
                localUsers.push(u);
              }
            });
          }
        }
      } catch {
        details.push('Failed to parse consolidated users array');
      }

      if (localUsers.length === 0) {
        return { success: true, migrated: 0, skipped: 0, errors: 0, details: ['No local users found'] };
      }

      let migrated = 0;
      let skipped = 0;
      let errors = 0;

      for (const u of localUsers) {
        try {
          const username = (u.username || `${(u.firstName||'user').toLowerCase()}.${(u.lastName||'local').toLowerCase()}`).toLowerCase();
          const role: 'admin' | 'user' | 'moderator' = (u.role === 'admin' || u.role === 'moderator') ? u.role : 'user';
          const createdAt = u.created_at || new Date().toISOString();
          const lastLogin = u.last_login || null;

          let passwordHash = '';
          if (u.password && typeof u.password === 'string') {
            passwordHash = await hashPasswordClientSide(u.password);
          } else if (u.password_hash && typeof u.password_hash === 'string') {
            passwordHash = u.password_hash;
          } else {
            passwordHash = await hashPasswordClientSide('Temp#' + Math.random().toString(36).slice(2));
          }

          const { error } = await supabase
            .from('users')
            .upsert({
              username,
              email: u.email,
              password_hash: passwordHash,
              role,
              is_active: u.is_active !== false,
              created_at: createdAt,
              updated_at: new Date().toISOString(),
              last_login: lastLogin
            }, { onConflict: 'email' });

          if (error) {
            errors++;
            details.push(`Error upserting ${u.email}: ${error.message}`);
          } else {
            migrated++;
          }
        } catch (e) {
          errors++;
          details.push(`Exception for ${u?.email || 'unknown'}: ${(e as Error).message}`);
        }
      }

      return { success: errors === 0, migrated, skipped, errors, details };
    } catch (e) {
      return { success: false, migrated: 0, skipped: 0, errors: 1, details: [(e as Error).message] };
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Initialize auth state when the service is imported
authService.initializeAuth();

// Create demo users for testing
authService.createDemoUsers();
