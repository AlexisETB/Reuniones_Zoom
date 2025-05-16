const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

exports.crearProfesional = async (req, res) => {
  const { cedula, nombres, apellidos, email,
    telefono, descripcion, servicio_id } = req.body;
  try {
    // Verificar si el profesional ya existe
    const existe = await prisma.usuario.findFirst({
      where: {
        OR: [
          { cedula },
          { email }
        ]
      }
    });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un usuario con esa cédula o email' });
    }

    const role = await prisma.roles.findUnique({
      where: { nombre: 'profesional' }
    });
    if (!role) {
      return res.status(500).json({ error: 'Role "profesional" no configurado' });
    }

    const rawPass = cedula + new Date().getFullYear();
    const hashed   = await bcrypt.hash(rawPass, 10);

    const profesional = await prisma.usuario.create({
      data: {
        cedula,
        nombres,
        apellidos,
        email,
        telefono,
        fecha_nacimiento: new Date(),       // o un campo por defecto
        pais:              '',
        ciudad:            '',
        discapacidad:      false,
        password:          hashed,
        roles: { connect: { id: role.id } }, // asignamos role profesional
        profesionales: {
          create: {
            descripcion,
            servicio: { connect: { id: Number(servicio_id) } }
          }
        }
      },
      include: {
        profesionales: {
          include: { servicio: true }
        },
        roles: true
      }
    });
    res.status(201).json(profesional);
  } catch (error) {
    rconsole.error('Error creando profesional:', error);
  
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Servicio no existe' });
    }
    return res.status(500).json({ error: 'Error al crear el profesional' });
  }
};

exports.obtenerProfesionales = async (req, res) => {
  try {
    const profesionales = await prisma.usuario.findMany({
      where: {
        roles: {               
          nombre: 'profesional'
        }
      },
      include: {
        roles: true,            
        profesionales: {
          include: {
            servicio: true
          }
        }
      }
    });
    res.json(profesionales);
  } catch (error) {
    console.error('Error en obtenerProfesionales:', error);
    res.status(500).json({ error: 'Error al obtener los profesionales' });
  }
};
