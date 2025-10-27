// Test admin password
import bcrypt from 'bcryptjs';

const hash = '$2b$10$cwcEvhmg35Li0x5pzp748urBUJNQ5U1uY1j5PAKeH8MTMc.1LJTJm';

const passwords = ['admin123', 'Admin123', 'password', 'admin', '123456'];

console.log('Testing passwords against admin hash...\n');

for (const password of passwords) {
  const match = bcrypt.compareSync(password, hash);
  console.log(`Password "${password}": ${match ? '✅ MATCH' : '❌ no match'}`);
}
