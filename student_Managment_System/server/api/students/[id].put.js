import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const body = await readBody(event);
    console.log(`Updating student ${id}:`, body);

    if (!body.name || !body.email || !body.admission_date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, admission_date'
      });
    }

    const sql = `
      UPDATE student 
      SET name = ?, email = ?, phone = ?, course = ?, admission_date = ?
      WHERE id = ?
    `;

    const params = [
      body.name,
      body.email,
      body.phone || '',
      body.course || '',
      body.admission_date,
      id
    ];

    const result = await query(sql, params);
    console.log('Student updated successfully');

    return { success: true };
  } catch (error) {
    console.error('Error updating student:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update student: ${error.message}`
    });
  }
});
