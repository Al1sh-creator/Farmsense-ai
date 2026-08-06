const pool = require('./config/db');
(async () => {
  try {
    const res = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'alerts\'');
    console.log('Columns:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
})();
