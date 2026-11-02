import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = process.env.PASSWORD;
  if (!password) {
    throw new Error('Set PASSWORD to the value that needs hashing.');
  }
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

generateHash().catch(console.error);
