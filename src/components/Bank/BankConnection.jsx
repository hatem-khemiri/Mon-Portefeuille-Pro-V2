import { useState, useEffect } from 'react';
import { RefreshCw, Unlink, AlertCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useBankSync } from '../../hooks/useBankSync';

export const BankConnection = () => {
  const { currentUser, transactions, setTransactions } = useFinance();
  const { connectBank, syncTransactions, disconnectBank, isSyncing, syncError } = useBankSync();
  
  const [bankConnection, setBankConnection] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  // Charger l'état de connexion
  useEffect(() => {
    const savedConnection = localStorage.getItem(`bank_connection_${currentUser}`);
    if (savedConnection) {
      setBankConnection(JSON.parse(savedConnection));
    }
  }, [currentUser]);

  // Auto-sync au chargement si connexion existe
  useEffect(() => {
    const autoSync = async () => {
      if (bankConnection && !hasAutoSynced && currentUser) {
        console.log('🔄 Auto-synchronisation au chargement...');
        setHasAutoSynced(true);
        
        try {
          // Vérifier si on a un itemId
          if (!bankConnection.itemId) {
            // Récupérer les items pour obtenir l'itemId
            console.log('🔍 Recherche item_id...');
            const itemsResponse = await fetch('/api/bridge/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser })
            });

            if (itemsResponse.ok) {
              const { items } = await itemsResponse.json();
              if (items && items.length > 0) {
                const updatedConnection = {
                  ...bankConnection,
                  itemId: items[0].id,
                  bankName: items[0].bank_name
                };
                setBankConnection(updatedConnection);
                localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(updatedConnection));
                
                // Synchroniser avec le nouvel itemId
                await handleSync(items[0].id);
              }
            }
          } else {
            // On a déjà l'itemId, synchroniser directement
            await handleSync(bankConnection.itemId);
          }
        } catch (error) {
          console.error('❌ Erreur auto-sync:', error);
        }
      }
    };

    autoSync();
  }, [bankConnection, currentUser, hasAutoSynced]);

  const handleConnect = async () => {
    try {
      await connectBank(currentUser);
      // Après connexion, marquer pour forcer un refresh
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleSync = async (itemId = bankConnection?.itemId) => {
    if (!itemId) {
      console.error('❌ Pas d\'itemId pour la synchronisation');
      return;
    }

    try {
      console.log('🔄 Synchronisation...', { itemId, userId: currentUser });
      
      const result = await syncTransactions(itemId, currentUser);
      
      console.log('📊 Résultat:', result);
      
      if (result.transactions && result.transactions.length > 0) {
        const existingTransactions = transactions || [];
        const bridgeIds = new Set(
          existingTransactions
            .filter(t => t.bridgeId)
            .map(t => t.bridgeId)
        );
        
        const newTransactions = result.transactions.filter(
          t => !bridgeIds.has(t.bridgeId)
        );
        
        console.log(`📥 ${newTransactions.length} nouvelles transactions sur ${result.transactions.length}`);
        
        if (newTransactions.length > 0) {
          const updatedTransactions = [...existingTransactions, ...newTransactions];
          setTransactions(updatedTransactions);
          
          setLastSync(new Date().toISOString());
          alert(`✅ ${newTransactions.length} nouvelle(s) transaction(s) ajoutée(s) !`);
        } else {
          setLastSync(new Date().toISOString());
          alert('ℹ️ Aucune nouvelle transaction');
        }
      } else {
        alert('ℹ️ Aucune transaction trouvée');
      }
      
    } catch (error) {
      console.error('❌ Erreur sync:', error);
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (bankConnection?.itemId) {
        await disconnectBank(bankConnection.itemId);
      }
      
      // Supprimer les transactions synchronisées
      const updatedTransactions = (transactions || []).filter(t => !t.isSynced);
      setTransactions(updatedTransactions);
      
      setBankConnection(null);
      setLastSync(null);
      setHasAutoSynced(false);
      localStorage.removeItem(`bank_connection_${currentUser}`);
      setShowDisconnectConfirm(false);
      alert('✅ Banque déconnectée avec succès');
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  if (!bankConnection) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4">🏦 Synchronisation bancaire</h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800 mb-3">
            Connectez votre banque pour synchroniser automatiquement vos transactions.
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>+400 banques françaises compatibles</li>
            <li>Synchronisation sécurisée via Bridge</li>
            <li>Mise à jour automatique des transactions</li>
          </ul>
        </div>
        <button
          onClick={handleConnect}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          🏦 Connecter ma banque
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">🏦 Banque connectée</h3>
      
      {syncError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{syncError}</p>
        </div>
      )}
      
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-800 mb-2">
          ✅ {bankConnection.bankName || 'Banque'} connectée
        </p>
        {lastSync && (
          <p className="text-xs text-green-700">
            Dernière sync : {new Date(lastSync).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleSync()}
          disabled={isSyncing}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
        </button>

        {!showDisconnectConfirm ? (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-all flex items-center justify-center gap-2"
          >
            <Unlink size={20} />
            Déconnecter ma banque
          </button>
        ) : (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="text-sm font-bold text-red-800 mb-3">⚠️ Confirmer la déconnexion ?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDisconnect}
                className="py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
