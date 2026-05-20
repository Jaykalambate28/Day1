import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Adding student:', body);

    if (!body.name || !body.email || !body.admission_date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, admission_date'
      });
    }

    const sql = `
      INSERT INTO student 
      (name, email, phone, course, admission_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      body.name,
      body.email,
      body.phone || '',
      body.course || '',
      body.admission_date
    ];

    const result = await query(sql, params);
    console.log('Student added successfully with ID:', result.insertId);

    return {
      id: result.insertId,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      course: body.course || '',
      admission_date: body.admission_date
    };
  } catch (error) {
    console.error('Error creating student:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create student: ${error.message}`
    });
  }
});
