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

    const headers = {
      'Bridge-Version': BRIDGE_VERSION,
      'Client-Id': process.env.BRIDGE_CLIENT_ID,
      'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
      'Content-Type': 'application/json'
    };

    // 1. Créer utilisateur
    let userUuid;
    try {
      const r = await axios.post(`${BRIDGE_API_URL}/v3/aggregation/users`, { external_user_id: userId }, { headers });
      userUuid = r.data.uuid;
    } catch (e) {
      const list = await axios.get(`${BRIDGE_API_URL}/v3/aggregation/users`, { headers });
      userUuid = list.data.resources.find(u => u.external_user_id === userId)?.uuid;
    }

    // 2. Créer un token temporaire pour cet utilisateur
    const tempTokenResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/users/${userUuid}/pro-connect/token`,
      {},
      { headers }
    );

    const tempToken = tempTokenResponse.data.access_token;

    // 3. Créer la session avec le token
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      { user_email: `user-${userId}@monportfeuille.app` },
      { headers: { ...headers, 'Authorization': `Bearer ${tempToken}` } }
    );

    return res.status(200).json({ connectUrl: connectResponse.data.url, userId });

  } catch (error) {
    console.error('❌', error.response?.data || error.message);
    return res.status(500).json({ error: 'Erreur', details: error.response?.data });
  }
}
