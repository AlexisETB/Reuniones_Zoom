const express = require('express');
const router = express.Router();
const postulacion_empleos = require('../controllers/postTrabajo.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');
const isProfesional = require('../middlewares/isProfesional');

//Rutas usuario
router.get('/', verifyToken, postulacion_empleos.crearPostulacionTrabajo);

// Rutas protegidas para admin
router.get('/aprobar/:id', verifyToken, isAdmin, postulacion_empleos.aprobarPostulacion);
router.get('/rechazar/:id', verifyToken, isAdmin, postulacion_empleos.rechazarPostulacion);
router.get('/pendientes', verifyToken, isAdmin, postulacion_empleos.obtenerPostulacionesPendientes);

module.exports = router;