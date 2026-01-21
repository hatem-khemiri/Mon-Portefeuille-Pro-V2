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
      
      alert('📱 Connectez votre banque dans la fenêtre, puis revenez ici et cliquez sur "Récupérer mes transactions"');

    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleFetchTransactions = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔍 Récupération des items Bridge...');
      
      const itemsResponse = await fetch('/api/bridge/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser })
      });

      if (!itemsResponse.ok) throw new Error('Impossible de récupérer les items');

      const { items } = await itemsResponse.json();
      console.log(`✅ ${items.length} items trouvés`);

      if (!items || items.length === 0) {
        alert('❌ Aucune banque connectée');
        setIsSyncing(false);
        return;
      }

      // IMPORTANT: Synchroniser TOUS les items
      let allTransactions = [];
      let totalCount = 0;

      for (const item of items) {
        console.log(`🔄 Synchronisation item ${item.id} - ${item.bank_name}...`);

        try {
          const syncResponse = await fetch('/api/bridge/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, userId: currentUser })
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            if (syncData.transactions && syncData.transactions.length > 0) {
              allTransactions = [...allTransactions, ...syncData.transactions];
              totalCount += syncData.transactions.length;
              console.log(`  ✅ ${syncData.transactions.length} transactions de ${item.bank_name}`);
            }
          }
        } catch (error) {
          console.error(`❌ Erreur item ${item.id}:`, error);
        }
      }

      console.log(`🎉 Total récupéré: ${totalCount} transactions de ${items.length} items`);

      if (allTransactions.length > 0) {
        // Sauvegarder la première connexion trouvée
        const firstItem = items[0];
        const connection = {
          itemId: firstItem.id,
          userId: currentUser,
          bankName: firstItem.bank_name,
          itemsCount: items.length,
          connectedAt: new Date().toISOString()
        };
        setBankConnection(connection);
        localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(connection));

        // Fusionner avec les transactions existantes
        const existing = transactions || [];
        const bridgeIds = new Set(existing.filter(t => t.bridgeId).map(t => t.bridgeId));
        
        const newTrans = allTransactions.filter(t => !bridgeIds.has(t.bridgeId));

        if (newTrans.length > 0) {
          const updated = [...existing, ...newTrans];
          setTransactions(updated);
          setLastSync(new Date().toISOString());
          
          console.log(`✅ ${newTrans.length} nouvelles transactions ajoutées au contexte`);
          alert(`✅ ${newTrans.length} transaction(s) ajoutée(s) depuis ${items.length} connexion(s) bancaire(s) !\n\nAllez dans l'onglet "Transactions" pour les voir.`);
        } else {
          alert(`ℹ️ ${totalCount} transactions trouvées, mais toutes déjà synchronisées`);
        }
      } else {
        alert(`ℹ️ Aucune transaction trouvée dans vos ${items.length} connexion(s) bancaire(s)`);
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
    const updated = (transactions || []).filter(t => !t.isSynced);
    setTransactions(updated);
    
    setBankConnection(null);
    setLastSync(null);
    localStorage.removeItem(`bank_connection_${currentUser}`);
    setShowDisconnectConfirm(false);
    alert('✅ Banque déconnectée');
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
            ✅ {bankConnection.itemsCount || 1} connexion(s) bancaire(s)
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
          🏦 {bankConnection ? 'Ajouter une banque' : 'Connecter ma banque'}
        </button>

        <button
          onClick={handleFetchTransactions}
          disabled={isSyncing}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Récupération...' : '📥 Récupérer TOUTES mes transactions'}
        </button>

        {bankConnection && (
          <>
            {!showDisconnectConfirm ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-all flex items-center justify-center gap-2"
              >
                <Unlink size={20} />
                Déconnecter toutes mes banques
              </button>
            ) : (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <p className="text-sm font-bold text-red-800 mb-3">⚠️ Confirmer ?</p>
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

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-800">
          💡 Le bouton récupère les transactions de <strong>toutes</strong> vos connexions bancaires ({bankConnection?.itemsCount || '?'} détectée(s))
        </p>
      </div>
    </div>
  );
};
