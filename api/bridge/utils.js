import axios from 'axios';

// URL de base selon l'environnement
const BRIDGE_API_URL = process.env.BRIDGE_ENV === 'production' 
  ? 'https://api.bridgeapi.io'
  : 'https://sync.bankin.com';

/**
 * Génère un access token pour un utilisateur (crée l'utilisateur si nécessaire)
 */
export async function getAccessToken(userId) {
  try {
    const response = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
      {
        external_user_id: userId
      },
      {
        headers: {
          'Bridge-Version': process.env.BRIDGE_VERSION,
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    // Si l'utilisateur n'existe pas, le créer d'abord
    if (error.response?.status === 404 || error.response?.data?.errors?.[0]?.code === 'not_found') {
      console.log('Utilisateur inexistant, création...');
      
      await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/users`,
        {
          external_user_id: userId
        },
        {
          headers: {
            'Bridge-Version': process.env.BRIDGE_VERSION,
            'Client-Id': process.env.BRIDGE_CLIENT_ID,
            'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Réessayer d'obtenir le token
      return getAccessToken(userId);
    }
    
    console.error('Erreur getAccessToken:', error.response?.data || error.message);
    throw error;
  }
}