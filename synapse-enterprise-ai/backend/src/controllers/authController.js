import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_2026';

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, department: user.department },
  JWT_SECRET,
  { expiresIn: '24h' }
);

export const register = async (req, res) => {
  try {
    const { name, email, password, department, role = 'employee' } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and department are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    // Check for duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role, department]
    );

    const newUser = result.rows[0];
    if (!newUser) throw new Error('User creation returned no data.');

    const token = generateToken(newUser);
    await logAuditEvent(newUser.id, 'USER_REGISTER', { email: newUser.email, role: newUser.role, department: newUser.department });

    return res.status(201).json({ success: true, message: 'Account created successfully.', token, user: newUser });
  } catch (error) {
    console.error('[Register Error]:', error.message);
    // Handle PG duplicate key constraint
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const result = await query(
      'SELECT id, name, email, password_hash, role, department, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. Check your email and password.' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. Check your email and password.' });
    }

    const token = generateToken(user);
    await logAuditEvent(user.id, 'USER_LOGIN', { email: user.email, role: user.role });

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ success: true, message: 'Authentication successful.', token, user: safeUser });
  } catch (error) {
    console.error('[Login Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, department FROM users ORDER BY name ASC');
    return res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve enterprise directory.' });
  }
};
