const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesional.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');

// Obtener todos los profesionales
router.get('/', profesionalController.obtenerProfesionales);

//admin puede crear profesionales
router.post('/', verifyToken, isAdmin, profesionalController.crearProfesional);

module.exports = router;
