// migrate_created_at.js
import { getPool } from '../server/utils/db.js';

async function migrate() {
  const pool = getPool();
  try {
    const sql = `ALTER TABLE student ADD COLUMN created_at DATE DEFAULT NULL;`;
    await pool.execute(sql);
    console.log('Successfully added created_at column');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column created_at already exists, skipping.');
    } else {
      throw err;
    }
  }
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
