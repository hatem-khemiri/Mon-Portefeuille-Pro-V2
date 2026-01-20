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
    const { userId } = req.body;

    // Obtenir le token
    const tokenResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
      { external_user_id: userId },
      { headers: getHeaders() }
    );
    
    const accessToken = tokenResponse.data.access_token;

    // Lister les items (connexions bancaires)
    const itemsResponse = await axios.get(
      `${BRIDGE_API_URL}/v3/aggregation/items`,
      { headers: getHeaders(accessToken) }
    );

    return res.status(200).json({
      items: itemsResponse.data.resources
    });

  } catch (error) {
    console.error('❌ Items error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Erreur récupération items',
      details: error.response?.data || error.message
    });
  }
}