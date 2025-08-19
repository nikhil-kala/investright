# 🚨 Quick Setup Guide - Fix Login Issues

## **Problem:** Cannot login with kale.nikhil@gmail.com / Invest123

## **Solution:** Follow these steps in order

### **Step 1: Check Database Status**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run the `check-database-status.sql` script
5. Check the results - this will tell us what's missing

### **Step 2: If Tables Don't Exist - Run Setup**
If the check shows missing tables, run this **FIRST**:

1. Copy the entire contents of `supabase-user-setup.sql`
2. Paste it in Supabase SQL Editor
3. Click **Run**
4. Wait for all commands to complete

### **Step 3: Verify User Creation**
After running the setup script, run this to verify:

```sql
-- Check if user was created
SELECT 
  id,
  username,
  email,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'kale.nikhil@gmail.com';
```

### **Step 4: Test Authentication**
Test if the login function works:

```sql
-- Test the new password
SELECT * FROM authenticate_user('kale.nikhil@gmail.com', 'Invest123');
```

### **Step 5: If Still Having Issues - Manual User Creation**
If the above doesn't work, manually create the user:

```sql
-- Insert user manually
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
  'kale.nikhil@gmail.com',
  'kale.nikhil@gmail.com',
  encode(sha256('Invest123'::bytea), 'hex'),
  'admin',
  true
);

-- Grant permissions
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  u.id,
  p.permission_name,
  u.id
FROM users u
CROSS JOIN (VALUES 
  ('user_management'),
  ('system_admin'),
  ('data_access'),
  ('analytics')
) AS p(permission_name)
WHERE u.email = 'kale.nikhil@gmail.com';
```

## **Expected Results After Setup:**

✅ Users table exists  
✅ User `kale.nikhil@gmail.com` exists  
✅ Authentication function works  
✅ Login with `Invest123` succeeds  

## **Common Issues:**

1. **"Table doesn't exist"** → Run `supabase-user-setup.sql` first
2. **"Function doesn't exist"** → Run `supabase-user-setup.sql` first  
3. **"User not found"** → Check if user was created in Step 2
4. **"Authentication failed"** → Check password hash matches

## **Need Help?**

Run the `check-database-status.sql` script and share the results - this will tell us exactly what's missing!
