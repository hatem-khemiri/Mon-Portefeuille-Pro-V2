import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const ComptesTab = () => {
  const { 
    comptes, 
    setComptes,
    chargesFixes,
    setChargesFixes,
    transactions,
    setTransactions,
    epargnes,
    setEpargnes,
    dettes,
    setDettes
  } = useFinance();
  const [newCompte, setNewCompte] = useState({ nom: '', solde: '', type: 'courant' });
  const [editingCompte, setEditingCompte] = useState(null);

  const addCompte = () => {
    if (newCompte.nom && newCompte.solde) {
      const soldeInitialFixe = parseFloat(newCompte.solde);
      setComptes([...comptes, { 
        id: Date.now(),
        nom: newCompte.nom,
        type: newCompte.type,
        solde: soldeInitialFixe,
        soldeInitial: soldeInitialFixe
      }]);
      setNewCompte({ nom: '', solde: '', type: 'courant' });
    }
  };

  const deleteCompte = (id) => {
    const compte = comptes.find(c => c.id === id);
    
    // Empêcher la suppression d'un compte synchronisé avec des transactions
    if (compte?.isSynced) {
      const transactionsSynced = transactions.filter(t => t.compte === compte.nom && t.isSynced);
      if (transactionsSynced.length > 0) {
        alert(`⚠️ Impossible de supprimer ce compte.\n\nIl contient ${transactionsSynced.length} transaction(s) synchronisée(s) depuis votre banque.\n\nVeuillez d'abord déconnecter votre banque dans l'onglet "Synchronisation".`);
        return;
      }
    }
    
    setComptes(comptes.filter(c => c.id !== id));
  };

  const updateCompte = (id, updatedData) => {
    const compteActuel = comptes.find(c => c.id === id);
    if (!compteActuel) {
      setEditingCompte(null);
      return;
    }
  
    const ancienNom = compteActuel.nom;
    const nouveauNom = updatedData.nom || ancienNom;
  
    // Mettre à jour le compte
    setComptes(comptes.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedData };
      }
      return c;
    }));
  
    // Si le nom a changé, mettre à jour toutes les références
    if (ancienNom !== nouveauNom) {
      console.log(`🔄 Renommage du compte: "${ancienNom}" → "${nouveauNom}"`);
    
      // 1. Mettre à jour les charges fixes
      setChargesFixes(chargesFixes.map(cf => {
        let updated = { ...cf };
        let modified = false;
      
        if (cf.compte === ancienNom) {
          updated.compte = nouveauNom;
          modified = true;
        }
      
        if (cf.compteDestination === ancienNom) {
          updated.compteDestination = nouveauNom;
          modified = true;
        }
      
        if (modified) {
          console.log(`  ✅ Charge fixe "${cf.nom}" mise à jour`);
        }
      
        return updated;
      }));
    
      // 2. Mettre à jour les transactions
      const transactionsModifiees = transactions.filter(t => t.compte === ancienNom).length;
      setTransactions(transactions.map(t => 
        t.compte === ancienNom ? { ...t, compte: nouveauNom } : t
      ));
      if (transactionsModifiees > 0) {
        console.log(`  ✅ ${transactionsModifiees} transaction(s) mise(s) à jour`);
      }
    
      // 3. Mettre à jour les épargnes
      const epargnesModifiees = epargnes.filter(e => 
        e.comptesAssocies.includes(ancienNom)
      ).length;
      setEpargnes(epargnes.map(e => ({
        ...e,
        comptesAssocies: e.comptesAssocies.map(nom => 
          nom === ancienNom ? nouveauNom : nom
        )
      })));
      if (epargnesModifiees > 0) {
        console.log(`  ✅ ${epargnesModifiees} épargne(s) mise(s) à jour`);
      }
    
      // 4. Mettre à jour les dettes
      const dettesModifiees = dettes.filter(d => d.compte === ancienNom).length;
      setDettes(dettes.map(d => 
        d.compte === ancienNom ? { ...d, compte: nouveauNom } : d
      ));
      if (dettesModifiees > 0) {
        console.log(`  ✅ ${dettesModifiees} dette(s) mise(s) à jour`);
      }
    
      console.log(`✨ Renommage terminé !`);
    }
  
    setEditingCompte(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Mes Comptes</h3>
        <div className="space-y-3">
          {comptes.map(compte => {
            const isEditing = editingCompte === compte.id;
            return (
              <div key={compte.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nom du compte
                          {compte.isSynced && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                              🏦 Synchronisé
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          defaultValue={compte.nom}
                          onBlur={(e) => updateCompte(compte.id, { nom: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg"
                          placeholder="Nom du compte"
                        />
                        {compte.isSynced && (
                          <p className="text-xs text-blue-600 mt-1">
                            💡 Ce compte est lié à votre banque. Vous pouvez le renommer librement (ex: "BNP Paribas", "Crédit Agricole").
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Type de compte</label>
                          <select
                            defaultValue={compte.type}
                            onChange={(e) => updateCompte(compte.id, { type: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg"
                          >
                            <option value="courant">💳 Compte Courant</option>
                            <option value="epargne">💰 Épargne</option>
                            <option value="especes">💵 Espèces/Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">✏️ Solde initial</label>
                          <input
                            type="number"
                            defaultValue={compte.soldeInitial !== undefined ? compte.soldeInitial : compte.solde}
                            onBlur={(e) => updateCompte(compte.id, { soldeInitial: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border-2 border-green-500 rounded-lg font-bold"
                            placeholder="Solde initial"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          💡 Le solde initial est le montant de départ de votre compte. Il sera utilisé pour calculer automatiquement votre solde actuel en fonction de vos transactions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 text-lg">{compte.nom}</p>
                        {compte.isSynced && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800" title="Compte synchronisé avec votre banque">
                            🏦
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          {compte.type === 'courant' ? '💳 Compte Courant' : compte.type === 'epargne' ? '💰 Épargne' : '💵 Espèces'}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">Solde initial :</p>
                          <p className="text-lg font-bold text-green-600">
                            {(compte.soldeInitial !== undefined ? compte.soldeInitial : compte.solde).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => setEditingCompte(isEditing ? null : compte.id)}
                    className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    title={isEditing ? 'Terminer' : 'Modifier / Renommer'}
                  >
                    {isEditing ? <Check size={20} /> : '✏️'}
                  </button>
                  <button 
                    onClick={() => deleteCompte(compte.id)} 
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t-2 pt-6">
        <h4 className="font-bold mb-4">Ajouter un compte</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom du compte"
            value={newCompte.nom}
            onChange={e => setNewCompte({...newCompte, nom: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Solde initial (€)"
            value={newCompte.solde}
            onChange={e => setNewCompte({...newCompte, solde: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <select
            value={newCompte.type}
            onChange={e => setNewCompte({...newCompte, type: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="courant">Compte Courant</option>
            <option value="epargne">Épargne</option>
            <option value="especes">Espèces/Cash</option>
          </select>
        </div>
        <button 
          onClick={addCompte} 
          className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter le compte
        </button>
      </div>
    </div>
  );
};