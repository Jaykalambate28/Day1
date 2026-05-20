import { query } from '~/server/utils/db';

// DELETE - delete student (id comes from URL)
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    await query('DELETE FROM student WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete student: ${error.message}`
    });
  }
});
