import { readFile } from 'fs/promises';
import { Pool } from 'pg';

const pool = new Pool({
  user:     process.env.PG_USER,
  host:     process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port:     process.env.PG_PORT
});

async function cargarPracticas() {
    try {
  const data = await readFile('./preprofesionales.json', 'utf8');
  const practicas = JSON.parse(data);

  for (const p of practicas) {
      // Obtener modalidad_id
      const modalidadRes = await pool.query(
        `SELECT id FROM modalidades WHERE LOWER(nombre) = LOWER($1) LIMIT 1;`,
        [p.Modalidad?.nombre || '']
      );
      if (modalidadRes.rows.length === 0) {
        console.warn(`Modalidad no encontrada: ${p.Modalidad?.nombre}`);
        continue;
      }
      const modalidadId = modalidadRes.rows[0].id;

    // Obtener tipo_practica_id
      const tipoPracticaRes = await pool.query(
        `SELECT id FROM tipos_practica WHERE LOWER(nombre) = LOWER($1) LIMIT 1;`,
        [p.tipo_practica]
      );
      if (tipoPracticaRes.rows.length === 0) {
        console.warn(`Tipo de práctica no encontrado: ${p.tipo_practica}`);
        continue;
      }
      const tipoPracticaId = tipoPracticaRes.rows[0].id;

      // Obtener horario_id
      const horarioRes = await pool.query(
        `SELECT id FROM horarios WHERE LOWER(nombre) = LOWER($1) LIMIT 1;`,
        [p.horario]
      );
      if (horarioRes.rows.length === 0) {
        console.warn(`Horario no encontrado: ${p.horario}`);
        continue;
      }
      const horarioId = horarioRes.rows[0].id;

      // Insertar práctica
      await pool.query(
        `INSERT INTO practicas (
          empresa, carrera, tipo_practica_id, fecha_inicio, fecha_fin,
          total_horas, horario_id, modalidad_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING;`,
        [
          p.empresa,
          p.carrera,
          tipoPracticaId,
          p.fecha_inicio,
          p.fecha_fin,
          p.total_horas,
          horarioId,
          modalidadId
        ]
      );
    }

    console.log(`Se importaron ${practicas.length} prácticas (o fueron ignoradas si ya existían).`);
  } catch (err) {
    console.error('Error al cargar prácticas:', err.message);
  } finally {
    await pool.end();
  }
}

export { cargarPracticas };