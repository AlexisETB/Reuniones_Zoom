const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearTrabajo = async (req, res) => {
    const { empresa, departamento, cargo, horario, color } = req.body;

    try {
        // Verificar si el trabajo ya existe
        const existeTrabajo = await prisma.trabajos.findFirst({
            where: {
                empresa,
                departamento,
                
            }
        });
        if (existeTrabajo) {
            return res.status(409).json({ error: 'El trabajo ya existe' });
        }
        const nuevoTrabajo = await prisma.trabajos.create({
            data: {
                empresa,
                departamento,
                cargo,
                horario,
                color
            }
        });
        res.status(201).json(nuevoTrabajo);
    } catch (error) {
        console.error('Error al crear trabajo:', error);
        res.status(500).json({ error: 'Error al crear trabajo' });
    }
};
