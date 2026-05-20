import { query } from '~/server/utils/db';

// GET all students
export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event);
    const search = queryParams.search ? String(queryParams.search).trim() : '';
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 50;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM student';
    const params = [];

    if (search) {

      sql += ' WHERE id LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR course LIKE ?';
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    return rows || [];
  } catch (error) {
    console.error('Error fetching students:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch students: ${error.message}`
    });
  }
});
