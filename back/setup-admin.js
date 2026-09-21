const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.log('Usage: node setup-admin.js <username> <password>');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);
  const existing = await db.findUserByUsername(username);

  if (existing) {
    await db.updateUserPassword(username, hash);
    console.log('Password updated for ' + username);
  } else {
    await db.createUser(username, hash);
    console.log('Admin user created: ' + username);
  }

  process.exit(0);
}

main();
