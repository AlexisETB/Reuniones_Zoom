const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmn');


// Registro de usuario
router.post('/register', auth.register);

// Login
router.post('/login', auth.generalLogin);

// Admin
router.post('/admin/login', auth.adminLogin);
router.put(
  '/admin/password',
  verifyToken,    
  isAdmin,        
  auth.changeAdminPassword
);

module.exports = router;
