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

    console.log("🔑 Obtention token pour sync...");
    
    // Obtenir le token
    const tokenResponse = await axios.post(
      `${BRIDGE_API_URL}/v3/aggregation/authorization/token`,
      { external_user_id: userId },
      { headers: getHeaders() }
    );
    
    const accessToken = tokenResponse.data.access_token;

    // Récupérer les comptes de cet item
    console.log("📊 Récupération comptes pour item:", itemId);
    
    const accountsResponse = await axios.get(
      `${BRIDGE_API_URL}/v3/aggregation/items/${itemId}/accounts`,
      { headers: getHeaders(accessToken) }
    );

    const accounts = accountsResponse.data.resources;
    console.log(`✅ ${accounts.length} comptes trouvés`);

    // Récupérer les transactions pour chaque compte
    let allTransactions = [];
    
    for (const account of accounts) {
      try {
        console.log(`📄 Récupération transactions compte: ${account.name}`);
        
        const transactionsResponse = await axios.get(
          `${BRIDGE_API_URL}/v3/aggregation/accounts/${account.id}/transactions?limit=100`,
          { headers: getHeaders(accessToken) }
        );
        
        const transactions = transactionsResponse.data.resources.map(t => ({
          id: `bridge_${t.id}`,
          date: t.date,
          description: t.description || t.clean_description || t.bank_description || 'Transaction bancaire',
          montant: parseFloat(t.amount),
          categorie: mapBridgeCategory(t.category_id),
          compte: account.name,
          statut: 'realisee',
          type: 'bancaire',
          bridgeId: t.id,
          bridgeAccountId: account.id,
          isSynced: true
        }));
        
        allTransactions = [...allTransactions, ...transactions];
        console.log(`  ✅ ${transactions.length} transactions récupérées`);
        
      } catch (error) {
        console.error(`❌ Erreur compte ${account.id}:`, error.message);
      }
    }

    console.log(`🎉 Total: ${allTransactions.length} transactions synchronisées`);

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

// Mapper les catégories Bridge vers nos catégories
function mapBridgeCategory(bridgeCategoryId) {
  const categoryMap = {
    1: 'Alimentation',
    2: 'Transport',
    3: 'Logement',
    4: 'Loisirs',
    5: 'Santé',
    6: 'Shopping',
    7: 'Factures',
    null: 'Autres dépenses'
  };
  
  return categoryMap[bridgeCategoryId] || 'Autres dépenses';
}