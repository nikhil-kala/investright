// Script to fix created_at date in localStorage
console.log('Fixing created_at date...');

// Clear all auth data
localStorage.removeItem('user');
localStorage.removeItem('sessionToken');

// Clear all user accounts with today's date
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('user_')) {
    const userData = JSON.parse(localStorage.getItem(key));
    const today = new Date().toDateString();
    const userCreatedDate = new Date(userData.created_at).toDateString();
    
    if (userCreatedDate === today) {
      console.log('Found user with today\'s date:', userData.email);
      keysToRemove.push(key);
    }
  }
}

// Remove users with today's date
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('Removed user with today\'s date:', key);
});

console.log('Fix complete. Please refresh the page and log in again.');
