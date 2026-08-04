// server/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dns = require('dns').promises;
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} = require('../services/emailService');

// ── Helper: Validate email domain has MX records ──
const validateEmailDomain = async (email) => {
    const domain = email.split('@')[1];
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch {
        return false;
    }
};

// ── Helper: Get Device Info ───────────────────
const getDeviceInfo = (req) => {
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for']
        || req.connection.remoteAddress
        || 'unknown';

    let device_type = 'desktop';
    if (/mobile/i.test(ua)) device_type = 'mobile';
    else if (/tablet|ipad/i.test(ua)) device_type = 'tablet';

    let browser = 'unknown';
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    else if (/opera/i.test(ua)) browser = 'Opera';

    let os = 'unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad/i.test(ua)) os = 'iOS';
    else if (/mac/i.test(ua)) os = 'MacOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { ip, device_type, browser, os };
};

// ── Helper: Generate JWT ──────────────────────
const generateToken = (userId, loginId = null) => {
    return jwt.sign(
        { id: userId, login_id: loginId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// ==============================================
// POST /api/auth/register
// ==============================================
router.post('/register', [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .isLength({ min: 10, max: 15 }).withMessage('Invalid phone number'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
    try {
        // 1. Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(e => ({
                    field: e.path,
                    message: e.msg
                }))
            });
        }

        const { name, email, phone, password } = req.body;

        // 2a. Validate email domain has real MX records
        const domainValid = await validateEmailDomain(email);
        if (!domainValid) {
            return res.status(400).json({
                success: false,
                error: `The email address "${email}" does not appear to be valid. Please enter a real email address.`
            });
        }

        // 2b. Check email or phone already exists
        const existing = await pool.query(            `SELECT id FROM users
             WHERE email = $1 OR phone = $2`,
            [email, phone]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email or phone number already registered'
            });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate email verification token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 5. Insert user
        const result = await pool.query(
            `INSERT INTO users
             (name, email, phone, password,
              email_verify_token, email_verify_expires)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, phone, profile_completed`,
            [name, email, phone, hashedPassword,
                verifyToken, verifyExpires]
        );

        const user = result.rows[0];

        // 6. Create default notification preferences
        await pool.query(
            `INSERT INTO notification_preferences (user_id)
             VALUES ($1)`,
            [user.id]
        );

        // 7. Send verification email — block if it fails
        try {
            await sendVerificationEmail(email, name, verifyToken);
        } catch (emailErr) {
            console.error('[EMAIL] Verification send failed:', emailErr.message);

            // Roll back the user insert so they can retry with correct email
            await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

            return res.status(400).json({
                success: false,
                error: 'Could not send verification email. Please check your email address and try again.',
                detail: emailErr.message
            });
        }

        // 8. Generate JWT
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile_completed: user.profile_completed,
                is_email_verified: false,
            }
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/auth/login
// ==============================================
router.post('/login', [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
    try {
        // 1. Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(e => ({
                    field: e.path,
                    message: e.msg
                }))
            });
        }

        const { email, password } = req.body;
        const deviceInfo = getDeviceInfo(req);

        // 2. Find user by email
        const result = await pool.query(
            `SELECT id, name, email, phone, password,
                    profile_completed, is_email_verified,
                    preferred_language
             FROM users WHERE email = $1`,
            [email]
        );

        // 3. User not found — log failed attempt
        if (result.rows.length === 0) {
            await pool.query(
                `INSERT INTO login_history
                 (user_id, ip_address, device_type, browser,
                  operating_system, login_status, failure_reason)
                 VALUES (NULL, $1, $2, $3, $4, 'failed', 'email_not_found')`,
                [deviceInfo.ip, deviceInfo.device_type,
                deviceInfo.browser, deviceInfo.os]
            );
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // 4. Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        // 5. Wrong password — log failed attempt
        if (!isMatch) {
            await pool.query(
                `INSERT INTO login_history
                 (user_id, ip_address, device_type, browser,
                  operating_system, login_status, failure_reason)
                 VALUES ($1, $2, $3, $4, $5, 'failed', 'wrong_password')`,
                [user.id, deviceInfo.ip, deviceInfo.device_type,
                deviceInfo.browser, deviceInfo.os]
            );
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // 6. Success — log successful login
        const loginRecord = await pool.query(
            `INSERT INTO login_history
             (user_id, ip_address, device_type, browser,
              operating_system, login_status)
             VALUES ($1, $2, $3, $4, $5, 'success')
             RETURNING id`,
            [user.id, deviceInfo.ip, deviceInfo.device_type,
            deviceInfo.browser, deviceInfo.os]
        );

        // 7. Generate JWT with login_id for logout tracking
        const token = generateToken(user.id, loginRecord.rows[0].id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile_completed: user.profile_completed,
                is_email_verified: user.is_email_verified,
                preferred_language: user.preferred_language,
            }
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// GET /api/auth/me
// ==============================================
router.get('/me', auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.phone,
                u.preferred_language,
                u.profile_completed,
                u.is_email_verified,
                u.created_at,
                f.id           AS farm_id,
                f.farm_name,
                f.state,
                f.district,
                f.taluka,
                f.village,
                f.pincode,
                f.farm_area,
                f.area_unit,
                f.soil_type,
                f.irrigation_type,
                f.current_crop,
                f.current_season,
                f.last_ai_run
             FROM users u
             LEFT JOIN farms f ON f.user_id = u.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        const data = result.rows[0];

        res.json({
            success: true,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                preferred_language: data.preferred_language,
                profile_completed: data.profile_completed,
                is_email_verified: data.is_email_verified,
                member_since: data.created_at,
            },
            farm: data.farm_id ? {
                id: data.farm_id,
                farm_name: data.farm_name,
                state: data.state,
                district: data.district,
                taluka: data.taluka,
                village: data.village,
                pincode: data.pincode,
                farm_area: data.farm_area,
                area_unit: data.area_unit,
                soil_type: data.soil_type,
                irrigation_type: data.irrigation_type,
                current_crop: data.current_crop,
                current_season: data.current_season,
                last_ai_run: data.last_ai_run,
            } : null
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// GET /api/auth/verify-email?token=xxx
// ==============================================
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }

        // Find user with this token
        const result = await pool.query(
            `SELECT id, email_verify_expires
             FROM users
             WHERE email_verify_token = $1
               AND is_email_verified = FALSE`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or already used verification link'
            });
        }

        const user = result.rows[0];

        // Check token not expired
        if (new Date() > new Date(user.email_verify_expires)) {
            return res.status(400).json({
                success: false,
                error: 'Verification link expired. Please request a new one.'
            });
        }

        // Mark email as verified
        await pool.query(
            `UPDATE users
            SET is_email_verified = TRUE,
            email_verify_token = NULL,
            email_verify_expires = NULL
            WHERE id = $1`,
            [user.id]
        );

        // Send welcome email (non-blocking)
        pool.query('SELECT name, email FROM users WHERE id = $1', [user.id])
            .then(r => sendWelcomeEmail(r.rows[0].email, r.rows[0].name))
            .catch(e => console.error('[EMAIL] Welcome email failed:', e.message));

        // Redirect to frontend login page with success message
        res.redirect('http://localhost:5173/login?verified=true');

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/auth/resend-verification
// ==============================================
router.post('/resend-verification', auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT name, email, is_email_verified
            FROM users WHERE id = $1`,
            [req.user.id]
        );

        const user = result.rows[0];

        // Already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }

        // Generate new token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(
            `UPDATE users
            SET email_verify_token = $1,
            email_verify_expires = $2
            WHERE id = $3`,
            [verifyToken, verifyExpires, req.user.id]
        );

        try {
            await sendVerificationEmail(user.email, user.name, verifyToken);
            res.json({
                success: true,
                message: 'Verification email sent successfully'
            });
        } catch (emailErr) {
            console.error('[WARNING] Email send failed:', emailErr.message);
            res.json({
                success: true,
                message: 'Token refreshed but email delivery failed. Check EMAIL_HOST config.',
                warning: emailErr.message
            });
        }

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/auth/logout
// ==============================================
router.post('/logout', auth, async (req, res, next) => {
    try {
        // Update logged_out_at in login_history
        if (req.login_id) {
            await pool.query(
                `UPDATE login_history
                SET logged_out_at = NOW()
                WHERE id = $1`,
                [req.login_id]
            );
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// GET /api/auth/login-history
// ==============================================
router.get('/login-history', auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                ip_address,
                device_type,
                browser,
                operating_system,
                login_status,
                failure_reason,
                logged_in_at,
                logged_out_at
            FROM login_history
            WHERE user_id = $1
            ORDER BY logged_in_at DESC
            LIMIT 10`,
            [req.user.id]
        );

        res.json({
            success: true,
            login_history: result.rows
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/auth/forgot-password
// ==============================================
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email } = req.body;

        const result = await pool.query(
            'SELECT id, name FROM users WHERE email = $1',
            [email]
        );

        // Always respond success — don't reveal if email exists
        if (result.rows.length === 0) {
            return res.json({
                success: true,
                message: 'If that email exists, a reset link has been sent.'
            });
        }

        const user = result.rows[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await pool.query(
            `UPDATE users
             SET password_reset_token = $1,
                 password_reset_expires = $2
             WHERE id = $3`,
            [resetToken, resetExpires, user.id]
        );

        try {
            await sendPasswordResetEmail(email, user.name, resetToken);
        } catch (emailErr) {
            console.error('[EMAIL] Password reset email failed:', emailErr.message);
        }

        res.json({
            success: true,
            message: 'If that email exists, a reset link has been sent.'
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/auth/reset-password
// ==============================================
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { token, password } = req.body;

        const result = await pool.query(
            `SELECT id FROM users
             WHERE password_reset_token = $1
               AND password_reset_expires > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token.'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            `UPDATE users
             SET password = $1,
                 password_reset_token = NULL,
                 password_reset_expires = NULL
             WHERE id = $2`,
            [hashedPassword, result.rows[0].id]
        );

        res.json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;