require('dotenv').config();
const twilio = require('twilio');
const pool = require('./config/db');

async function test() {
    try {
        console.log('Testing Twilio config...');
        if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
            console.error('Missing Twilio credentials in .env');
            process.exit(1);
        }
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        
        const userRes = await pool.query(`
            SELECT u.phone 
            FROM users u
            JOIN notification_preferences np ON np.user_id = u.id
            WHERE np.sms_alerts = TRUE
            LIMIT 1
        `);
        
        if (userRes.rows.length === 0) {
            console.error('No users found with sms_alerts = TRUE.');
            process.exit(1);
        }
        const phone = userRes.rows[0].phone;
        console.log('Attempting to send SMS to:', phone);
        console.log('Sending from TWILIO_PHONE:', process.env.TWILIO_PHONE);
        
        const message = await client.messages.create({
            body: 'Twilio diagnostic test message from FarmSense.',
            from: process.env.TWILIO_PHONE,
            to: phone
        });
        
        console.log('Success! Message SID:', message.sid);
        process.exit(0);
    } catch (e) {
        console.error('Twilio Error:', e.message);
        process.exit(1);
    }
}
test();
