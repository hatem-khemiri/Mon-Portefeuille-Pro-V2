import axios from 'axios';

const BRIDGE_API_URL = 'https://api.bridgeapi.io';
const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';

function getBridgeHeaders(withAuth = false, token = null) {
  const headers = {
    'Bridge-Version': BRIDGE_VERSION,
    'Client-Id': process.env.BRIDGE_CLIENT_ID,
    'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
  
  if (withAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function getAccessToken(userId) {
  try {
    console.log(`🔑 [v3] Obtention token pour: ${userId} (version: ${BRIDGE_VERSION})`);
    
    // V3: Obtenir un token d'accès
    const response = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
      {
        external_user_id: userId
      },
      { headers: getBridgeHeaders() }
    );

    console.log('✅ Token v3 obtenu');
    return response.data.access_token;

  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`👤 [v3] Création utilisateur (version: ${BRIDGE_VERSION})...`);
      
      try {
        // V3: Créer un utilisateur
        await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          {
            external_user_id: userId
          },
          { headers: getBridgeHeaders() }
        );
        
        console.log('✅ Utilisateur v3 créé');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Réessayer l'obtention du token
        const retryResponse = await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
          {
            external_user_id: userId
          },
          { headers: getBridgeHeaders() }
        );
        
        console.log('✅ Token v3 obtenu après création');
        return retryResponse.data.access_token;

      } catch (createError) {
        console.error('❌ Erreur création v3:', createError.response?.data);
        throw new Error(`Erreur création: ${createError.response?.data?.message || createError.message}`);
      }
    }
    
    console.error('❌ Erreur token v3:', error.response?.data);
    throw new Error(`Erreur Bridge: ${error.response?.data?.message || error.message}`);
  }
}