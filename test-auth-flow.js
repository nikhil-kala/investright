// Test script for authentication flow in chatbot
console.log('🧪 Testing Authentication Flow in Chatbot...\n');

// Mock localStorage for testing
const mockLocalStorage = {
  user: null,
  sessionToken: null,
  getItem: function(key) {
    if (key === 'user') return this.user;
    if (key === 'sessionToken') return this.sessionToken;
    return null;
  },
  setItem: function(key, value) {
    if (key === 'user') this.user = value;
    if (key === 'sessionToken') this.sessionToken = value;
  },
  removeItem: function(key) {
    if (key === 'user') this.user = null;
    if (key === 'sessionToken') this.sessionToken = null;
  }
};

// Mock authService for testing
const mockAuthService = {
  isAuthenticated: function() {
    return !!(this.currentUser && this.sessionToken);
  },
  getCurrentUser: function() {
    return this.currentUser;
  },
  initializeAuth: function() {
    try {
      const storedUser = mockLocalStorage.getItem('user');
      const storedToken = mockLocalStorage.getItem('sessionToken');
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.sessionToken = storedToken;
        console.log('✅ Auth initialized from localStorage');
      } else {
        console.log('❌ No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      this.clearAuth();
    }
  },
  clearAuth: function() {
    this.currentUser = null;
    this.sessionToken = null;
    mockLocalStorage.removeItem('user');
    mockLocalStorage.removeItem('sessionToken');
  },
  currentUser: null,
  sessionToken: null
};

// Test scenarios
function testAuthenticationFlow() {
  console.log('📋 Testing Authentication Flow...\n');
  
  // Test 1: No authentication
  console.log('--- Test 1: No Authentication ---');
  mockAuthService.clearAuth();
  mockAuthService.initializeAuth();
  console.log('isAuthenticated:', mockAuthService.isAuthenticated());
  console.log('currentUser:', mockAuthService.getCurrentUser());
  console.log('');
  
  // Test 2: Set authentication
  console.log('--- Test 2: Set Authentication ---');
  const testUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };
  const testToken = 'session_test123_' + Date.now();
  
  mockLocalStorage.setItem('user', JSON.stringify(testUser));
  mockLocalStorage.setItem('sessionToken', testToken);
  
  mockAuthService.initializeAuth();
  console.log('isAuthenticated:', mockAuthService.isAuthenticated());
  console.log('currentUser:', mockAuthService.getCurrentUser());
  console.log('');
  
  // Test 3: Clear authentication
  console.log('--- Test 3: Clear Authentication ---');
  mockAuthService.clearAuth();
  mockAuthService.initializeAuth();
  console.log('isAuthenticated:', mockAuthService.isAuthenticated());
  console.log('currentUser:', mockAuthService.getCurrentUser());
  console.log('');
  
  // Test 4: Simulate login/logout cycle
  console.log('--- Test 4: Login/Logout Cycle ---');
  console.log('Setting up user...');
  mockLocalStorage.setItem('user', JSON.stringify(testUser));
  mockLocalStorage.setItem('sessionToken', testToken);
  mockAuthService.initializeAuth();
  console.log('After login - isAuthenticated:', mockAuthService.isAuthenticated());
  
  console.log('Logging out...');
  mockAuthService.clearAuth();
  mockAuthService.initializeAuth();
  console.log('After logout - isAuthenticated:', mockAuthService.isAuthenticated());
}

// Run tests
testAuthenticationFlow();

console.log('✅ Authentication flow test completed!');
console.log('\n📋 Expected Behavior:');
console.log('1. No auth data → isAuthenticated: false');
console.log('2. Valid auth data → isAuthenticated: true');
console.log('3. Cleared auth data → isAuthenticated: false');
console.log('4. Login/logout cycle should work properly');
console.log('\n🚀 Ready for testing in the chatbot!');
