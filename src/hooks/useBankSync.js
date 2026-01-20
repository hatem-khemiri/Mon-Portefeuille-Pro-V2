import { useState } from 'react';

export const useBankSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const connectBank = async (userId) => {
    try {
      setSyncError(null);
      
      // Nettoyer l'userId (supprimer espaces, caractères spéciaux)
      const cleanUserId = userId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      
      console.log('🔗 Connexion à Bridge pour userId:', cleanUserId);
      
      const response = await fetch('/api/bridge/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: cleanUserId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de connexion');
      }

      const { connectUrl } = await response.json();
      
      console.log('✅ URL de connexion obtenue:', connectUrl);

      // Ouvrir Bridge Connect dans une popup
      const width = 500;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const bridgeWindow = window.open(
        connectUrl,
        'Bridge Connect',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      // Écouter les événements de succès/échec
      const handleMessage = (event) => {
        if (event.origin !== 'https://api.bridgeapi.io') return;

        console.log('📨 Message Bridge reçu:', event.data);

        if (event.data.type === 'bridge:item:connected') {
          console.log('✅ Banque connectée!', event.data);
          bridgeWindow?.close();
          
          // Déclencher la synchronisation automatique
          if (event.data.item_id) {
            syncTransactions(event.data.item_id, cleanUserId);
          }
        }
      };

      window.addEventListener('message', handleMessage);

    } catch (error) {
      console.error('❌ Connect error:', error);
      setSyncError(error.message);
      throw error;
    }
  };

  const syncTransactions = async (itemId, userId) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔄 Synchronisation transactions...', { itemId, userId });
      
      const response = await fetch('/api/bridge/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de synchronisation');
      }

      const data = await response.json();
      console.log('✅ Synchronisation réussie:', data);
      return data;

    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncError(error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectBank = async (itemId) => {
    try {
      setSyncError(null);

      const response = await fetch('/api/bridge/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de déconnexion');
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Disconnect error:', error);
      setSyncError(error.message);
      throw error;
    }
  };

  return {
    connectBank,
    syncTransactions,
    disconnectBank,
    isSyncing,
    syncError
  };
};