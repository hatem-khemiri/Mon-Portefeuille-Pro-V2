import { useState, useEffect } from 'react';
import { RefreshCw, Unlink, AlertCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const BankConnection = () => {
  const { currentUser, transactions, setTransactions } = useFinance();
  
  const [bankConnection, setBankConnection] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  useEffect(() => {
    const savedConnection = localStorage.getItem(`bank_connection_${currentUser}`);
    if (savedConnection) {
      setBankConnection(JSON.parse(savedConnection));
    }
  }, [currentUser]);

  const handleConnect = async () => {
    try {
      setSyncError(null);
      
      const response = await fetch('/api/bridge/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser })
      });

      if (!response.ok) throw new Error('Erreur connexion');

      const { connectUrl } = await response.json();
      window.open(connectUrl, 'Bridge', 'width=500,height=700');
      
      alert('📱 Connectez votre banque, puis revenez ici et cliquez sur "Récupérer mes transactions"');

    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleFetchTransactions = async () => {
    // ✅ CORRECTION CRITIQUE : Vérifier la connexion locale AVANT de sync
    if (!bankConnection) {
      alert('❌ Aucune banque connectée.\n\nVeuillez d\'abord cliquer sur "Connecter ma banque".');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔍 Récupération items...');
      
      const itemsResponse = await fetch('/api/bridge/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser })
      });

      if (!itemsResponse.ok) throw new Error('Impossible de récupérer les items');

      const { items } = await itemsResponse.json();
      console.log(`✅ ${items.length} items trouvés`);

      if (!items || items.length === 0) {
        // ✅ Si Bridge n'a pas d'items, nettoyer aussi le localStorage
        setBankConnection(null);
        localStorage.removeItem(`bank_connection_${currentUser}`);
        alert('❌ Aucune banque connectée. Cliquez d\'abord sur "Connecter ma banque".');
        setIsSyncing(false);
        return;
      }

      const latestItem = items[0];
      
      // ✅ Vérifier que l'item correspond à notre connexion locale
      if (bankConnection.itemId && bankConnection.itemId !== latestItem.id) {
        alert('⚠️ La connexion bancaire a changé. Veuillez vous reconnecter.');
        setBankConnection(null);
        localStorage.removeItem(`bank_connection_${currentUser}`);
        setIsSyncing(false);
        return;
      }
      
      console.log(`🔄 Sync item: ${latestItem.id}...`);

      const syncResponse = await fetch('/api/bridge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: latestItem.id, userId: currentUser })
      });

      if (!syncResponse.ok) throw new Error('Erreur synchronisation');

      const syncData = await syncResponse.json();

      if (syncData.transactions && syncData.transactions.length > 0) {
        const connection = {
          itemId: latestItem.id,
          userId: currentUser,
          bankName: latestItem.bank_name,
          connectedAt: new Date().toISOString()
        };
        setBankConnection(connection);
        localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(connection));

        const existing = transactions || [];
        const bridgeIds = new Set(existing.filter(t => t.bridgeId).map(t => t.bridgeId));
        
        const newTrans = syncData.transactions.filter(t => !bridgeIds.has(t.bridgeId));

        if (newTrans.length > 0) {
          const updated = [...existing, ...newTrans];
          setTransactions(updated);
          setLastSync(new Date().toISOString());
          
          alert(`✅ ${newTrans.length} transaction(s) synchronisée(s) !\n\nAllez dans "Transactions" pour les voir.`);
        } else {
          alert(`ℹ️ ${syncData.transactions.length} transactions trouvées, toutes déjà synchronisées`);
        }
      } else {
        alert('ℹ️ Aucune transaction trouvée');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      setSyncError(error.message);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    // Supprimer les transactions synchronisées
    const updated = (transactions || []).filter(t => !t.isSynced);
    setTransactions(updated);
    
    // Nettoyer la connexion locale
    setBankConnection(null);
    setLastSync(null);
    localStorage.removeItem(`bank_connection_${currentUser}`);
    setShowDisconnectConfirm(false);
    
    alert('✅ Banque déconnectée et transactions synchronisées supprimées');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">🏦 Synchronisation bancaire</h3>
      
      {syncError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{syncError}</p>
        </div>
      )}

      {bankConnection && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-800 mb-2">
            ✅ {bankConnection.bankName || 'BoursoBank'} connectée
          </p>
          {lastSync && (
            <p className="text-xs text-green-700">
              Dernière sync : {new Date(lastSync).toLocaleString('fr-FR')}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleConnect}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          🏦 {bankConnection ? 'Reconnecter' : 'Connecter ma banque'}
        </button>

        <button
          onClick={handleFetchTransactions}
          disabled={isSyncing || !bankConnection}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Récupération...' : '📥 Récupérer mes transactions'}
        </button>

        {!bankConnection && (
          <p className="text-sm text-gray-600 text-center italic">
            ⚠️ Connectez d'abord votre banque pour synchroniser vos transactions
          </p>
        )}

        {bankConnection && (
          <>
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
                <p className="text-sm font-bold text-red-800 mb-3">
                  ⚠️ Confirmer la déconnexion ?
                </p>
                <p className="text-xs text-red-700 mb-3">
                  Cela supprimera toutes les transactions synchronisées.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="py-2 bg-red-600 text-white rounded-lg font-medium"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};