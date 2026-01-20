import axios from 'axios';

const BRIDGE_API_URL = 'https://api.bridgeapi.io';

export async function getAccessToken(userId) {
  try {
    console.log('🔑 Obtention token v2 pour:', userId);
    
    const response = await axios.post(
      `${BRIDGE_API_URL}/v2/authenticate`,
      {
        email: `user-${userId}@monportfeuille.app`,
        password: `pwd_${userId}_2026`
      },
      {
        headers: {
          'Bridge-Version': '2021-06-01',
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Token v2 obtenu');
    return response.data.access_token;

  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log('👤 Création utilisateur v2...');
      
      try {
        await axios.post(
          `${BRIDGE_API_URL}/v2/users`,
          {
            email: `user-${userId}@monportfeuille.app`,
            password: `pwd_${userId}_2026`
          },
          {
            headers: {
              'Bridge-Version': '2021-06-01',
              'Client-Id': process.env.BRIDGE_CLIENT_ID,
              'Client-Secret': process.env.BRIDGE_CLIENT_SECRET,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Utilisateur v2 créé');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return getAccessToken(userId);

      } catch (createError) {
        console.error('❌ Erreur création v2:', createError.response?.data);
        throw new Error(`Erreur: ${createError.response?.data?.message || createError.message}`);
      }
    }
    
    console.error('❌ Erreur auth v2:', error.response?.data);
    throw new Error(`Erreur Bridge: ${error.response?.data?.message || error.message}`);
  }
}