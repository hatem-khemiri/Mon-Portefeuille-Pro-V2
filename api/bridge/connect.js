import axios from 'axios';

const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';
const BRIDGE_API_URL = 'https://api.bridgeapi.io';

export default async function handler(req, res) {
  console.log("📥 REQ BODY:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      console.error("❌ ENV MANQUANTE");
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    console.log("👤 [v3] Gestion utilisateur:", userId);
    
    let bridgeUserId;
    
    // Créer ou récupérer l'utilisateur
    try {
      const createUserResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        {
          headers: {
            'Bridge-Version': BRIDGE_VERSION,
            'Client-Id': process.env.BRIDGE_CLIENT_ID,
            'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
            'Content-Type': 'application/json'
          }
        }
      );
      
      bridgeUserId = createUserResponse.data.uuid;
      console.log("✅ Utilisateur créé, UUID:", bridgeUserId);
      
    } catch (userError) {
      if (userError.response?.data?.errors?.[0]?.code === 'users.creation.already_exists_with_external_user_id') {
        console.log("ℹ️ Utilisateur existe, récupération...");
        
        const listResponse = await axios.get(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          {
            headers: {
              'Bridge-Version': BRIDGE_VERSION,
              'Client-Id': process.env.BRIDGE_CLIENT_ID,
              'Client-Secret': process.env.BRIDGE_CLIENT_SECRET
            }
          }
        );
        
        const existingUser = listResponse.data.resources.find(
          u => u.external_user_id === userId
        );
        
        if (existingUser) {
          bridgeUserId = existingUser.uuid;
          console.log("✅ UUID récupéré:", bridgeUserId);
        } else {
          throw new Error("Utilisateur introuvable");
        }
      } else {
        throw userError;
      }
    }

    // Créer une session de connexion avec user_uuid dans le body
    console.log("🔗 [v3] Création session...");
    
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/connect-sessions`,
      {
        user_uuid: bridgeUserId,
        redirect_url: `https://mon-portefeuille-pro-v2.vercel.app/?bridge_status=success`
      },
      {
        headers: {
          'Bridge-Version': BRIDGE_VERSION,
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Session créée:", connectResponse.data.url);

    return res.status(200).json({
      connectUrl: connectResponse.data.url,
      userId,
      bridgeUserId
    });

  } catch (error) {
    console.error('❌ Bridge Error:', error.response?.data || error.message);
    
    return res.status(500).json({
      error: 'Erreur lors de la connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}
