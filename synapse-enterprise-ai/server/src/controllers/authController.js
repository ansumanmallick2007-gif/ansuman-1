import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_2026';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, department, role = 'employee' } = req.body;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Bcrypt hashing with 12 salt rounds as specified
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department, created_at`,
      [name, email, passwordHash, role, department]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    await logAuditEvent(newUser.id, 'USER_REGISTER', {
      email: newUser.email,
      role: newUser.role,
      department: newUser.department
    });

    return res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[Auth Controller Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed due to an internal server error.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name, email, password_hash, role, department, created_at FROM users WHERE email = $1',
      [email]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = generateToken(user);

    await logAuditEvent(user.id, 'USER_LOGIN', {
      email: user.email,
      role: user.role,
      department: user.department
    });

    // Exclude password_hash
    const { password_hash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[Auth Controller Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to an internal server error.'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile.'
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, department FROM users ORDER BY name ASC');
    return res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve enterprise directory.'
    });
  }
};

