# Supabase Integration Setup Guide

This guide will help you connect your InvestRight project to Supabase.

## 🚀 **Quick Start (5 minutes)**

### 1. **Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Sign up/Login with GitHub
- Click "New Project"
- Choose organization
- Set project name: `investright`
- Set database password (save this!)
- Choose region (closest to your users)
- Click "Create new project"

### 2. **Get Your Credentials**
- In your project dashboard, go to **Settings** → **API**
- Copy these values:
  - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
  - **Anon/Public Key** (starts with `eyJ...`)

### 3. **Set Environment Variables**
- Create `.env` file in your project root
- Add your credentials:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. **Set Up Database**
- In Supabase dashboard, go to **SQL Editor**
- Copy and paste the contents of `supabase-setup.sql`
- Click "Run" to create tables and policies

### 5. **Test Connection**
- Restart your dev server: `npm run dev`
- Open your app in browser
- Look for the "Supabase Connection Test" box (top-right)
- Click "Test Connection"
- You should see "✅ Success: Supabase connection successful!"

## 📊 **Database Schema**

### **contact_submissions** table
- `id`: UUID (auto-generated)
- `name`: User's full name
- `email`: User's email address
- `subject`: Message subject
- `message`: Message content
- `created_at`: Timestamp

### **chat_messages** table
- `id`: UUID (auto-generated)
- `user_message`: What the user typed
- `ai_response`: Gemini AI's response
- `created_at`: Timestamp

## 🔒 **Security Features**

- **Row Level Security (RLS)** enabled on all tables
- **Public insert policies** allow form submissions
- **No public read access** (data is private)
- **UUID primary keys** for security
- **Timestamps** for audit trails

## 🧪 **Testing Your Setup**

### **Test Contact Form**
1. Go to `/contact` page
2. Fill out and submit the form
3. Check Supabase dashboard → **Table Editor** → **contact_submissions**
4. You should see your submission

### **Test Chatbot**
1. Open chatbot on home page
2. Send a message
3. Check **Table Editor** → **chat_messages**
4. Verify both user message and AI response are stored

## 🛠️ **Integration Points**

### **Contact Form** (`src/components/Contact.tsx`)
- ✅ Ready for Supabase integration
- Currently uses simulated submission
- Can be updated to store in database

### **Chatbot** (`src/services/chatbotService.ts`)
- ✅ Ready for Supabase integration
- Currently uses Gemini API
- Can be updated to store conversations

### **Database Types** (`src/types/database.ts`)
- ✅ Full TypeScript support
- Auto-completion for database operations
- Type-safe database queries

## 🔧 **Advanced Features**

### **Real-time Updates**
```typescript
// Subscribe to new contact submissions
const subscription = supabase
  .channel('contact_submissions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
    (payload) => {
      console.log('New submission:', payload.new)
    }
  )
  .subscribe()
```

### **User Authentication**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
```

## 🚨 **Troubleshooting**

### **"Missing Supabase environment variables"**
- Check your `.env` file exists
- Verify variable names are correct
- Restart dev server after adding `.env`

### **"Connection failed"**
- Verify your Project URL and Anon Key
- Check if your Supabase project is active
- Ensure you're not hitting rate limits

### **"Table doesn't exist"**
- Run the SQL setup script in Supabase SQL Editor
- Check if tables were created in Table Editor
- Verify RLS policies are set up

### **CORS Issues**
- Go to Supabase Settings → API
- Add `localhost:5173` to allowed origins
- Or use `*` for development (not recommended for production)

## 📱 **Production Deployment**

### **Environment Variables**
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform
- Never commit `.env` files to version control
- Use different keys for development/staging/production

### **Security**
- Review and update RLS policies
- Consider adding user authentication
- Monitor API usage in Supabase dashboard
- Set up proper CORS origins

## 🎯 **Next Steps**

1. **Test the connection** using the test component
2. **Set up your database** using the SQL script
3. **Integrate contact form** to store submissions
4. **Integrate chatbot** to store conversations
5. **Add real-time features** if needed
6. **Set up user authentication** for admin access

## 📞 **Support**

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord Community**: [supabase.com/discord](https://supabase.com/discord)
- **GitHub Issues**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

---

**Status**: ✅ Supabase client installed and configured
**Next**: Set up your Supabase project and add credentials to `.env`
