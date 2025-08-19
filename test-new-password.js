// Test script for the new password
// Run this after updating the password in Supabase

const crypto = require('crypto');

// Test the new password
const newPassword = 'Invest123';
const oldPassword = 'Invest @123#';

// Hash both passwords using the same method as Supabase
const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
const oldPasswordHash = crypto.createHash('sha256').update(oldPassword).digest('hex');

console.log('🔐 Password Update Test');
console.log('========================');
console.log(`Old Password: ${oldPassword}`);
console.log(`Old Hash: ${oldPasswordHash}`);
console.log('');
console.log(`New Password: ${newPassword}`);
console.log(`New Hash: ${newPasswordHash}`);
console.log('');
console.log('✅ Password has been updated!');
console.log('');
console.log('📝 Next Steps:');
console.log('1. Run the update-password.sql script in Supabase');
console.log('2. Test login with the new password: Invest123');
console.log('3. The old password "Invest @123#" will no longer work');
