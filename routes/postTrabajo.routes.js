const express = require('express');
const router = express.Router();
const postulacion_empleos = require('../controllers/postTrabajo.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');
const isProfesional = require('../middlewares/isProfesional');

//Rutas usuario
router.get('/', verifyToken, postulacion_empleos.crearPostulacionTrabajo);

module.exports = router;