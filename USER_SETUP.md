# User Management System Setup

This document explains how to set up the user management system in your InvestRight application with Supabase.

## 🚀 **Quick Setup**

### **1. Run the SQL Script**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase-user-setup.sql`
5. Click **Run** to execute the script

### **2. What Gets Created**

The script will create:

- ✅ **`users`** table - Stores user accounts
- ✅ **`user_sessions`** table - Manages login sessions
- ✅ **`user_permissions`** table - Handles user permissions
- ✅ **Admin user** with credentials:
  - **Email:** `kale.nikhil@gmail.com`
  - **Password:** `Invest123`
  - **Role:** `admin`

## 🔐 **Admin User Details**

After running the script, you'll have an admin user with:

- **Full system access**
- **User management permissions**
- **Analytics access**
- **Data access permissions**

## 🛠️ **Using the Auth Service**

### **Import the Service**

```typescript
import { authService } from '../services/authService';
```

### **Login**

```typescript
const loginResult = await authService.login({
  email: 'kale.nikhil@gmail.com',
  password: 'Invest @123#'
});

if (loginResult.success) {
  console.log('Welcome,', loginResult.user?.username);
} else {
  console.error('Login failed:', loginResult.message);
}
```

### **Check Authentication**

```typescript
if (authService.isAuthenticated()) {
  console.log('User is logged in');
  
  if (authService.isAdmin()) {
    console.log('User is an admin');
  }
}
```

### **Get Current User**

```typescript
const currentUser = authService.getCurrentUser();
console.log('Current user:', currentUser);
```

### **Logout**

```typescript
await authService.logout();
console.log('User logged out');
```

## 🔒 **Security Features**

- **Password Hashing** - Passwords are securely hashed using SHA-256
- **Session Management** - Secure session tokens with expiration
- **Row Level Security** - Database-level access control
- **Permission System** - Granular user permissions

## 📊 **Database Schema**

### **Users Table**
```sql
- id: Primary key
- username: Unique username
- email: Unique email address
- password_hash: Hashed password
- role: admin/user/moderator
- is_active: Account status
- created_at: Account creation time
- last_login: Last login timestamp
- profile_data: JSON profile information
```

### **User Sessions Table**
```sql
- id: Primary key
- user_id: Reference to users table
- session_token: Unique session identifier
- expires_at: Session expiration time
- ip_address: User's IP address
- user_agent: Browser information
```

### **User Permissions Table**
```sql
- id: Primary key
- user_id: Reference to users table
- permission_name: Permission identifier
- granted_at: When permission was granted
- granted_by: Who granted the permission
```

## 🚨 **Important Notes**

### **Password Security**
- The current implementation uses SHA-256 for demonstration
- **For production, implement bcrypt or Argon2**
- Never store plain-text passwords

### **Session Security**
- Sessions expire after 24 hours
- Session tokens are cryptographically random
- IP addresses and user agents are logged

### **Environment Variables**
Make sure your `.env` file contains:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 **Customization**

### **Add New Roles**
```sql
ALTER TABLE users 
DROP CONSTRAINT users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user', 'moderator', 'premium', 'trial'));
```

### **Add New Permissions**
```sql
INSERT INTO user_permissions (user_id, permission_name, granted_by)
VALUES (1, 'premium_features', 1);
```

### **Modify Session Duration**
In `authService.ts`, change:
```typescript
expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
```

## 🧪 **Testing**

### **Test Admin Login**
```typescript
// This should work after setup
const result = await authService.login({
  email: 'kale.nikhil@gmail.com',
  password: 'Invest123'
});

console.log('Login result:', result);
```

### **Test Permissions**
```typescript
if (authService.isAdmin()) {
  console.log('User has admin access');
} else {
  console.log('User is a regular user');
}
```

## 📞 **Support**

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase connection
3. Ensure the SQL script ran successfully
4. Check that environment variables are loaded

## 🎯 **Next Steps**

After setup, you can:

1. **Integrate with your Login component**
2. **Add user registration functionality**
3. **Implement password reset**
4. **Add user profile management**
5. **Create admin dashboard**

Your user management system is now ready to use! 🎉
