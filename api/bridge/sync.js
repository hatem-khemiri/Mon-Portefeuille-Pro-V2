import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemId, userId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId requis' });
    }

    // Récupérer les comptes
    const accountsResponse = await axios.get(
      `https://api.bridgeapi.io/v2/accounts?item_id=${itemId}`,
      {
        headers: {
          'Bridge-Version': process.env.BRIDGE_VERSION,
          'Client-Id': process.env.BRIDGE_CLIENT_ID,
          'Client-Secret': process.env.BRIDGE_CLIENT_SECRET
        }
      }
    );

    const accounts = accountsResponse.data.resources;

    // Récupérer les transactions pour chaque compte
    let allTransactions = [];
    
    for (const account of accounts) {
      try {
        const transactionsResponse = await axios.get(
          `https://api.bridgeapi.io/v2/transactions?account_id=${account.id}&limit=100`,
          {
            headers: {
              'Bridge-Version': process.env.BRIDGE_VERSION,
              'Client-Id': process.env.BRIDGE_CLIENT_ID,
              'Client-Secret': process.env.BRIDGE_CLIENT_SECRET
            }
          }
        );

        const transactions = transactionsResponse.data.resources.map(t => ({
          id: `bridge_${t.id}`,
          date: t.date,
          description: t.description || t.raw_description || 'Transaction bancaire',
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
      } catch (error) {
        console.error(`Erreur récupération transactions compte ${account.id}:`, error.message);
      }
    }

    return res.status(200).json({
      accounts: accounts.map(a => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        type: a.type
      })),
      transactions: allTransactions,
      syncDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur Bridge Sync:', error.response?.data || error.message);
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