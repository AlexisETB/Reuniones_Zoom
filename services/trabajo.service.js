const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearTrabajo = async (empresa, departamento, cargo, horario, color) => {
  
        // Verificar si el trabajo ya existe
        const existeTrabajo = await prisma.trabajos.findFirst({
            where: {
                empresa,
                departamento,
                cargo,
                horario,
                color
            }
        });
        if (existeTrabajo) {
            return res.status(409).json({ error: 'El trabajo ya existe' });
        }
        await prisma.$executeRawUnsafe(`
            SELECT setval(
                pg_get_serial_sequence('trabajos', 'id'),
                GREATEST((SELECT MAX(id) FROM trabajos), 0)
            );
        `);
        const nuevoTrabajo = await prisma.trabajos.create({
            data: {
                empresa,
                departamento,
                cargo,
                horario,
                color
            }
        });
    return nuevoTrabajo;
};

exports.deleteTrabajo = async (trabajoId) => {
        // Verificar si el trabajo existe
        const trabajoExistente = await prisma.trabajos.findUnique({
            where: { id: trabajoId }
        });
        if (!trabajoExistente) {
            throw new Error('Trabajo no encontrado');
        }
        const trabajo = await prisma.trabajos.delete({
            where: { id: trabajoId }
        });
        return trabajo;
}

exports.obtenerTrabajos = async () => {
    try {
        const trabajos = await prisma.trabajos.findMany({
            include: {
                trabajos_modalidades: true,
            }
        });
        return trabajos;
    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        throw new Error('Error al obtener trabajos');
    }
};
