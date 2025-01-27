export const validateGithubToken = async (token) => {
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

export const checkAuth = async (req, res, next, runTest=false) => {
  // skip auth check when testing, unless specifically told to test
  if (process.env.NODE_ENV === 'test' && !runTest) {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await validateGithubToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
