const express = require('express');
const router = express.Router();
const postulacion_empleos = require('../controllers/postTrabajo.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');

//Rutas usuario
router.post('/', verifyToken, postulacion_empleos.crearPostulacionTrabajo);
router.put('/cancelar/:id', verifyToken, postulacion_empleos.cancelarPostulacion);
router.get('/misPostulaciones', verifyToken, postulacion_empleos.obtenerPostulacionesPorUsuario);

// Rutas protegidas para admin
router.put('/aprobar/:id', verifyToken, isAdmin, postulacion_empleos.aprobarPostulacion);
router.put('/rechazar/:id', verifyToken, isAdmin, postulacion_empleos.rechazarPostulacion);
router.get('/pendientes', verifyToken, isAdmin, postulacion_empleos.obtenerPostulacionesPendientes);
router.get('/allPostulaciones', verifyToken, isAdmin, postulacion_empleos.obtenerTodasPostulaciones);
router.get('/postulaciones/:id', verifyToken, isAdmin, postulacion_empleos.obtenerPostulacionesPorTrabajo);

module.exports = router;