import { getUsersCount, sendAlertIfNeeded } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier que les variables d'environnement sont présentes
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET || !process.env.BRIDGE_VERSION) {
      console.error('Variables d\'environnement manquantes');
      return res.status(500).json({ error: 'Configuration serveur manquante' });
    }

    // Récupérer le nombre d'utilisateurs actifs
    const count = await getUsersCount();

    // Envoyer une alerte si nécessaire
    await sendAlertIfNeeded(count);

    const maxUsers = parseInt(process.env.MAX_USERS) || 100;

    return res.status(200).json({ 
      count,
      maxUsers,
      percentage: ((count / maxUsers) * 100).toFixed(1),
      canConnect: count < 95
    });

  } catch (error) {
    console.error('Erreur Users Count:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return res.status(500).json({ 
      error: 'Erreur lors du comptage',
      details: error.response?.data || error.message
    });
  }
}