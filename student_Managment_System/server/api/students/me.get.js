import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Since authentication is removed, return a default student profile
    // or the first student in the database for demo purposes
    const sql = `SELECT * FROM student ORDER BY id LIMIT 1`;
    const students = await query(sql, []);

    if (!students || students.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No student profile found',
      });
    }

    return students[0];
  } catch (error) {
    console.error('Error fetching student profile:', error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    });
  }
});
