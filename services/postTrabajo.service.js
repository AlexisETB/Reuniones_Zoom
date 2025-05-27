const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearPostulacionTrabajo = async (usuarioId,trabajoId, profesion, area, modalidadId, jornada) => {
        //Validar que el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: usuarioId
            },
            select: {
                pais: true,
                email: true,
                ciudad: true,
                discapacidad: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        //Validar que el pais existe
        const paisId = await prisma.paises.findFirst({
            where: { nombre: usuario.pais },
            select: { id: true }
        });
        if (!paisId) {
        return res.status(400).json({ error: "País del usuario no encontrado en la base de datos" });
        }

        //Validar que el trabajo existe
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId }
        });
        if (!trabajo) {
            return res.status(404).json({ error: "Trabajo no encontrado" });
        }

        const nuevaPostulacion = await prisma.postulacion_empleos.create({
            data: {
                trabajo_id: trabajoId,
                usuario_id: usuarioId,
                profesion,
                area,
                modalidad_id: modalidadId,
                jornada,
                pais_id: paisId.id,
                email: usuario.email,
                ciudad: usuario.ciudad,
                discapacidad: usuario.discapacidad,
                estado_id: estadoPostulacion,
            }, 
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true,
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }     
                }
            }     
        });
        return nuevaPostulacion;
};

//aprobar postulacion
exports.aprobarPostulacion = async (postulacionId, estadoId) => {
        // Verificar si la postulacion existe
        const postulacion = await prisma.postulacion_empleos.findUnique({
            where: { id: Number(postulacionId) }
        });
        if (!postulacion) {
            return res.status(404).json({ error: "Postulación no encontrada" });
        }
        const postulacionActualizada = await prisma.postulacion_empleos.update({
            where: { id: Number(postulacionId) },
            data: { estado_id: estadoId },
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true,
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            }
        });
        return postulacionActualizada;
};

exports.rechazarPostulacion = async (postulacionId, estadoId) => {

        const postulacion = await prisma.postulacion_empleos.findUnique({
            where: { id: Number(postulacionId) }
        });
        if (!postulacion) {
            return res.status(404).json({ error: "Postulación no encontrada" });
        }

        const postulacionActualizada = await prisma.postulacion_empleos.update({
            where: { id: Number(postulacionId) },
            data: { estado_id: estadoId },
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true,
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            }
        });
        return postulacionActualizada;
};
// Obtener postulaciones pendientes
exports.obtenerPostulacionesPendientes = async () => {
    const postulacionesPendientes = await prisma.postulacion_empleos.findMany({
        where: { estado_id: 1 }, // Estado "Pendiente"
        include: {
            trabajos: true,
            modalidades: true,
            paises: true,
            estados: true,
            usuarios: {
                select: {
                    nombres: true,
                    apellidos: true
                }
            }
        }
    });
    return postulacionesPendientes;
};

//Cancelar postulacion (Usuario)
exports.cancelarPostulacion = async (postulacionId, usuarioId) => {
    const postulacion = await prisma.postulacion_empleos.findUnique({
        where: { id: Number(postulacionId),
            usuario_id: usuarioId
         }
    });
    if (!postulacion) {
        return res.status(404).json({ error: "Postulación no encontrada" });
    }
    const postulacionActualizada = await prisma.postulacion_empleos.update({
        where: { id: Number(postulacionId) },
        data: { estado_id: 3 }, 
        include: {
            trabajos: true,
            modalidades: true,
            paises: true,
            estados: true,
            usuarios: {
                select: {
                    nombres: true,
                    apellidos: true
                }
            }
        }
    });
    return postulacionActualizada;
};