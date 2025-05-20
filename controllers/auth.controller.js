
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');
require('dotenv').config();

exports.register = async (req, res) => {
    const {
        nombres,
        apellidos,
        cedula,
        fecha_nacimiento,
        telefono,
        pais,
        ciudad,
        email,
        discapacidad,
        rol_id = 1,
    } = req.body;

    try {
        const anioNacimiento = new Date(fecha_nacimiento).getFullYear();
        const rawPassword = cedula+anioNacimiento;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const result = await pool.query(
            `INSERT INTO usuarios
            (nombres, apellidos, cedula, fecha_nacimiento, telefono, pais, ciudad, email, discapacidad, password, rol_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, nombres, apellidos, cedula`,
            [nombres, apellidos, cedula, fecha_nacimiento, telefono, pais, ciudad, email, discapacidad, hashedPassword, rol_id]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente', user: result.rows[0] });
    } catch (error) {
        console.error('Error en registro:', error);
        // Violación de unicidad en Postgres
    if (error.code === '23505') {
      // A veces viene error.constraint; si no, parseamos detail
      const constraint = error.constraint || '';
      const detail     = error.detail || '';

      if (constraint.includes('usuarios_cedula_key') || detail.includes('(cedula)')) {
        return res.status(409).json({ error: 'La cédula ya está registrada' });
      }
      if (constraint.includes('usuarios_email_key')  || detail.includes('(email)')) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }
      // Otro unique constraint
      return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
    }

    // Otros errores
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

      // ————— Login de admin —————
exports.adminLogin = async (req, res) => {
    const { usuario, password } = req.body;
    try {
      const { rows } = await pool.query(
        `SELECT id, usuario, password FROM admins WHERE usuario = $1`,
        [usuario]
      );
      if (!rows.length) return res.status(404).json({ error: 'Admin no encontrado' });
  
      const admin = rows[0];
      const ok = await bcrypt.compare(password, admin.password);
      if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });
  
      // JWT con role 'admin'
      const token = jwt.sign(
        { userId: admin.id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
  
      res.json({ message: 'Login admin exitoso', token, user: { id: admin.id, role: 'admin' } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  };

//login 
exports.generalLogin = async (req, res) => {
  const { cedula, password } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.password,u.rol_id, r.nombre AS role
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
      WHERE u.cedula = $1`,
      [cedula]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  const user = rows[0];
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Contraseña inválida' });
  }
  // Sólo permitir clientes y profesionales, no admins
  user_rol = user.rol_id;
  if (![1,2].includes(user_rol)) {
    return res.status(403).json({ error: 'Acceso no autorizado aquí' });
  }
  if (user_rol === 2) {
      const profCheck = await pool.query(
        `SELECT 1 FROM profesionales WHERE usuario_id = $1`,
        [user.id]
      );
      if (!profCheck.rows.length) {
        return res.status(403).json({ error: 'Perfil de profesional no encontrado' });
      }
    }

    // Generamos token con role 
    const token = jwt.sign(
      { userId: user.id, role: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login ' + user.role + ' exitoso',
      token,
      user: { id: user.id, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión profesional' });
  }
};


  exports.changeAdminPassword = async (req, res) => {
    const adminId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
  
    try {
      const { rows } = await pool.query(
        `SELECT password FROM admins WHERE id = $1`,
        [adminId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Admin no encontrado' });
  
      const currentHash = rows[0].password;
      if (!await bcrypt.compare(oldPassword, currentHash)) {
        return res.status(401).json({ error: 'Contraseña antigua incorrecta' });
      }
  
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await pool.query(
        `UPDATE admins SET password = $1 WHERE id = $2`,
        [hashedNew, adminId]
      );
  
      res.json({ message: 'Contraseña de admin actualizada' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  };
