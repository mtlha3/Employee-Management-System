import pool from '../db/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//============ Generate Unique Employee ID ============

const generateUniqueEmployeeId = async () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let unique = false;
  let newId = '';

  while (!unique) {
    const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) +
                          letters.charAt(Math.floor(Math.random() * 26));
    const randomDigits = Math.floor(1000 + Math.random() * 9000); 
    newId = randomLetters + randomDigits;

    const check = await pool.query('SELECT employee_id FROM employees WHERE employee_id = $1', [newId]);
    if (check.rows.length === 0) {
      unique = true;
    }
  }

  return newId;
};

//==================== Signup ====================

export const signupEmployee = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee_id = await generateUniqueEmployeeId();

    const query = `
      INSERT INTO employees (employee_id, name, email, password, role, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(query, [employee_id, name, email, hashedPassword, role, status || 'active']);
    res.status(201).json({ message: 'Employee registered successfully!', employee: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists.' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

//==================== Login ====================

const insertLoginHistory = async (employee_id, ip_address, user_agent) => {
  const query = `
    INSERT INTO login_history (employee_id, ip_address, user_agent)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [employee_id, ip_address, user_agent]);
};

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;
    await insertLoginHistory(user.employee_id, ip_address, user_agent);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      employee: {
        name: user.name,
        role: user.role,
        employee_id: user.employee_id,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//==================== Logout ====================

export const logoutEmployee = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: true,
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

//==================== Current Employee ====================

export const getCurrentEmployee = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
