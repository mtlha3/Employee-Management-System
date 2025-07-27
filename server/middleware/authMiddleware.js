import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message); 
    return res.status(403).json({ error: "Invalid token" });
  }
};
