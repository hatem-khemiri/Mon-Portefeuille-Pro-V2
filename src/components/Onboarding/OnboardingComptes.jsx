import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { AccountMappingModal } from '../Bank/AccountMappingModal';

export const OnboardingComptes = ({ comptes, onComptesChange, onNext, onPrevious, currentUser }) => {
  const [newCompte, setNewCompte] = useState({ nom: '', solde: '', type: 'courant' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [pendingSyncData, setPendingSyncData] = useState(null);

  const addCompte = () => {
    if (newCompte.nom && newCompte.solde) {
      onComptesChange([...comptes, { 
        id: Date.now(),
        nom: newCompte.nom,
        type: newCompte.type,
        solde: parseFloat(newCompte.solde),
        soldeInitial: parseFloat(newCompte.solde)
      }]);
      setNewCompte({ nom: '', solde: '', type: 'courant' });
    }
  };

  const removeCompte = (index) => {
    onComptesChange(comptes.filter((_, i) => i !== index));
  };

  // ✅ NOUVEAU : Gérer la synchronisation bancaire
  const handleBankSync = async () => {
    setIsSyncing(true);

    try {
      // 1. Connexion Bridge
      const connectResponse = await fetch('/api/bridge/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser })
      });

      if (!connectResponse.ok) throw new Error('Erreur connexion');

      const { connectUrl } = await connectResponse.json();
      const popup = window.open(connectUrl, 'Bridge', 'width=500,height=700');
      
      // 2. Attendre la fermeture de la popup
      const checkPopup = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkPopup);
          
          try {
            // 3. Récupérer les items
            const itemsResponse = await fetch('/api/bridge/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser })
            });

            if (!itemsResponse.ok) throw new Error('Impossible de récupérer les items');

            const { items } = await itemsResponse.json();
            
            if (!items || items.length === 0) {
              alert('⚠️ Connexion non finalisée. Réessayez en suivant toutes les étapes.');
              setIsSyncing(false);
              return;
            }

            const latestItem = items[0];
            const bankName = latestItem.bank_name || 'Ma Banque';

            // 4. Synchroniser les transactions
            const syncResponse = await fetch('/api/bridge/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                itemId: latestItem.id, 
                userId: currentUser,
                bankName: 'TEMP' // Sera remplacé après mapping
              })
            });

            if (!syncResponse.ok) throw new Error('Erreur synchronisation');

            const syncData = await syncResponse.json();

            if (syncData.transactions && syncData.transactions.length > 0) {
              // 5. Sauvegarder la connexion
              const connection = {
                itemId: latestItem.id,
                userId: currentUser,
                bankName: latestItem.bank_name,
                connectedAt: new Date().toISOString()
              };
              localStorage.setItem(`bank_connection_${currentUser}`, JSON.stringify(connection));

              // 6. ✅ TOUJOURS afficher la modal (même si aucun compte)
              setPendingSyncData({
                transactions: syncData.transactions,
                bankName: bankName,
                connection: connection
              });
              setShowMappingModal(true);
              setIsSyncing(false);
            } else {
              alert('ℹ️ Aucune transaction trouvée');
              setIsSyncing(false);
            }
          } catch (err) {
            console.error('Erreur sync:', err);
            alert(`❌ Erreur : ${err.message}`);
            setIsSyncing(false);
          }
        }
      }, 1000);

    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
      setIsSyncing(false);
    }
  };

  // ✅ NOUVEAU : Callback du mapping
  const handleMappingConfirm = (mapping) => {
    const { transactions: newTrans, bankName } = pendingSyncData;
    
    let targetCompte;
    
    if (mapping.type === 'existing') {
      // Fusionner avec un compte existant
      targetCompte = mapping.compte;
    } else {
      // Créer un nouveau compte
      targetCompte = {
        id: Date.now(),
        nom: mapping.compteName,
        type: mapping.compteType || 'courant',
        solde: 0,
        soldeInitial: 0,
        isSynced: true
      };
      onComptesChange([...comptes, targetCompte]);
    }
    
    setShowMappingModal(false);
    setPendingSyncData(null);
    
    alert(`✅ ${newTrans.length} transaction(s) synchronisée(s) vers "${targetCompte.nom}" !`);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Vos comptes bancaires</h3>
          <p className="text-gray-600 mb-4">Synchronisez votre banque ou ajoutez des comptes manuellement</p>
        </div>

        {/* ✅ NOUVEAU : Section synchronisation bancaire */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                🏦 Synchronisation bancaire
              </h4>
              <p className="text-sm text-blue-700">
                Connexion sécurisée et automatique à votre banque
              </p>
            </div>
          </div>
          
          <button
            onClick={handleBankSync}
            disabled={isSyncing}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Connexion en cours...' : '🏦 Connecter ma banque'}
          </button>
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">ou ajoutez manuellement</span>
          </div>
        </div>

        {/* Liste des comptes ajoutés */}
        {comptes.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-bold text-gray-700 mb-3">📋 Comptes ajoutés ({comptes.length})</h4>
            {comptes.map((compte, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{compte.nom}</p>
                      {compte.isSynced && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          🏦 Synchronisé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {compte.type === 'courant' ? '💳 Compte Courant' : compte.type === 'epargne' ? '💰 Épargne' : '💵 Espèces'} 
                      {compte.solde !== undefined && ` - ${parseFloat(compte.solde).toFixed(2)} €`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCompte(idx)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire ajout manuel */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-bold text-gray-700 mb-4">✏️ Ajouter un compte manuellement</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nom du compte"
              value={newCompte.nom}
              onChange={e => setNewCompte({ ...newCompte, nom: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Solde actuel (€)"
              value={newCompte.solde}
              onChange={e => setNewCompte({ ...newCompte, solde: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newCompte.type}
              onChange={e => setNewCompte({ ...newCompte, type: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="courant">💳 Compte Courant</option>
              <option value="epargne">💰 Épargne</option>
              <option value="especes">💵 Espèces/Cash</option>
            </select>
          </div>

          <button
            onClick={addCompte}
            className="w-full py-3 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Ajouter ce compte
          </button>
        </div>

        {comptes.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Vous devez ajouter au moins un compte (synchronisé ou manuel) pour continuer
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onPrevious}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Précédent
          </button>
          <button
            onClick={() => {
              if (comptes.length === 0) {
                alert('⚠️ Veuillez ajouter au moins un compte avant de continuer');
                return;
              }
              onNext();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Suivant
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* ✅ Modal de mapping */}
      <AccountMappingModal
        isOpen={showMappingModal}
        onClose={() => {
          setShowMappingModal(false);
          setPendingSyncData(null);
        }}
        comptes={comptes}
        bankName={pendingSyncData?.bankName}
        transactionsCount={pendingSyncData?.transactions.length}
        onConfirm={handleMappingConfirm}
      />
    </>
  );
};