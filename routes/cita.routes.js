const express = require('express');
const router = express.Router();
const citaController = require('../controllers/cita.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');
const isProfesional = require('../middlewares/isProfesional');

// — Usuario (rol “usuario”)
router.get(
  '/usuario/profesional/:profesionalId',
  verifyToken,
  citaController.obtenerCitasPorProfesional
);
router.get(
  '/usuario/fecha/:fecha',
  verifyToken,
  citaController.obtenerCitasPorFecha
);

// — Profesional (rol “profesional”)
router.get(
  '/profesional/usuario/:usuarioId',
  verifyToken, isProfesional,
  citaController.obtenerCitasProfesionalPorUsuario
);
router.get(
  '/profesional/fecha/:fecha',
  verifyToken, isProfesional,
  citaController.obtenerCitasProfesionalPorFecha
);

// Rutas protegidas para admin
router.get('/pendientes', verifyToken, isAdmin, citaController.obtenerCitasPendientes);
router.put('/:id/aprobar', verifyToken, isAdmin, citaController.aprobarCita);
router.put('/:id/rechazar', verifyToken, isAdmin, citaController.rechazarCita);

router.post('/', verifyToken, citaController.crearCita);
router.get('/mis-citas', verifyToken, citaController.obtenerCitasUsuario);

router.get('/reunion-profesional', verifyToken, citaController.obtenerReunionDelDia);

module.exports = router;
// Este archivo define las rutas relacionadas con las citas.
// Se utiliza el middleware verifyToken para proteger las rutas, asegurando que solo los usuarios autenticados puedan acceder a ellas.