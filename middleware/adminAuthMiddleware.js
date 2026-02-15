import authMiddleware from './authMiddleware.js';

// Admin middleware assumes authMiddleware has run first and set req.user
const adminAuthMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

export default adminAuthMiddleware;
