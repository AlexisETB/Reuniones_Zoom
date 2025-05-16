const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Devuelve array de errores
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};