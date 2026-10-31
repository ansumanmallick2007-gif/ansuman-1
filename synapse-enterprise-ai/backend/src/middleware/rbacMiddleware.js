// Role-Based Access Control & Department Isolation Middleware

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access. Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

// Ensure user can access department specific resource (Admins have global scope)
export const enforceDepartmentScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  // Admin has global enterprise visibility
  if (req.user.role === 'admin') {
    return next();
  }

  const requestedDepartment = req.query.department || req.body.department;
  // If explicitly querying a department other than own and not admin/manager
  if (requestedDepartment && requestedDepartment !== 'all' && requestedDepartment !== req.user.department) {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Employees are restricted to their home department (${req.user.department}).`
      });
    }
  }

  next();
};

