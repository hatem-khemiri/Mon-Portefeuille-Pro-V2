import axios from 'axios';

const BRIDGE_VERSION = '2025-01-15';
const BRIDGE_API_URL = 'https://api.bridgeapi.io';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId requis' });

    const baseHeaders = {
      'Bridge-Version': BRIDGE_VERSION,
      'Client-Id': process.env.BRIDGE_CLIENT_ID,
      'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
      'Content-Type': 'application/json'
    };

    // 1. Créer ou récupérer l'utilisateur
    let userUuid;
    try {
      const createResp = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        { headers: baseHeaders }
      );
      userUuid = createResp.data.uuid;
    } catch (e) {
      const listResp = await axios.get(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { headers: baseHeaders }
      );
      userUuid = listResp.data.resources.find(u => u.external_user_id === userId)?.uuid;
    }

    // 2. Créer un temporary access token
    const tokenResp = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/users/${userUuid}/temporary-access-token`,
      {},
      { headers: baseHeaders }
    );

    const accessToken = tokenResp.data.access_token;

    // 3. Créer la connect-session
    const connectResp = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      { user_email: `user-${userId}@monportfeuille.app` },
      { 
        headers: {
          ...baseHeaders,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return res.status(200).json({
      connectUrl: connectResp.data.url,
      userId
    });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Erreur connexion',
      details: error.response?.data || error.message
    });
  }
}
