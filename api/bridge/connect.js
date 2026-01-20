import axios from 'axios';
import { getAccessToken } from './utils.js';

export default async function handler(req, res) {
  console.log("📥 REQ BODY:", req.body);
  console.log("🔧 ENV CHECK:", {
    id: !!process.env.BRIDGE_CLIENT_ID,
    secret: !!process.env.BRIDGE_CLIENT_SECRET,
    version: process.env.BRIDGE_VERSION
  });

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

    console.log("🔑 Getting access token for:", userId);
    const accessToken = await getAccessToken(userId);

    console.log("🔗 Creating connect session...");
    
    const response = await axios.post(
      'https://api.bridgeapi.io/v2/connect/items/add',
      {
        prefill_email: `user-${userId}@monportfeuille.app`
      },
      {
        headers: {
          'Bridge-Version': '2021-06-01',
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Connect URL generated:", response.data.redirect_url);

    return res.status(200).json({
      connectUrl: response.data.redirect_url,
      userId
    });

  } catch (error) {
    console.error('❌ Bridge Error:', error.response?.data || error.message);
    
    return res.status(500).json({
      error: 'Erreur lors de la connexion bancaire',
      details: error.response?.data || error.message
    });
  }
}