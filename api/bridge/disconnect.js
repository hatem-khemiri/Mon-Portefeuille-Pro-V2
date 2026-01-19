import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId requis' });
    }

    // Supprimer la connexion Bridge
    await axios.delete(
      `https://api.bridgeapi.io/v2/items/${itemId}`,
      {
        headers: {
          'Bridge-Version': process.env.BRIDGE_VERSION,
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET
        }
      }
    );

    return res.status(200).json({ 
      success: true,
      message: 'Déconnexion bancaire réussie'
    });

  } catch (error) {
    console.error('Erreur Bridge Disconnect:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Erreur lors de la déconnexion',
      details: error.response?.data || error.message
    });
  }
}