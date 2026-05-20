import { query } from '~/server/utils/db';

// GET all students
export default defineEventHandler(async (event) => {
  try {
    const rows = await query('SELECT * FROM student ORDER BY id DESC');
    return rows || [];
  } catch (error) {
    console.error('Error fetching students:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch students: ${error.message}`
    });
  }
});
