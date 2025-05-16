module.exports = function isProfesional(req, res, next) {
  if (!req.user || req.user.role !== 'profesional') {
    return res.status(403).json({ error: 'Acceso denegado. Solo profesionales.' });
  }
  next();
};