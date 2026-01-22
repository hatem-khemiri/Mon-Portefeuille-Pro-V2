import axios from 'axios';

const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';
const BRIDGE_API_URL = 'https://api.bridgeapi.io';

function getHeaders() {
  return {
    'Bridge-Version': BRIDGE_VERSION,
    'Client-Id': process.env.BRIDGE_CLIENT_ID,
    'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
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

    // Créer ou vérifier l'utilisateur
    try {
      await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      console.log("✅ Utilisateur créé");
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 'users.creation.already_exists_with_external_user_id') {
        console.log("ℹ️ Utilisateur existe déjà");
      } else {
        throw error;
      }
    }

    console.log("🔗 Création connect-session...");

    // Créer une session de connexion SANS token Bearer
    // Avec v3 2025-01-15, on peut créer une session directement avec Client credentials
    const connectResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/connect/items/add`,
      {
        prefill_email: `user-${userId}@monportfeuille.app`
      },
      { 
        headers: getHeaders(),
        params: {
          external_user_id: userId
        }
      }
    );

    console.log("✅ Session créée");

    return res.status(200).json({
      connectUrl: connectResponse.data.redirect_url,
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
