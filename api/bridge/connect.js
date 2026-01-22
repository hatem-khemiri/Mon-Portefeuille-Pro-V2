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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // DEBUG: Afficher les credentials (masqués partiellement)
    console.log("🔍 DEBUG Credentials:");
    console.log("  Client-Id:", process.env.BRIDGE_CLIENT_ID?.substring(0, 20) + "...");
    console.log("  Client-Secret:", process.env.BRIDGE_CLIENT_SECRET?.substring(0, 20) + "...");
    console.log("  Bridge-Version:", BRIDGE_VERSION);

    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    console.log("🔑 Tentative obtention token pour userId:", userId);

    let accessToken;
    
    try {
      const tokenResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      
      accessToken = tokenResponse.data.access_token;
      console.log("✅ Token obtenu");
      
    } catch (tokenError) {
      console.error("❌ Erreur token:", tokenError.response?.data);
      
      if (tokenError.response?.status === 404) {
        console.log("👤 Création utilisateur...");
        
        await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          { external_user_id: userId },
          { headers: getHeaders() }
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryTokenResponse = await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
          { external_user_id: userId },
          { headers: getHeaders() }
        );
        
        accessToken = retryTokenResponse.data.access_token;
        console.log("✅ Token obtenu après création");
      } else {
        throw tokenError;
      }
    }

    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      {
        user_email: `user-${userId}@monportfeuille.app`
      },
      { headers: getHeaders(accessToken) }
    );

    console.log("✅ Connect session créée");

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
