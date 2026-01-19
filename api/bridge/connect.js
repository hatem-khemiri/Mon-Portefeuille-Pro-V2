import axios from 'axios';
import { getAccessToken } from './utils.js';

export default async function handler(req, res) {
  console.log("REQ BODY:", req.body);
  console.log("ENV CHECK:", {
    id: !!process.env.BRIDGE_CLIENT_ID,
    secret: !!process.env.BRIDGE_CLIENT_SECRET,
    version: process.env.BRIDGE_VERSION,
    vercelUrl: process.env.VERCEL_URL
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier que les variables d'environnement sont présentes
    if (
      !process.env.BRIDGE_CLIENT_ID ||
      !process.env.BRIDGE_CLIENT_SECRET ||
      !process.env.BRIDGE_VERSION
    ) {
      console.error("ENV MANQUANTE", {
        id: !!process.env.BRIDGE_CLIENT_ID,
        secret: !!process.env.BRIDGE_CLIENT_SECRET,
        version: process.env.BRIDGE_VERSION
      });

      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    // Obtenir un access token pour cet utilisateur (crée l'utilisateur si nécessaire)
    const accessToken = await getAccessToken(userId);

    // Générer un lien de connexion Bridge avec la nouvelle API v3
    const response = await axios.post(
      'https://api.bridgeapi.io/v3/aggregation/connect-sessions',
      {},
      {
        headers: {
          'Bridge-Version': process.env.BRIDGE_VERSION,
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      connectUrl: response.data.url,
      userId
    });

  } catch (error) {
    console.error(
      'Erreur Bridge Connect:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: 'Erreur lors de la connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}