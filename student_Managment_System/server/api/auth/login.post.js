import { query } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      });
    }

    const { email, password } = body;
    
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    const users = await query(sql, [email, password]);

    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      });
    }

    const user = users[0];

    // Set cookies for authentication state
    setCookie(event, 'user_email', user.email, { httpOnly: false, path: '/' });
    setCookie(event, 'user_role', user.role, { httpOnly: false, path: '/' });

    return {
      success: true,
      user: {
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    });
  }
});
