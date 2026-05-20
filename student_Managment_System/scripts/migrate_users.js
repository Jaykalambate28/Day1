// migrate_users.js
// Run with: node migrate_users.js
// Creates a `users` table for authentication with role (student|staff).
import { getPool } from '../server/utils/db.js';

async function migrate() {
  const pool = getPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'staff') NOT NULL DEFAULT 'student'
    );
  `;
  await pool.execute(sql);
  console.log('Users table created/verified');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
