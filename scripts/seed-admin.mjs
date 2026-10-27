import fs from 'fs';
import path from 'path';

const seededAdmin = {
  id: 'admin-01',
  name: 'Amani K.',
  email: 'admin@kigalirentals.rw',
  username: 'admin',
  password: 'Kigali@2026',
  role: 'Managing Director',
  badgeCode: 'AD-01',
  seededAt: new Date().toISOString(),
};

const outPath = path.join(process.cwd(), 'src', 'lib', 'seededAdmin.json');
fs.writeFileSync(outPath, JSON.stringify(seededAdmin, null, 2), 'utf8');

console.log('====================================================');
console.log('KIGALI RENTALS - ADMIN ACCOUNT SEEDED SUCCESSFULLY');
console.log('====================================================');
console.log(`Admin Name : ${seededAdmin.name} (${seededAdmin.role})`);
console.log(`Email      : ${seededAdmin.email}`);
console.log(`Username   : ${seededAdmin.username}`);
console.log(`Password   : ${seededAdmin.password}`);
console.log('====================================================');

