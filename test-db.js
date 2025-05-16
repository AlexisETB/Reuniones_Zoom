const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('agenda', 'root', 'yourpassword', {
    host: 'localhost',
    dialect: 'mysql',
});

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa.'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));