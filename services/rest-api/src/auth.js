// import fetch from 'node-fetch';

const validateGithubToken = async (token) => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid or expired token');
  }

  const userData = await response.json();
  return userData;
};

// Middleware to check the access token
const checkAuth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate the token by making a request to GitHub's API
    const user = await validateGithubToken(token);
    req.user = user;  // Attach user data to the request object
    next();  // Allow the request to proceed
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


// exampel på anvädning
import express from 'express';
const router = express.Router();

// Example protected route
router.get('/profile', checkAuth, async (req, res) => {
  // The user is authenticated, and their data is in `req.user`
  res.json(req.user);
});

export default router;

// sätt att hantera invalid/expired token på frontend
const response = await fetch('/protected-api-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    // Token is invalid or expired, redirect to login
    window.location.href = '/login';
  }