require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
    } else {
        console.log('Conexión a la base de datos exitosa.');
        release(); // Release the client back to the pool
    }
});

// Crear tablas si no existen
async function crearTablas() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reuniones (
            uuid TEXT,
            meeting_id BIGINT,
            topic TEXT,
            start_time TIMESTAMP,
            duration INTEGER,
            agenda TEXT,
            start_url TEXT,
            join_url TEXT,
            password TEXT,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('Tablas creadas o ya existen.');
}

// Call the function to create tables
crearTablas().catch(err => console.error('Error al crear tablas:', err.message));

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error al ejecutar consulta de prueba:', err.stack);
    } else {
        console.log('Consulta de prueba exitosa:', res.rows[0]);
    }
});

//Obtener access token desde Zoom
async function getAccessToken() {
    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'account_credentials',
                account_id: process.env.ZOOM_ACCOUNT_ID
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token:', error.response?.data || error.message);
        throw new Error('Error al obtener token');
    }
}

//
// Guardar reunión en la base de datos
//
async function guardarReunion (data){
    console.log(data);
    const query = `
      INSERT INTO reuniones 
        (uuid, meeting_id, topic, start_time, duration, agenda, start_url, join_url, password)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    const values = [
        data.uuid,
        data.id,
        data.topic,
        data.start_time,
        data.duration,
        data.agenda,
        data.start_url,
        data.join_url,
        data.password,
    ];
  
    try {
      const result = await pool.query(query, values);
      console.log("Reunión guardada con ID:", result.rows[0].id);
      return true;
    } catch (err) {
      console.error("Error al guardar reunión:", err.message);
      return false;
    }
  };
  

//
// Crear reunión
//
async function crearReunion(token, { topic, start_time, duration, agenda, password }) {
    try {
            const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic,
            type: 2, // reunión programada
            start_time,
            duration,
            timezone: 'UTC',
            agenda,
            password: password || 'MiClave123',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
                mute_upon_entry: true,
                waiting_room: true
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al crear reunión:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al crear reunión' });
    }
}
    
app.use(express.json());
app.post('/crear-reunion', async (req, res) => {
    const { topic, start_time, duration, agenda, password } = req.body;
    try {
        const token = await getAccessToken();
        if (!token) throw new Error('Token no obtenido');

        const data = await crearReunion(token, { topic, start_time, duration, agenda, password });
        const success = await guardarReunion(data);

        if (!success) return res.status(500).send('Error al guardar en base de datos');

        res.status(200).json(data);
    } catch (err) {
        console.error('Error en /crear-reunion:', err.message);
        res.status(500).json({ error: err.message });
    }
});

//
//Listar reuniones
//
app.get('/reuniones', async (req, res) => {
    try {
        const token = await getAccessToken();

        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener reuniones:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al obtener reuniones' });
    }
});

//reunones por id
app.get('/reuniones/:meeting_id', async (req, res) => {
    try {
        const token = await getAccessToken();

        const response = await axios.get(`https://api.zoom.us/v2/meetings/${req.params.meeting_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener reunión:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al obtener reunión' });
    }
});



//
//Eliminar reunión
//
app.delete('/reunion/:id', async (req, res) => {
    const meetingId = req.params.id;

    try {
        const token = await getAccessToken();

        await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        res.json({ message: `Reunión ${meetingId} eliminada correctamente.` });
    } catch (error) {
        console.error('Error al eliminar reunión:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al eliminar reunión' });
    }
});

//
//Iniciar servidor
//
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
