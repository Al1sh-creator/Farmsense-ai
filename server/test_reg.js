const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./config/db');

async function testReg() {
  try {
    const name = 'Test User';
    const email = 'testuser_' + Date.now() + '@example.com';
    const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);
    const password = 'password123';

    console.log('Testing email/phone check...');
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (existing.rows.length > 0) {
      console.log('User exists');
      return;
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log('Inserting user...');
    const result = await pool.query(
      `INSERT INTO users
       (name, email, phone, password,
        email_verify_token, email_verify_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, profile_completed`,
      [name, email, phone, hashedPassword, verifyToken, verifyExpires]
    );

    const user = result.rows[0];
    console.log('Inserted user:', user);

    console.log('Inserting notification preferences...');
    await pool.query(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)`,
      [user.id]
    );
    console.log('Registration logic success!');
    process.exit(0);
  } catch (err) {
    console.error('Registration Test ERROR:', err);
    process.exit(1);
  }
}

testReg();
