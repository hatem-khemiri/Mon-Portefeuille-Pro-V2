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

    // Méthode 1 : Récupérer les transactions directement via l'item
    console.log("📊 Méthode 1: Récupération transactions via item...");
    
    let allTransactions = [];
    
    try {
      const itemTransactionsResponse = await axios.get(
        `${BRIDGE_API_URL}/v3/aggregation/items/${itemId}/transactions`,
        { 
          headers: getHeaders(accessToken),
          params: { limit: 500 }
        }
      );
      
      const itemTransactions = (itemTransactionsResponse.data.resources || []).map(t => ({
        id: `bridge_${t.id}`,
        date: t.date,
        description: t.description || t.clean_description || t.bank_description || 'Transaction',
        montant: parseFloat(t.amount),
        categorie: 'Autres dépenses',
        compte: t.account?.name || 'Compte bancaire',
        statut: 'realisee',
        type: 'bancaire',
        bridgeId: t.id,
        bridgeAccountId: t.account_id,
        isSynced: true
      }));
      
      allTransactions = itemTransactions;
      console.log(`✅ Méthode 1: ${itemTransactions.length} transactions depuis item`);
      
    } catch (itemError) {
      console.log("⚠️ Méthode 1 échouée:", itemError.response?.data?.errors?.[0]?.message || itemError.message);
    }

    // Méthode 2 : Si méthode 1 échoue, récupérer via comptes
    if (allTransactions.length === 0) {
      console.log("📊 Méthode 2: Récupération via comptes...");
      
      const accountsResponse = await axios.get(
        `${BRIDGE_API_URL}/v3/aggregation/accounts`,
        { headers: getHeaders(accessToken) }
      );

      const allAccounts = accountsResponse.data.resources || [];
      const accounts = allAccounts.filter(a => a.item_id === itemId);
      
      console.log(`  → ${accounts.length} comptes pour item ${itemId}`);

      for (const account of accounts) {
        try {
          const transactionsResponse = await axios.get(
            `${BRIDGE_API_URL}/v3/aggregation/accounts/${account.id}/transactions`,
            { 
              headers: getHeaders(accessToken),
              params: { limit: 500 }
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
          console.log(`    ✅ ${accountTransactions.length} transactions du compte ${account.name}`);
          
        } catch (error) {
          console.error(`    ❌ Erreur compte ${account.name}:`, error.message);
        }
      }
    }

    console.log(`🎉 TOTAL FINAL: ${allTransactions.length} transactions`);

    return res.status(200).json({
      success: true,
      transactions: allTransactions,
      transactionsCount: allTransactions.length,
      syncDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sync error:', error.response?.data || error.message);
    
    return res.status(500).json({ 
      error: 'Erreur synchronisation',
      details: error.response?.data || error.message
    });
  }
}
