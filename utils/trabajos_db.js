import { readFile } from 'fs/promises';
import { Pool } from 'pg';

const pool = new Pool({
  user:     process.env.PG_USER,
  host:     process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port:     process.env.PG_PORT
});

async function cargarTrabajos() {
  const data = await readFile('./trabajos.json', 'utf8');
  const trabajos = JSON.parse(data);

  for (const t of trabajos) {
    // 1. Insertar trabajo (sin modalidad)
    await pool.query(
      `INSERT INTO trabajos (id, empresa, departamento, cargo, horario, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING;`,
      [t.id, t.empresa, t.departamento, t.cargo, t.horario, t.color]
    );

    // 2. Relacionar modalidades existentes
    for (const nombreModalidad of t.modalidades) {
      // Buscar el id de la modalidad
      const res = await pool.query(
        `SELECT id FROM modalidades WHERE nombre = $1;`,
        [nombreModalidad]
      );
      if (res.rows.length > 0) {
        const modalidadId = res.rows[0].id;
        // Insertar en tabla intermedia
        await pool.query(
          `INSERT INTO trabajos_modalidades (trabajo_id, modalidad_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [t.id, modalidadId]
        );
      }
    }
  }
  console.log(`Se importaron ${trabajos.length} trabajos y se asociaron sus modalidades.`);
}

export { cargarTrabajos };