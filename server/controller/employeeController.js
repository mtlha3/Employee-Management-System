const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateUniqueEmployeeId = async () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let unique = false;
  let newId = '';

  while (!unique) {
    const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) +
                          letters.charAt(Math.floor(Math.random() * 26));
    const randomDigits = Math.floor(1000 + Math.random() * 9000); 
    newId = randomLetters + randomDigits;

    const check = await db.query('SELECT employee_id FROM employees WHERE employee_id = $1', [newId]);
    if (check.rows.length === 0) {
      unique = true;
    }
  }

  return newId;
};

const signupEmployee = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee_id = await generateUniqueEmployeeId();

    const query = `
      INSERT INTO employees (employee_id, name, email, password, role, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await db.query(query, [employee_id, name, email, hashedPassword, role, status || 'active']);
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


//--------------------------------------------

// Utility to insert login history

const insertLoginHistory = async (employee_id, ip_address, user_agent) => {
  const query = `
    INSERT INTO login_history (employee_id, ip_address, user_agent)
    VALUES ($1, $2, $3)
  `;
  await db.query(query, [employee_id, ip_address, user_agent]);
};

const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const result = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Log IP and User Agent
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];

    await insertLoginHistory(user.employee_id, ip_address, user_agent);

    // 5. Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // 6. Respond
    res.status(200).json({
      message: 'Login successful',
      employee: {
        name: user.name,
        role: user.role,
        employee_id: user.employee_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports = { signupEmployee, loginEmployee };
