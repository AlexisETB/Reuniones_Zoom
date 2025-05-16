const pool = require('../models/db');

exports.obtenerReunionPorProfesional = async (req, res) => {

  const profesionalId = req.user.userId;
  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  try {
    const { rows } = await pool.query(
      `SELECT r.*, json_agg(
          jsonb_build_object(
            'citaId', c.id,
            'usuarioId', c.usuario_id,
            'hora', c.hora,
            'razon', c.razon
          )
        ) AS citas
       FROM reuniones r
       LEFT JOIN citas c ON c.reunion_id = r.id
       WHERE r.profesional_id = $1
         AND DATE(r.start_time) = $2
       GROUP BY r.id`,
      [profesionalId, fecha]
    );
    if (!rows.length) return res.status(404).json({ message: 'No hay reunión para hoy' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reunión' });
  }
};
