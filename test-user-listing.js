// Test script for user listing functionality
console.log('🧪 Testing User Listing Functionality...\n');

// Test 1: Check localStorage for existing users
console.log('📊 Test 1: Checking localStorage for existing users');
const localStorageUsers = localStorage.getItem('users');
if (localStorageUsers) {
  try {
    const users = JSON.parse(localStorageUsers);
    console.log('✅ Found users in localStorage:', users.length);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('❌ Error parsing localStorage users:', error);
  }
} else {
  console.log('ℹ️ No users found in localStorage');
}

// Test 2: Check dashboard_users
console.log('\n📊 Test 2: Checking dashboard_users');
const dashboardUsers = localStorage.getItem('dashboard_users');
if (dashboardUsers) {
  try {
    const users = JSON.parse(dashboardUsers);
    console.log('✅ Found users in dashboard_users:', users.length);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('❌ Error parsing dashboard_users:', error);
  }
} else {
  console.log('ℹ️ No users found in dashboard_users');
}

// Test 3: Check for user_ keys in localStorage
console.log('\n📊 Test 3: Checking for user_ keys in localStorage');
let userKeyCount = 0;
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('user_')) {
    userKeyCount++;
    console.log(`  Found user key: ${key}`);
  }
}
console.log(`Total user_ keys found: ${userKeyCount}`);

// Test 4: Create sample users if none exist
console.log('\n📊 Test 4: Creating sample users if none exist');
if (!localStorageUsers && !dashboardUsers && userKeyCount === 0) {
  console.log('Creating sample users...');
  const sampleUsers = [
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
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'user',
      is_active: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      username: 'moderator1',
      email: 'mod@example.com',
      role: 'moderator',
      is_active: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(sampleUsers));
  localStorage.setItem('dashboard_users', JSON.stringify(sampleUsers));
  console.log('✅ Created sample users:', sampleUsers.length);
} else {
  console.log('ℹ️ Sample users already exist');
}

// Test 5: Verify final state
console.log('\n📊 Test 5: Final verification');
const finalUsers = localStorage.getItem('users');
if (finalUsers) {
  try {
    const users = JSON.parse(finalUsers);
    console.log('✅ Final user count:', users.length);
    console.log('Users available for dashboard:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role} - Active: ${user.is_active}`);
    });
  } catch (error) {
    console.error('❌ Error parsing final users:', error);
  }
}

console.log('\n🚀 User listing test completed!');
console.log('💡 If you see multiple users above, the dashboard should now display all of them.');
console.log('💡 Make sure to run the updated supabase-setup.sql in your database to create the users table.');
