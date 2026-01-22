import axios from 'axios';

const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';
const BRIDGE_API_URL = 'https://api.bridgeapi.io';

function getHeaders(bearerToken = null) {
  const headers = {
    'Bridge-Version': BRIDGE_VERSION,
    'Client-Id': process.env.BRIDGE_CLIENT_ID,
    'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
  
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  
  return headers;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Configuration manquante" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    console.log("👤 Gestion utilisateur:", userId);

    let userUuid;

    try {
      const createResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      userUuid = createResponse.data.uuid;
      console.log("✅ UUID créé:", userUuid);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 'users.creation.already_exists_with_external_user_id') {
        const listResponse = await axios.get(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          { headers: getHeaders() }
        );
        
        const existingUser = listResponse.data.resources.find(u => u.external_user_id === userId);
        userUuid = existingUser?.uuid;
        console.log("✅ UUID récupéré:", userUuid);
      } else {
        throw error;
      }
    }

    console.log("🔗 Création connect-session...");

    // Essayer l'endpoint aggregation/connect-sessions avec user_uuid
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      {
        user_uuid: userUuid,
        user_email: `user-${userId}@monportfeuille.app`
      },
      { headers: getHeaders() }
    );

    console.log("✅ Session créée:", connectResponse.data);

    return res.status(200).json({
      connectUrl: connectResponse.data.url,
      userId
    });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    return res.status(500).json({
      error: 'Erreur connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}
