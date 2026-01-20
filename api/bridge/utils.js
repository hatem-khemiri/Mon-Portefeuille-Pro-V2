import axios from 'axios';

const BRIDGE_API_URL = 'https://api.bridgeapi.io';
const BRIDGE_VERSION = process.env.BRIDGE_VERSION || '2025-01-15';

// Fonction helper pour créer les headers
function getBridgeHeaders() {
  return {
    'Bridge-Version': BRIDGE_VERSION,
    'Client-Id': process.env.BRIDGE_CLIENT_ID,
    'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
}

export async function getAccessToken(userId) {
  try {
    console.log(`🔑 Obtention token pour: ${userId} (version: ${BRIDGE_VERSION})`);
    
    const response = await axios.post(
      `${BRIDGE_API_URL}/v2/authenticate`,
      {
        email: `user-${userId}@monportfeuille.app`,
        password: `pwd_${userId}_2026`
      },
      { headers: getBridgeHeaders() }
    );

    console.log('✅ Token obtenu');
    return response.data.access_token;

  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log(`👤 Création utilisateur (version: ${BRIDGE_VERSION})...`);
      
      try {
        await axios.post(
          `${BRIDGE_API_URL}/v2/users`,
          {
            email: `user-${userId}@monportfeuille.app`,
            password: `pwd_${userId}_2026`
          },
          { headers: getBridgeHeaders() }
        );
        
        console.log('✅ Utilisateur créé');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Réessayer l'authentification
        const retryResponse = await axios.post(
          `${BRIDGE_API_URL}/v2/authenticate`,
          {
            email: `user-${userId}@monportfeuille.app`,
            password: `pwd_${userId}_2026`
          },
          { headers: getBridgeHeaders() }
        );
        
        console.log('✅ Token obtenu après création');
        return retryResponse.data.access_token;

      } catch (createError) {
        console.error('❌ Erreur création:', createError.response?.data);
        throw new Error(`Erreur: ${createError.response?.data?.message || createError.message}`);
      }
    }
    
    console.error('❌ Erreur auth:', error.response?.data);
    throw new Error(`Erreur Bridge: ${error.response?.data?.message || error.message}`);
  }
}