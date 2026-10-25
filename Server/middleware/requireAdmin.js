module.exports = function requireAdmin(req, res, next) {
  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const userEmail = String(req.user?.email || '').trim().toLowerCase();

  if (!configuredEmail) {
    req.log?.error({ event: 'admin_access_unconfigured' }, 'ADMIN_EMAIL is not configured');
    return res.status(503).json({ success: false, message: 'Admin access is not configured.' });
  }
  if (!userEmail || userEmail !== configuredEmail) {
    req.log?.warn({ userId: req.user?._id ? String(req.user._id) : undefined }, 'Admin access denied');
    return res.status(403).json({ success: false, message: 'Administrator access required.' });
  }
  return next();
};
