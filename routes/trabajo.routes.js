const express = require('express');
const router = express.Router();
const trabajos = require('../controllers/trabajo.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');

//adm
//Crear trabajo
router.post('/nuevoTrabajo', verifyToken, isAdmin, trabajos.crearTrabajo);
//Eliminar trabajo
router.delete('/:id', verifyToken, isAdmin, trabajos.eliminarTrabajo);
//Obtener trabajos
router.get('/allTrabajos', verifyToken, isAdmin, trabajos.obtenerTrabajos);