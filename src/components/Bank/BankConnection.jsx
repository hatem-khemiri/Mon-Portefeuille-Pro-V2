import { useState, useEffect } from 'react';
import { RefreshCw, Unlink, AlertCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useBankSync } from '../../hooks/useBankSync';

export const BankConnection = () => {
  const { currentUser } = useFinance();
  const { connectBank, syncTransactions, disconnectBank, isSyncing, syncError } = useBankSync();
  
  const [bankConnection, setBankConnection] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Charger l'état de connexion depuis localStorage
  useEffect(() => {
    const savedConnection = localStorage.getItem(`bank_connection_${currentUser}`);
    if (savedConnection) {
      setBankConnection(JSON.parse(savedConnection));
    }
  }, [currentUser]);

  // Gérer le retour de Bridge après connexion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('bridge_item_id');
    const userId = urlParams.get('bridge_user_id');
    const status = urlParams.get('bridge_status');

    if (status === 'success' && itemId && userId) {
      const connection = { itemId, userId, connectedAt: new Date().toISOString() };
      setBankConnection(connection);
      localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(connection));
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Synchroniser immédiatement
      handleSync(itemId, userId);
    }
  }, []);

  const handleConnect = async () => {
    try {
      await connectBank(currentUser);
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleSync = async (itemId = bankConnection?.itemId, userId = bankConnection?.userId) => {
    try {
      const result = await syncTransactions(itemId, userId);
      setLastSync(new Date().toISOString());
      alert(`✅ ${result.transactionsCount} transactions synchronisées !`);
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBank(bankConnection.itemId);
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
          ✅ Votre banque est connectée et synchronisée
        </p>
        {lastSync && (
          <p className="text-xs text-green-700">
            Dernière synchronisation : {new Date(lastSync).toLocaleString('fr-FR')}
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
            <p className="text-xs text-red-700 mb-4">
              Toutes les transactions synchronisées seront supprimées.
            </p>
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