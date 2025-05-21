module.exports = function isAdmin(req, res, next) {
      if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
    }
    next();
  };
  