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
