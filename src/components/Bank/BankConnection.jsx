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

  // Charger l'état de connexion
  useEffect(() => {
    const savedConnection = localStorage.getItem(`bank_connection_${currentUser}`);
    if (savedConnection) {
      setBankConnection(JSON.parse(savedConnection));
    }
  }, [currentUser]);

  // Gérer le retour de Bridge après connexion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('bridge_status');
    
    if (status === 'success') {
      console.log('🎉 Retour Bridge avec succès');
      window.history.replaceState({}, document.title, window.location.pathname);
      handleSyncAfterConnection();
    }
  }, []);

  const handleConnect = async () => {
    try {
      await connectBank(currentUser);
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleSyncAfterConnection = async () => {
    try {
      console.log('🔄 Synchronisation après connexion...');
      
      const response = await fetch('/api/bridge/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser })
      });
      
      if (!response.ok) throw new Error('Erreur récupération items');
      
      const { items } = await response.json();
      
      if (items && items.length > 0) {
        const latestItem = items[0];
        
        const connection = { 
          itemId: latestItem.id, 
          userId: currentUser,
          bankName: latestItem.bank_name,
          connectedAt: new Date().toISOString() 
        };
        
        setBankConnection(connection);
        localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(connection));
        
        await handleSync(latestItem.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur sync après connexion:', error);
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleSync = async (itemId = bankConnection?.itemId) => {
    try {
      console.log('🔄 Lancement synchronisation...', { itemId, userId: currentUser });
      
      const result = await syncTransactions(itemId, currentUser);
      
      console.log('📊 Résultat sync:', result);
      
      if (result.transactions && result.transactions.length > 0) {
        console.log(`✅ ${result.transactions.length} transactions récupérées de Bridge`);
        
        // IMPORTANT: Fusionner avec les transactions existantes
        const existingTransactions = transactions || [];
        const bridgeIds = new Set(
          existingTransactions
            .filter(t => t.bridgeId)
            .map(t => t.bridgeId)
        );
        
        // Filtrer uniquement les nouvelles transactions
        const newTransactions = result.transactions.filter(
          t => !bridgeIds.has(t.bridgeId)
        );
        
        console.log(`📥 ${newTransactions.length} nouvelles transactions à ajouter`);
        
        if (newTransactions.length > 0) {
          // Mettre à jour directement le contexte React
          const updatedTransactions = [...existingTransactions, ...newTransactions];
          setTransactions(updatedTransactions);
          
          console.log('✅ Transactions ajoutées au contexte React');
          
          setLastSync(new Date().toISOString());
          alert(`✅ ${newTransactions.length} nouvelles transactions ajoutées !`);
        } else {
          alert('ℹ️ Aucune nouvelle transaction à synchroniser');
        }
      } else {
        alert('ℹ️ Aucune transaction trouvée');
      }
      
    } catch (error) {
      console.error('❌ Erreur handleSync:', error);
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (bankConnection?.itemId) {
        await disconnectBank(bankConnection.itemId);
      }
      
      // Supprimer les transactions synchronisées
      const updatedTransactions = transactions.filter(t => !t.isSynced);
      setTransactions(updatedTransactions);
      
      setBankConnection(null);
      setLastSync(null);
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
