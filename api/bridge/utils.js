import axios from 'axios';

const BRIDGE_API_URL = 'https://api.bridgeapi.io';

/**
 * Génère un access token pour un utilisateur (crée l'utilisateur si nécessaire)
 */
export async function getAccessToken(userId) {
  try {
    console.log('🔑 Tentative de récupération du token pour:', userId);
    
    // Essayer de générer un token directement
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

    console.log('✅ Token obtenu avec succès');
    return response.data.access_token;

  } catch (error) {
    // Si l'utilisateur n'existe pas, le créer d'abord
    if (error.response?.status === 404) {
      console.log('👤 Utilisateur inexistant, création...');
      
      try {
        // Créer l'utilisateur avec l'API v3
        await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          {
            external_user_id: userId,
            email: `user-${userId}@example.com` // Email optionnel mais recommandé
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
        
        console.log('✅ Utilisateur créé, nouvelle tentative de token...');
        
        // Attendre un peu pour que Bridge enregistre l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Réessayer d'obtenir le token
        const retryResponse = await axios.post(
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
        
        console.log('✅ Token obtenu après création utilisateur');
        return retryResponse.data.access_token;

      } catch (createError) {
        console.error('❌ Erreur lors de la création:', createError.response?.data || createError.message);
        throw new Error(`Impossible de créer l'utilisateur: ${createError.response?.data?.message || createError.message}`);
      }
    }
    
    console.error('❌ Erreur getAccessToken:', error.response?.data || error.message);
    throw new Error(`Erreur Bridge: ${error.response?.data?.message || error.message}`);
  }
}