require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createTables() {
  const client = new Client({
    host:     process.env.PG_HOST,
    port:     process.env.PG_PORT,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS estados (
        id SERIAL PRIMARY KEY,
        nombre TEXT UNIQUE NOT NULL  -- ej. 'pendiente', 'aprobada', 'rechazada', etc.
      );
    `);
    await client.query(`
      INSERT INTO estados (nombre)  
      VALUES ('pendiente'), ('aprobada'), ('rechazada')
      ON CONFLICT (nombre) DO NOTHING;
    `);
    await client.query('BEGIN');
    // 7. Roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre TEXT UNIQUE NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO roles (nombre)
      VALUES ('usuario'), ('profesional'), ('admin')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 1. Usuarios 
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        cedula TEXT UNIQUE NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        telefono TEXT,
        pais TEXT,
        ciudad TEXT,
        email TEXT UNIQUE NOT NULL,
        discapacidad BOOLEAN NOT NULL DEFAULT FALSE,
        password TEXT NOT NULL,

        rol_id INTEGER NOT NULL REFERENCES roles(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `);

    // 2. Admins
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,

        rol_id INTEGER NOT NULL REFERENCES roles(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `);

    // 3. Servicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT
      );
    `);

    // 4. Profesionales
    await client.query(`
      CREATE TABLE IF NOT EXISTS profesionales (
        usuario_id   INTEGER PRIMARY KEY
          REFERENCES usuarios(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        descripcion  TEXT,
        servicio_id  INTEGER NOT NULL
          REFERENCES servicios(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `);

   // 5. Reuniones
  await client.query(`
  CREATE TABLE IF NOT EXISTS reuniones (
    id SERIAL PRIMARY KEY,
    uuid TEXT NOT NULL,
    meeting_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    agenda TEXT,
    start_url TEXT NOT NULL,
    join_url TEXT NOT NULL,
    password TEXT NOT NULL,
    profesional_id INTEGER NOT NULL REFERENCES profesionales(usuario_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL,
    UNIQUE (profesional_id, fecha)
  );
  `);


    // 6. Citas
    await client.query(`
      CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        servicio_id INTEGER NOT NULL REFERENCES servicios(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
        profesional_id INTEGER NOT NULL REFERENCES profesionales(usuario_id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
        reunion_id INTEGER REFERENCES reuniones(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        razon TEXT,
        estado_id INTEGER NOT NULL DEFAULT 1
          REFERENCES estados(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS modalidades (
        id SERIAL PRIMARY KEY,
        nombre TEXT UNIQUE NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO modalidades (nombre)
        VALUES 
          ('presencial'),
          ('virtual'),
          ('híbrida')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS paises (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        tlf_code TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS trabajos (
        id SERIAL PRIMARY KEY,
        empresa TEXT NOT NULL,
        departamento TEXT,
        cargo TEXT NOT NULL,
        horario TEXT,
        color TEXT
    );
    `); 

    await client.query(`
      CREATE TABLE IF NOT EXISTS trabajos_modalidades (
        trabajo_id   INTEGER NOT NULL REFERENCES trabajos(id)
                  ON UPDATE CASCADE ON DELETE CASCADE,
        modalidad_id INTEGER NOT NULL REFERENCES modalidades(id)
                  ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (trabajo_id, modalidad_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS postulacion_empleos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        trabajo_id INTEGER NOT NULL REFERENCES trabajos(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        profesion TEXT NOT NULL,
        area TEXT NOT NULL,
        modalidad_id INTEGER REFERENCES modalidades(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL,
        jornada TEXT NOT NULL DEFAULT 'Tiempo completo'
          CHECK (jornada IN ('Tiempo completo', 'Medio tiempo')),
        email TEXT NOT NULL,
        ciudad TEXT,
        pais_id INTEGER REFERENCES paises(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL,
        discapacidad BOOLEAN DEFAULT FALSE,
        fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado_id INTEGER NOT NULL DEFAULT 1
          REFERENCES estados(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );
    `); 

    const adminUser     = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPassword) {
      const { rows } = await client.query(
        `SELECT id FROM admins WHERE usuario = $1`,
        [adminUser]
      );
      if (rows.length === 0) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await client.query(
          `INSERT INTO admins (usuario, password, rol_id) VALUES ($1, $2, $3)`,
          [adminUser, hash, 3] 
        );
        console.log(`Admin predeterminado '${adminUser}' creado.`);
      } else {
        console.log(`Admin predeterminado '${adminUser}' ya existe.`);
      }
    } else {
      console.warn('No se definieron ADMIN_USER y ADMIN_PASSWORD en .env; no se creó admin.');
    }


    await client.query('COMMIT');
    console.log('Tablas creadas o confirmadas.');
  } catch (err) {
    console.error('Error SQL:', err);
    await client.query('ROLLBACK');
    console.error('Error creando tablas, rollback:', err);
    throw err;
  } finally {
    await client.end();
  }
}

module.exports = { createTables };
