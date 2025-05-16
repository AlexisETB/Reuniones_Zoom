const express = require('express');
const router = express.Router();
const reunionController = require('../controllers/reunion.controller');
const verifyToken = require('../middlewares/verifyToken');
const isProfesional = require('../middlewares/isProfesional');

router.get(
  '/profesional',
  verifyToken,
  isProfesional,
  reunionController.obtenerReunionPorProfesional
);

module.exports = router;
