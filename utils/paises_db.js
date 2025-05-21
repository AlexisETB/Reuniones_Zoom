import { readFile } from 'fs/promises';
import { Pool } from 'pg';

const pool = new Pool({
  user:     process.env.PG_USER,
  host:     process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port:     process.env.PG_PORT
});

async function cargarPaises() {
  // 1. Leer y parsear el JSON
  const data = await readFile('./paises.json', 'utf8');
  const paises = JSON.parse(data);

  // 2. Construir un batch insert
  const ids       = [];
  const nombres   = [];
  const tlf_codes = [];
  for (const p of paises) {
    ids.push(p.id);
    nombres.push(p.nombre);
    tlf_codes.push(p.tlf_code);
  }

  const query = `
    INSERT INTO paises (id, nombre, tlf_code)
    SELECT *
    FROM UNNEST($1::int[], $2::text[], $3::text[])
    ON CONFLICT (id) DO NOTHING;
  `;

  await pool.query(query, [ids, nombres, tlf_codes]);
  console.log(`Se importaron ${paises.length} países (o fueron ignorados los duplicados).`);
}

export { cargarPaises };
