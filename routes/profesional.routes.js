const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesional.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');

// Obtener todos los profesionales
router.get('/', profesionalController.obtenerProfesionales);

//admin puede crear profesionales
router.post('/', verifyToken, isAdmin, profesionalController.crearProfesional);
// Eliminar un profesional por ID
router.delete('/delete/:id', verifyToken, isAdmin, profesionalController.deleteProfesional);

module.exports = router;
