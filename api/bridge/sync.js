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

    console.log("📊 Récupération transactions...");

    const transactionsResponse = await axios.get(
      `${BRIDGE_API_URL}/v3/aggregation/transactions`,
      { 
        headers: getHeaders(accessToken),
        params: { limit: 500 }
      }
    );

    // Calculer le décalage : différence entre aujourd'hui et la date la plus récente
    const today = new Date();
    const transactions = transactionsResponse.data.resources || [];
    
    const mostRecentDate = transactions.length > 0 
      ? new Date(Math.max(...transactions.map(t => new Date(t.date))))
      : today;
    
    const daysDiff = Math.ceil((today - mostRecentDate) / (1000 * 60 * 60 * 24));

    const allTransactions = transactions.map(t => {
      // Décaler la date dans le futur
      const originalDate = new Date(t.date);
      const futureDate = new Date(originalDate);
      futureDate.setDate(futureDate.getDate() + daysDiff);

      return {
        id: `bridge_${t.id}`,
        date: futureDate.toISOString().split('T')[0],
        description: t.clean_description || t.provider_description || 'Transaction',
        montant: parseFloat(t.amount),
        categorie: 'Autres dépenses',
        compte: 'BoursoBank',
        statut: 'avenir',  // ← Statut à venir au lieu de réalisée
        type: 'bancaire',
        bridgeId: t.id,
        bridgeAccountId: t.account_id,
        isSynced: true
      };
    });

    console.log(`✅ ${allTransactions.length} transactions futures récupérées (décalées de ${daysDiff} jours)`);

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
