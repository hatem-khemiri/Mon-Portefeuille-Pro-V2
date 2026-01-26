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

// ✅ NOUVELLE FONCTION : Catégorisation intelligente
function categorizeTransaction(transaction) {
  const amount = parseFloat(transaction.amount);
  const description = (transaction.clean_description || transaction.provider_description || '').toLowerCase();
  
  // REVENUS (montant positif)
  if (amount > 0) {
    if (description.includes('vir') || description.includes('virement') || description.includes('salaire')) {
      return 'Salaire';
    }
    if (description.includes('remboursement') || description.includes('remb')) {
      return 'Remboursement';
    }
    return 'Autres revenus';
  }
  
  // DÉPENSES (montant négatif)
  if (amount < 0) {
    // Alimentation
    if (description.includes('carrefour') || description.includes('auchan') || 
        description.includes('leclerc') || description.includes('lidl') ||
        description.includes('marjane') || description.includes('supermarché') ||
        description.includes('hypermarché') || description.includes('monoprix')) {
      return 'Courses';
    }
    
    if (description.includes('mcdo') || description.includes('mcdonald') ||
        description.includes('kfc') || description.includes('burger') ||
        description.includes('restaurant') || description.includes('cafe')) {
      return 'Restaurants';
    }
    
    // Transport
    if (description.includes('essence') || description.includes('total') ||
        description.includes('shell') || description.includes('carburant') ||
        description.includes('station') || description.includes('gas')) {
      return 'Transport';
    }
    
    // Loisirs
    if (description.includes('cinema') || description.includes('spotify') ||
        description.includes('netflix') || description.includes('youtube') ||
        description.includes('jeux') || description.includes('game')) {
      return 'Loisirs';
    }
    
    // Santé
    if (description.includes('pharmacie') || description.includes('medecin') ||
        description.includes('docteur') || description.includes('hopital')) {
      return 'Santé';
    }
    
    // Logement
    if (description.includes('loyer') || description.includes('edf') ||
        description.includes('eau') || description.includes('gaz') ||
        description.includes('electricite')) {
      return 'Logement';
    }
    
    // Abonnements
    if (description.includes('prlv') || description.includes('prelevement') ||
        description.includes('abonnement') || description.includes('bouygues') ||
        description.includes('orange') || description.includes('sfr') ||
        description.includes('free') || description.includes('macif') ||
        description.includes('matmut') || description.includes('assurance')) {
      return 'Abonnements';
    }
    
    // Retraits
    if (description.includes('retrait') || description.includes('dab') ||
        description.includes('atm') || description.includes('especes')) {
      return 'Retraits';
    }
    
    return 'Autres dépenses';
  }
  
  return 'Autres dépenses';
}

export default async function handler(req, res) {
  try {
    const { itemId, userId, bankName } = req.body; // ✅ Récupérer bankName

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

    const transactions = transactionsResponse.data.resources || [];
    
    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
        transactionsCount: 0,
        syncDate: new Date().toISOString()
      });
    }

    // Trouver la transaction la PLUS ANCIENNE
    const oldestDate = new Date(Math.min(...transactions.map(t => new Date(t.date))));
    
    // Calculer le décalage pour que la plus ancienne commence AUJOURD'HUI
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((today - oldestDate) / (1000 * 60 * 60 * 24));

    console.log(`📅 Décalage de ${daysDiff} jours (ancienne: ${oldestDate.toISOString().split('T')[0]} → nouvelle: ${today.toISOString().split('T')[0]})`);

    const allTransactions = transactions.map(t => {
      const originalDate = new Date(t.date);
      const futureDate = new Date(originalDate);
      futureDate.setDate(futureDate.getDate() + daysDiff);

      return {
        id: `bridge_${t.id}`,
        date: futureDate.toISOString().split('T')[0],
        description: t.clean_description || t.provider_description || 'Transaction',
        montant: parseFloat(t.amount),
        categorie: categorizeTransaction(t),
        compte: bankName || 'Ma Banque', // ✅ Utiliser le nom passé en paramètre
        statut: 'avenir',
        type: 'bancaire',
        bridgeId: t.id,
        bridgeAccountId: t.account_id,
        isSynced: true
      };
    });

    console.log(`✅ ${allTransactions.length} transactions (du ${allTransactions[allTransactions.length - 1].date} au ${allTransactions[0].date})`);

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