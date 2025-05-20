module.exports = function isProfesional(req, res, next) {
  const roleId = Number(req.user.role);
  if (!req.user || roleId !== 2) {
    return res.status(403).json({ error: 'Acceso denegado. Solo profesionales.' });
  }
  next();
};