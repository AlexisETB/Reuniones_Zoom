const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/perfil', verifyToken, userController.obtenerPerfil);
router.put('/perfil', verifyToken, userController.editarPerfil);

module.exports = router;
