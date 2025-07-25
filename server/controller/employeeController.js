import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/employeeInfo.js';
import LoginHistory from '../models/loginHistory.js';

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

    const existing = await Employee.findOne({ employee_id: newId });
    if (!existing) {
      unique = true;
    }
  }

  return newId;
};

//==================== Signup ====================
export const signupEmployee = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  try {
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee_id = await generateUniqueEmployeeId();

    const employee = new Employee({
      employee_id,
      name,
      email,
      password: hashedPassword,
      role,
      status: status || 'active',
    });

    await employee.save();

    res.status(201).json({ message: 'Employee registered successfully!', employee });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//==================== Login ====================
export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

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

    await LoginHistory.create({
      employee_id: user.employee_id,
      ip_address,
      user_agent,
    });

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
    secure: process.env.NODE_ENV === 'production',
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

//==================== Get Employee by Team Lead Role ====================
export const getTeamLeads = async (req, res) => {
  try {
    const leads = await Employee.find({ role: "Team Lead" }, "employee_id name role");
    res.status(200).json({ leads });
  } catch (err) {
    console.error("Error fetching team leads:", err);
    res.status(500).json({ error: "Failed to fetch team leads" });
  }
};


//==================== Get All Employees ====================
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, { employee_id: 1, name: 1, role: 1 });
    res.status(200).json({ employees });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};