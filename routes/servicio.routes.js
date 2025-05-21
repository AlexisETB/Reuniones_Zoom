const express = require('express');
const router = express.Router();
const verifyToken       = require('../middlewares/verifyToken');
const isAdmin           = require('../middlewares/isAdmn');
const servicioController = require('../controllers/servicio.controller');
//públicas
router.get('/', servicioController.obtenerServicios);

//admin 
router.post('/', verifyToken, require('../middlewares/isAdmn'), servicioController.crearServicio);
// Eliminar un servicio por ID
router.delete('/delete/:id', verifyToken, isAdmin, servicioController.deleteServicio);

module.exports = router;
