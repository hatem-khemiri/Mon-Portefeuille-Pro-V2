import axios from 'axios';

const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';
const BRIDGE_API_URL = 'https://api.bridgeapi.io';

function getHeaders(accessToken = null) {
  const headers = {
    'Bridge-Version': BRIDGE_VERSION,
    'Client-Id': process.env.BRIDGE_CLIENT_ID,
    'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

export default async function handler(req, res) {
  console.log("📥 REQ BODY:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    let bridgeUserId;
    
    // Étape 1: Créer ou récupérer l'utilisateur
    console.log("👤 Gestion utilisateur:", userId);
    try {
      const createResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      bridgeUserId = createResponse.data.uuid;
      console.log("✅ Utilisateur créé:", bridgeUserId);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 'users.creation.already_exists_with_external_user_id') {
        console.log("ℹ️ Utilisateur existe déjà");
        const listResponse = await axios.get(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          { headers: getHeaders() }
        );
        const user = listResponse.data.resources.find(u => u.external_user_id === userId);
        bridgeUserId = user?.uuid;
        console.log("✅ UUID récupéré:", bridgeUserId);
      } else {
        throw error;
      }
    }

    // Étape 2: Obtenir un access token pour cet utilisateur
    console.log("🔑 Obtention access token...");
    const tokenResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/users/${bridgeUserId}/authorization/token`,
      {},
      { headers: getHeaders() }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log("✅ Token obtenu");

    // Étape 3: Créer une connect-session avec le token
    console.log("🔗 Création connect-session...");
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      {
        redirect_url: `https://mon-portefeuille-pro-v2.vercel.app/?bridge_status=success`
      },
      { headers: getHeaders(accessToken) }
    );

    console.log("✅ URL générée:", connectResponse.data.url);

    return res.status(200).json({
      connectUrl: connectResponse.data.url,
      userId
    });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Erreur lors de la connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}
