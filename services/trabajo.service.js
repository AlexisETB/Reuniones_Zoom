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
                modalidades: true,
                paises: true,
                estados: true
            }
        });
        return trabajos;
    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        throw new Error('Error al obtener trabajos');
    }
};
