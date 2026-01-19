const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5001;

// env
const ACCESS_TOKEN_SECRET = 'Sajid@123';
const REFRESH_TOKEN_SECRET = 'sajid';

// Store refresh tokens
const refreshTokens = [];

// Middleware
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

// Mock user database
const users = [
  { id: 1, username: 'admin', password: 'password123' },
  { id: 2, username: 'user', password: 'user123' }
];

// Helper function to generate access token (5 minutes)
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '5m' }
  );
}

// Helper function to generate refresh token (7 days)
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /login - Authenticate user and return tokens
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  refreshTokens.push(refreshToken);

  // Return tokens
  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username }
  });
});

// POST /refresh-token - Generate new access token using refresh token
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  // Check if refresh token exists in storage
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  // Verify refresh token
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  });
});

// Middleware to verify access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    req.user = user;
    next();
  });
}

// GET /protected - Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})