export default defineEventHandler(async (event) => {
  deleteCookie(event, 'user_email', { path: '/' });
  deleteCookie(event, 'user_role', { path: '/' });
  return { success: true };
});
