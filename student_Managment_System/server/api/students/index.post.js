import { query } from '~/server/utils/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  try {
    const parts = await readMultipartFormData(event);
    if (!parts) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload: expected multipart/form-data'
      });
    }

    const body = {};
    let photoFile = null;

    for (const part of parts) {
      if (part.name && !part.filename) {
        body[part.name] = part.data.toString('utf-8');
      } else if (part.name === 'photo' && part.filename) {
        photoFile = part;
      }
    }

    console.log('Adding student:', body);

    if (!body.name || !body.email || !body.admission_date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, admission_date'
      });
    }

    let photoPath = null;
    if (photoFile && photoFile.filename && photoFile.data.length > 0) {
      const ext = path.extname(photoFile.filename) || '.png';
      const filename = `student_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const fullPath = path.join(uploadDir, filename);
      await fs.writeFile(fullPath, photoFile.data);
      photoPath = `/uploads/${filename}`;
      console.log('Saved photo to:', photoPath);
    }

    const sql = `
      INSERT INTO student 
      (name, email, phone, course, admission_date, created_at, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      body.name,
      body.email,
      body.phone || '',
      body.course || '',
      body.admission_date,
      body.created_at || new Date().toISOString().split('T')[0],
      photoPath
    ];

    const result = await query(sql, params);
    console.log('Student added successfully with ID:', result.insertId);

    return {
      id: result.insertId,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      course: body.course || '',
      admission_date: body.admission_date,
      created_at: body.created_at || new Date().toISOString().split('T')[0],
      photo: photoPath
    };
  } catch (error) {
    console.error('Error creating student:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create student: ${error.message}`
    });
  }
});

