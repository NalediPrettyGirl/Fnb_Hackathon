
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token, ...extra] = header.split(' ');

    if (
      scheme !== 'Bearer' ||
      !token ||
      extra.length > 0
    ) {
      return res.status(401).json({
        message:
          'Authentication required. Send Authorization: Bearer <token>.'
      });
    }

    if (!process.env.JWT_SECRET) {
      req.log.error(
        'JWT_SECRET is not configured'
      );

      return res.status(500).json({
        message: 'Authentication service is unavailable.'
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !payload.sub ||
      !payload.jti ||
      !payload.exp
    ) {
      req.log.warn(
        { event: 'auth.token.invalid_claims' },
        'JWT is missing required claims'
      );

      return res.status(401).json({
        message: 'Invalid or expired token.'
      });
    }

    const revoked = await RevokedToken.exists({
      jti: payload.jti
    });

    if (revoked) {
      req.log.info(
        { event: 'auth.token.revoked' },
        'Rejected revoked authentication token'
      );

      return res.status(401).json({
        message: 'Your session has ended. Please log in again.'
      });
    }

    const user = await User.findById(payload.sub)
      .select('_id name email role xp');

    if (!user) {
      req.log.warn(
        { event: 'auth.user.not_found' },
        'Token references a nonexistent user'
      );

      return res.status(401).json({
        message: 'Account no longer exists.'
      });
    }

    req.user = user;
    req.auth = payload;

    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      req.log.warn(
        { event: 'auth.token.invalid' },
        'Authentication token verification failed'
      );

      return res.status(401).json({
        message: 'Invalid or expired token.'
      });
    }

    req.log.error(
      { err: error },
      'Authentication middleware failed'
    );

    return res.status(500).json({
      message: 'Authentication service is unavailable.'
    });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.log.warn(
        {
          event: 'auth.authorization.denied',
          requiredRoles: roles,
          actualRole: req.user?.role
        },
        'User is not authorized to perform this action'
      );

      return res.status(403).json({
        message:
          `This action requires the ${roles.join(' or ')} role.`
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  allowRoles
};
