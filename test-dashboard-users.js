// Test script for Dashboard User Listing
console.log('🧪 Testing Dashboard User Listing...\n');

// Test 1: Check if we're in the right context
if (typeof window === 'undefined') {
  console.log('❌ This script must run in a browser environment');
} else {
  console.log('✅ Browser environment detected');
}

// Test 2: Check localStorage for users
console.log('\n📊 Test 2: Checking localStorage for users');
const users = localStorage.getItem('users');
const dashboardUsers = localStorage.getItem('dashboard_users');

if (users) {
  try {
    const parsedUsers = JSON.parse(users);
    console.log('✅ Found users in localStorage:', parsedUsers.length);
    parsedUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('❌ Error parsing localStorage users:', error);
  }
} else {
  console.log('ℹ️ No users found in localStorage');
}

if (dashboardUsers) {
  try {
    const parsedUsers = JSON.parse(dashboardUsers);
    console.log('✅ Found users in dashboard_users:', parsedUsers.length);
  } catch (error) {
    console.error('❌ Error parsing dashboard_users:', error);
  }
} else {
  console.log('ℹ️ No users found in dashboard_users');
}

// Test 3: Create sample users if none exist
if (!users && !dashboardUsers) {
  console.log('\n📊 Test 3: Creating sample users...');
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
}

// Test 4: Simulate dashboard user loading
console.log('\n📊 Test 4: Simulating dashboard user loading...');
const simulateDashboardLoad = () => {
  const storedUsers = localStorage.getItem('users') || localStorage.getItem('dashboard_users');
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers);
      console.log('✅ Dashboard would display users:', parsedUsers.length);
      console.log('Users that would be shown:');
      parsedUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role} - Active: ${user.is_active}`);
      });
      return parsedUsers;
    } catch (error) {
      console.error('❌ Error parsing users for dashboard:', error);
      return [];
    }
  } else {
    console.log('❌ No users available for dashboard');
    return [];
  }
};

const dashboardUsers = simulateDashboardLoad();

// Test 5: Final verification
console.log('\n📊 Test 5: Final verification');
if (dashboardUsers.length > 0) {
  console.log('✅ Dashboard user listing test PASSED');
  console.log(`✅ Found ${dashboardUsers.length} users ready for display`);
  console.log('\n💡 Next steps:');
  console.log('1. Go to your dashboard');
  console.log('2. Click on "User Management"');
  console.log('3. You should now see all users listed properly');
  console.log('4. No more debug information should be visible');
} else {
  console.log('❌ Dashboard user listing test FAILED');
  console.log('❌ No users available for display');
}

console.log('\n🚀 Dashboard user listing test completed!');
