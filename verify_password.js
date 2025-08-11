const bcrypt = require('bcrypt');

const password = '123qwe';
const saltRounds = 10;

async function verifyAndGenerateHash() {
  try {
    // Generate a new hash
    const newHash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('New Hash:', newHash);
    
    // Verify the old hash
    const oldHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const isOldHashValid = await bcrypt.compare(password, oldHash);
    console.log('Old hash valid:', isOldHashValid);
    
    // Verify the new hash
    const isNewHashValid = await bcrypt.compare(password, newHash);
    console.log('New hash valid:', isNewHashValid);
    
    console.log('\nSQL UPDATE statement:');
    console.log(`UPDATE User SET password = '${newHash}' WHERE username = 'surafel';`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAndGenerateHash();
