// This file is deprecated - use [id].put.js instead
import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const body = await readBody(event);

    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email'
      });
    }

    const sql = `
      UPDATE student 
      SET name = ?, email = ?, phone = ?, course = ?
      WHERE id = ?
    `;

    const params = [
      body.name,
      body.email,
      body.phone || '',
      body.course || '',
      id
    ];

    await query(sql, params);

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update student: ${error.message}`
    });
  }
});
