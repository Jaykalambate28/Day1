import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    console.log(`Deleting student ${id}`);
    
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
