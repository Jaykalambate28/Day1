import { query } from '~/server/utils/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
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

    console.log(`Updating student ${id}:`, body);

    if (!body.name || !body.email || !body.admission_date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, admission_date'
      });
    }

    // Determine photo path: retain existing unless a new one was uploaded
    let photoPath = body.photo || null;
    
    // If the frontend explicitly set photo to 'null' or empty string (meaning deleted)
    if (photoPath === 'null' || photoPath === '') {
      photoPath = null;
    }

    if (photoFile && photoFile.filename && photoFile.data.length > 0) {
      const ext = path.extname(photoFile.filename) || '.png';
      const filename = `student_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const fullPath = path.join(uploadDir, filename);
      await fs.writeFile(fullPath, photoFile.data);
      photoPath = `/uploads/${filename}`;
      console.log('Saved updated photo to:', photoPath);

      // Clean up old file if it was replaced
      if (body.photo && body.photo.startsWith('/uploads/')) {
        const oldFullPath = path.join(process.cwd(), 'public', body.photo);
        try {
          await fs.unlink(oldFullPath);
          console.log('Deleted old photo from disk:', oldFullPath);
        } catch (err) {
          console.warn('Could not delete old file:', err.message);
        }
      }
    }

    const sql = `
      UPDATE student 
      SET name = ?, email = ?, phone = ?, course = ?, admission_date = ?, created_at = ?, photo = ?
      WHERE id = ?
    `;

    const params = [
      body.name,
      body.email,
      body.phone || '',
      body.course || '',
      body.admission_date,
      body.created_at || new Date().toISOString().split('T')[0],
      photoPath,
      id
    ];

    await query(sql, params);
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

