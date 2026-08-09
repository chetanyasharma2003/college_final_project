import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'Admin@12345';
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

generateHash().catch(console.error);
