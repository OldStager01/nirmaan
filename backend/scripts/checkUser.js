const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function checkUser() {
  try {
    // Check farmer1
    const user = await User.findOne({ where: { username: 'farmer1' } });
    
    if (user) {
      console.log('\n✓ User found:');
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Full Name: ${user.fullName}`);
      console.log(`  Is Active: ${user.isActive}`);
      
      // Test password
      const isMatch = await bcrypt.compare('Farmer@123', user.password);
      console.log(`\n  Password "Farmer@123" matches: ${isMatch ? '✓ YES' : '✗ NO'}`);
      
      if (!isMatch) {
        console.log('\n  Fixing password...');
        const hashedPassword = await bcrypt.hash('Farmer@123', 10);
        await user.update({ password: hashedPassword });
        console.log('  ✓ Password updated successfully!');
      }
    } else {
      console.log('\n✗ User farmer1 not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
