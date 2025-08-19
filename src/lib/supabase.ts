import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
})

// Create client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

console.log('🔧 Supabase client created:', !!supabase)

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Test connection function
export const testSupabaseConnection = async () => {
  if (!supabase) {
    return { 
      success: false, 
      message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' 
    }
  }

  try {
    // First try a simple ping to the Supabase URL
    const pingResponse = await fetch(supabaseUrl, {
      method: 'HEAD',
      mode: 'cors'
    });
    
    if (!pingResponse.ok) {
      return { success: false, message: `Cannot reach Supabase URL. Status: ${pingResponse.status}` }
    }
    
    // Now try the API endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      return { success: true, message: 'Supabase connection successful! API endpoint responding.' }
    } else {
      return { success: false, message: `API responded with status: ${response.status}` }
    }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { 
      success: false, 
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
