const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixAllPasswords() {
  try {
    console.log('\n🔧 Fixing all farmer passwords...\n');
    
    // Get all farmers (farmer1 - farmer20)
    const farmers = await User.findAll({
      where: {
        username: {
          [require('sequelize').Op.in]: [
            'farmer1', 'farmer2', 'farmer3', 'farmer4', 'farmer5',
            'farmer6', 'farmer7', 'farmer8', 'farmer9', 'farmer10',
            'farmer11', 'farmer12', 'farmer13', 'farmer14', 'farmer15',
            'farmer16', 'farmer17', 'farmer18', 'farmer19', 'farmer20',
            'farmer', 'admin'
          ]
        }
      }
    });

    console.log(`Found ${farmers.length} users to check\n`);

    // Don't hash passwords - let the model hook do it
    const farmerPassword = 'Farmer@123';
    const adminPassword = 'Admin@123';

    for (const user of farmers) {
      const targetPassword = user.username === 'admin' ? 'Admin@123' : 'Farmer@123';
      const rawPassword = user.username === 'admin' ? adminPassword : farmerPassword;
      
      // Test current password
      const isMatch = await bcrypt.compare(targetPassword, user.password);
      
      if (!isMatch) {
        console.log(`❌ ${user.username} - Password incorrect, fixing...`);
        // Use raw password - the beforeUpdate hook will hash it
        await user.update({ password: rawPassword });
        console.log(`✅ ${user.username} - Password updated to ${targetPassword}`);
      } else {
        console.log(`✓  ${user.username} - Password already correct (${targetPassword})`);
      }
    }

    console.log('\n✅ All passwords verified and fixed!\n');
    console.log('📋 Login Credentials:');
    console.log('   admin / Admin@123');
    console.log('   farmer / Farmer@123');
    console.log('   farmer1-farmer20 / Farmer@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllPasswords();
