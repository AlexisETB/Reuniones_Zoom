const pool = require('../models/db');

exports.obtenerPerfil = async (req, res) => {
  const userId = req.user.userId;
  try {
    const { rows } = await pool.query(
      `SELECT id, nombres, apellidos, cedula, fecha_nacimiento AS fechaNacimiento, telefono, pais, ciudad
         FROM usuarios
        WHERE id = $1`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

exports.editarPerfil = async (req, res) => {
  const userId = req.user.userId;
  const { nombres, apellidos, telefono, pais, ciudad } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios
         SET nombres = $1,
             apellidos = $2,
             telefono = $3,
             pais = $4,
             ciudad = $5
       WHERE id = $6
       RETURNING id, nombres, apellidos, cedula, fecha_nacimiento AS fechaNacimiento, telefono, pais, ciudad`,
      [nombres, apellidos, telefono, pais, ciudad, userId]
    );
    res.json({ message: 'Perfil actualizado', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};
