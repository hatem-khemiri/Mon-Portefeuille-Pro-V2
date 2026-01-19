const API_URL = import.meta.env.PROD 
  ? 'https://mon-portefeuille-backend.onrender.com'
  : 'http://localhost:3001/api';

export const bridgeService = {
  // Test de connexion au backend
  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) throw new Error('Backend unreachable');
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Créer un utilisateur Bridge
  async createUser(email) {
    try {
      const response = await fetch(`${API_URL}/bridge/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to create user');
      }
      
      return response.json();
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  },

  // Récupérer les comptes bancaires
  async getAccounts(userUuid) {
    try {
      const response = await fetch(`${API_URL}/bridge/accounts?user_uuid=${userUuid}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to fetch accounts');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get accounts failed:', error);
      throw error;
    }
  },

  // Récupérer les transactions
  async getTransactions(userUuid) {
    try {
      const response = await fetch(`${API_URL}/bridge/transactions?user_uuid=${userUuid}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to fetch transactions');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get transactions failed:', error);
      throw error;
    }
  }
};