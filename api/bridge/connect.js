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

    // Essayer directement avec external_user_id dans le token endpoint
    console.log("🔑 Obtention access token avec external_user_id...");
    
    let accessToken;
    
    try {
      const tokenResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
        {
          external_user_id: userId
        },
        { headers: getHeaders() }
      );
      
      accessToken = tokenResponse.data.access_token;
      console.log("✅ Token obtenu directement");
      
    } catch (tokenError) {
      console.log("❌ Erreur token:", tokenError.response?.data);
      
      // Si l'utilisateur n'existe pas, le créer d'abord
      if (tokenError.response?.status === 404) {
        console.log("👤 Création utilisateur...");
        
        await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          { external_user_id: userId },
          { headers: getHeaders() }
        );
        
        console.log("✅ Utilisateur créé, nouvelle tentative token...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryTokenResponse = await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
          {
            external_user_id: userId
          },
          { headers: getHeaders() }
        );
        
        accessToken = retryTokenResponse.data.access_token;
        console.log("✅ Token obtenu après création");
      } else {
        throw tokenError;
      }
    }

    // Créer une connect-session avec le token
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
    console.error('❌ Erreur finale:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Erreur lors de la connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}
