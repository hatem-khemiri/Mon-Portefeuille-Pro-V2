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
  console.log("📥 SYNC REQ:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemId, userId } = req.body;

    if (!itemId || !userId) {
      return res.status(400).json({ error: 'itemId et userId requis' });
    }

    console.log("🔑 Obtention token...");
    
    const tokenResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
      { external_user_id: userId },
      { headers: getHeaders() }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log("✅ Token obtenu");

    // Récupérer TOUS les comptes de l'utilisateur
    console.log("📊 Récupération de tous les comptes...");
    
    const accountsResponse = await axios.get(
      `${BRIDGE_API_URL}/v3/aggregation/accounts`,
      { headers: getHeaders(accessToken) }
    );

    // Filtrer les comptes de cet item
    const allAccounts = accountsResponse.data.resources || [];
    const accounts = allAccounts.filter(a => a.item_id === itemId);
    
    console.log(`✅ ${accounts.length} comptes trouvés pour item ${itemId}`);

    if (accounts.length === 0) {
      console.log("⚠️ Aucun compte trouvé pour cet item");
      return res.status(200).json({
        success: true,
        accounts: [],
        transactions: [],
        transactionsCount: 0,
        syncDate: new Date().toISOString()
      });
    }

    // Récupérer les transactions pour chaque compte
    let allTransactions = [];
    
    for (const account of accounts) {
      try {
        console.log(`📄 Compte: ${account.name} (${account.id})`);
        
        const transactionsResponse = await axios.get(
          `${BRIDGE_API_URL}/v3/aggregation/accounts/${account.id}/transactions`,
          { 
            headers: getHeaders(accessToken),
            params: { limit: 100 }
          }
        );
        
        const accountTransactions = (transactionsResponse.data.resources || []).map(t => ({
          id: `bridge_${t.id}`,
          date: t.date,
          description: t.description || t.clean_description || t.bank_description || 'Transaction',
          montant: parseFloat(t.amount),
          categorie: 'Autres dépenses',
          compte: account.name,
          statut: 'realisee',
          type: 'bancaire',
          bridgeId: t.id,
          bridgeAccountId: account.id,
          isSynced: true
        }));
        
        allTransactions = [...allTransactions, ...accountTransactions];
        console.log(`  ✅ ${accountTransactions.length} transactions`);
        
      } catch (error) {
        console.error(`❌ Erreur compte ${account.name}:`, error.response?.data || error.message);
      }
    }

    console.log(`🎉 Total: ${allTransactions.length} transactions récupérées`);

    return res.status(200).json({
      success: true,
      accounts: accounts.map(a => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        type: a.type
      })),
      transactions: allTransactions,
      transactionsCount: allTransactions.length,
      syncDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sync error:', error.response?.data || error.message);
    
    return res.status(500).json({ 
      error: 'Erreur lors de la synchronisation',
      details: error.response?.data || error.message
    });
  }
}
