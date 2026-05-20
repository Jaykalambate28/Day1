import { query } from '~/server/utils/db';

// GET all students
export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event);
    const search = queryParams.search ? String(queryParams.search).trim() : '';
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 50;
    const offset = (page - 1) * limit;

    let baseSql = 'FROM student';
    const params = [];

    if (search) {
      baseSql += ' WHERE id LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR course LIKE ?';
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) as total ${baseSql}`, params);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const dataParams = [...params];
    dataParams.push(limit, offset);
    const rows = await query(`SELECT * ${baseSql} ORDER BY id DESC LIMIT ? OFFSET ?`, dataParams);

    return {
      data: rows || [],
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching students:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch students: ${error.message}`
    });
  }
});
