const axios = require('axios');

const ZOOM_TOKEN_URL   = 'https://zoom.us/oauth/token';
const ZOOM_MEETING_URL = 'https://api.zoom.us/v2/users/me/meetings';

// Obtener token de Zoom
async function getAccessToken() {
  const authHeader = Buffer
    .from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`)
    .toString('base64');

  const response = await axios.post(
    ZOOM_TOKEN_URL,
    null,
    {
      params: {
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID
      },
      headers: {
        Authorization: `Basic ${authHeader}`
      }
    }
  );

  return response.data.access_token;
}

/**
 * Crea una reunión de Zoom para el usuario "me" con los datos que le pases.
 * @param {string} token  Access token obtenido de getAccessToken()
 * @param {{ topic: string, start_time: string, duration?: number, agenda?: string, password?: string }} opts
 */
async function crearMeeting(token, opts) {
  const payload = {
    topic:      opts.topic,
    type:       2,                   // programada
    start_time: opts.start_time,
    duration:   opts.duration  || 30,
    timezone:   'UTC',
    agenda:     opts.agenda    || '',
    password:   opts.password  || '',
    settings: {
      host_video:         true,
      participant_video:  true,
      join_before_host:   true,
      mute_upon_entry:    true,
      waiting_room:       true
    }
  };

  const response = await axios.post(
    ZOOM_MEETING_URL,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type':  'application/json'
      }
    }
  );

  return response.data;
}

module.exports = {
  getAccessToken,
  crearMeeting
};
