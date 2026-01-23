import axios from 'axios';

const BRIDGE_VERSION = '2025-01-15';
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
  try {
    const { itemId, userId } = req.body;

    if (!itemId || !userId) {
      return res.status(400).json({ error: 'itemId et userId requis' });
    }

    // Obtenir le token
    let accessToken;
    try {
      const tokenResponse = await axios.post(
        `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
        { external_user_id: userId },
        { headers: getHeaders() }
      );
      accessToken = tokenResponse.data.access_token;
    } catch (e) {
      if (e.response?.status === 404) {
        await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/users`,
          { external_user_id: userId },
          { headers: getHeaders() }
        );
        const retry = await axios.post(
          `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
          { external_user_id: userId },
          { headers: getHeaders() }
        );
        accessToken = retry.data.access_token;
      } else {
        throw e;
      }
    }

    console.log("📊 Récupération TOUTES les transactions...");

    // Récupérer TOUTES les transactions de l'utilisateur
    const transactionsResponse = await axios.get(
      `${BRIDGE_API_URL}/v3/aggregation/transactions`,
      { 
        headers: getHeaders(accessToken),
        params: { limit: 500 }
      }
    );

    const allTransactions = (transactionsResponse.data.resources || []).map(t => ({
      id: `bridge_${t.id}`,
      date: t.date,
      description: t.clean_description || t.provider_description || 'Transaction',
      montant: parseFloat(t.amount),
      categorie: 'Autres dépenses',
      compte: 'Compte bancaire',
      statut: 'realisee',
      type: 'bancaire',
      bridgeId: t.id,
      bridgeAccountId: t.account_id,
      isSynced: true
    }));

    console.log(`✅ ${allTransactions.length} transactions récupérées`);

    return res.status(200).json({
      success: true,
      transactions: allTransactions,
      transactionsCount: allTransactions.length,
      syncDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Erreur synchronisation',
      details: error.response?.data || error.message
    });
  }
}
