// seed_users.js
// Run this script with `node seed_users.js` from the project root.
// It inserts two initial user records: one student and one staff.

import { getPool } from '../server/utils/db.js';

async function seed() {
  const pool = getPool();
  const passwordText = 'password123';
  const users = [
    { email: 'student@example.com', password: passwordText, type: 'student' },
    { email: 'staff@example.com', password: passwordText, type: 'staff' },
  ];

  for (const user of users) {
    await pool.execute(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role=VALUES(role), password=VALUES(password)`,
      [user.email, user.password, user.type]
    );
    console.log(`Inserted/updated user: ${user.email} as ${user.type}`);
  }
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
