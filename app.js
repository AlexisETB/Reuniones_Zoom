require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const { createTables } = require('./init'); 
const db = require('./models/db.js'); 
const { cargarPaises } = require('./utils/paises_db.js'); 
const { cargarTrabajos } = require('./utils/trabajos_db.js');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.use('/api/auth',        authRoutes);
app.use('/api/servicios',    require('./routes/servicio.routes'));
app.use('/api/profesionales',require('./routes/profesional.routes'));
app.use('/api/citas',        require('./routes/cita.routes'));
app.use('/api/usuarios', require('./routes/user.routes'));
app.use('/api/reuniones', require('./routes/reunion.routes'));
app.use('/api/postulacion', require('./routes/postTrabajo.routes'));
app.use('/api/trabajo', require('./routes/trabajo.routes'));


// Rutas 
app.get('/', (req, res) => res.send('API funcionando'));


// --- Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });
  
  // --- Error handler centralizado
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
  

// Iniciar servidor
const PORT = process.env.PORT || 3000;
// Crear tablas y luego iniciar el servidor
createTables()
  .then(async () => {
    await cargarPaises();
    await cargarTrabajos();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Fallo al inicializar la base de datos, no se inicia el servidor.');
    process.exit(1);
  });