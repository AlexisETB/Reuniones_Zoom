const { getAccessToken, crearMeeting } = require('../utils/zoom');
const prisma = require('../models/prisma');

exports.crearReunionSiNoExiste = async (profesional, fecha) => {
  const fechaObj = new Date(fecha);

  let reunion = await prisma.reunion.findFirst({
    where: { profesional_id: profesional.usuario_id, fecha: fechaObj }
  });

  if (reunion) return reunion;

  const token = await getAccessToken();

  const nuevaReunionZoom = await crearMeeting(token, {
    topic: `Reuniones de ${profesional.usuarios.nombres}`,
    start_time: fechaObj.toISOString(),
    agenda: `Reunión diaria de ${profesional.usuarios.nombres}`,
    password: 'Auto123'
  });

  reunion = await prisma.reunion.create({
    data: {
      uuid: nuevaReunionZoom.uuid,
      meeting_id: String(nuevaReunionZoom.id),
      start_time: new Date(nuevaReunionZoom.start_time),
      duration: nuevaReunionZoom.duration,
      topic: nuevaReunionZoom.topic,
      agenda: nuevaReunionZoom.agenda,
      start_url: nuevaReunionZoom.start_url,
      join_url: nuevaReunionZoom.join_url,
      password: nuevaReunionZoom.password,
      profesional: { connect: { usuario_id: profesional.usuario_id } },
      fecha: fechaObj
    }
  });

  return reunion;
};
