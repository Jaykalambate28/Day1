import { query } from '~/server/utils/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    console.log(`Deleting student ${id}`);
    
    // Fetch photo path to clean up the filesystem
    const students = await query('SELECT photo FROM student WHERE id = ?', [id]);
    if (students && students.length > 0 && students[0].photo) {
      const photoPath = students[0].photo;
      if (photoPath.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), 'public', photoPath);
        try {
          await fs.unlink(fullPath);
          console.log('Deleted student photo from disk:', fullPath);
        } catch (err) {
          console.warn('Could not delete student photo file:', err.message);
        }
      }
    }
    
    await query('DELETE FROM student WHERE id = ?', [id]);
    console.log('Student deleted successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete student: ${error.message}`
    });
  }
});

