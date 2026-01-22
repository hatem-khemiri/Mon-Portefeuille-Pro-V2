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

    // Créer ou récupérer l'utilisateur
    try {
      const createResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      userUuid = createResponse.data.uuid;
      console.log("✅ Utilisateur créé, UUID:", userUuid);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 'users.creation.already_exists_with_external_user_id') {
        console.log("ℹ️ Utilisateur existe, récupération UUID...");
        
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

    if (!userUuid) {
      throw new Error("Impossible de récupérer l'UUID utilisateur");
    }

    console.log("🔗 Création connect-session pour UUID:", userUuid);

    // Créer une session de connexion avec l'UUID utilisateur
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/connect/users/${userUuid}/items/add`,
      {
        prefill_email: `user-${userId}@monportfeuille.app`
      },
      { headers: getHeaders() }
    );

    console.log("✅ Session créée");

    return res.status(200).json({
      connectUrl: connectResponse.data.redirect_url,
      userId
    });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    console.error('❌ Full error:', JSON.stringify(error.response?.data, null, 2));
    
    return res.status(500).json({
      error: 'Erreur connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}
