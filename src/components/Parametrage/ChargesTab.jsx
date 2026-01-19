import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useChargesFixes } from '../../hooks/useChargesFixes';

export const ChargesTab = () => {
  const { 
    comptes, 
    categoriesRevenus, 
    categoriesDepenses,
    transactions
  } = useFinance();
  
  const { 
    chargesFixes, 
    addChargeFixe, 
    addTransfertFixe, 
    deleteChargeFixe, 
    updateChargeFixe 
  } = useChargesFixes();
  
  const [activeChargeType, setActiveChargeType] = useState('normale');
  const [editingChargeFixe, setEditingChargeFixe] = useState(null);
  const [deletingChargeFixe, setDeletingChargeFixe] = useState(null);
  
  const [newChargeFixe, setNewChargeFixe] = useState({ 
    nom: '', 
    montant: '', 
    categorie: '', 
    frequence: 'mensuelle', 
    jourMois: 1, 
    compte: comptes[0]?.nom || '', 
    type: 'normale'
  });
  
  const [newTransfertFixe, setNewTransfertFixe] = useState({
    nom: '', 
    montant: '', 
    frequence: 'mensuelle', 
    jourMois: 1, 
    compteSource: comptes[0]?.nom || '', 
    compteDestination: ''
  });

  const handleAddChargeFixe = () => {
    if (addChargeFixe(newChargeFixe)) {
      setNewChargeFixe({ 
        nom: '', 
        montant: '', 
        categorie: '', 
        frequence: 'mensuelle', 
        jourMois: 1, 
        compte: comptes[0]?.nom || '', 
        type: 'normale' 
      });
    }
  };

  const handleAddTransfertFixe = () => {
    if (addTransfertFixe(newTransfertFixe)) {
      setNewTransfertFixe({ 
        nom: '', 
        montant: '', 
        frequence: 'mensuelle', 
        jourMois: 1, 
        compteSource: comptes[0]?.nom || '', 
        compteDestination: '' 
      });
    }
  };

  const confirmDeleteChargeFixe = () => {
    if (deletingChargeFixe) {
      deleteChargeFixe(deletingChargeFixe.id);
      setDeletingChargeFixe(null);
    }
  };

  return (
    <div className="space-y-6">
      {deletingChargeFixe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🗑️ Supprimer la transaction récurrente</h3>
            {(() => {
              const transactionsLiees = transactions.filter(t => t.chargeFixeId === deletingChargeFixe.id);
              return (
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-800 mb-2">
                      ⚠️ Vous êtes sur le point de supprimer "{deletingChargeFixe.nom}"
                    </p>
                    {transactionsLiees.length > 0 && (
                      <p className="text-sm text-red-700">
                        Cela supprimera également <strong>{transactionsLiees.length} transaction(s)</strong> associée(s) dans votre historique.
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-800">
                      💡 Cette action est irréversible. Les transactions futures ne seront plus générées automatiquement.
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingChargeFixe(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteChargeFixe}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Transactions Récurrentes</h3>
            <p className="text-gray-600">
              Gérez vos revenus, dépenses et transferts récurrents. Les transactions seront générées automatiquement.
            </p>
          </div>
        </div>
        
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-800">
            ✨ <strong>Synchronisation automatique activée !</strong> Les transactions sont générées et nettoyées automatiquement. Si vous modifiez une charge fixe, les transactions correspondantes seront mises à jour instantanément.
          </p>
        </div>
        
        <div className="space-y-3">
          {chargesFixes.map(charge => {
            const isEditing = editingChargeFixe === charge.id;
            const isTransfert = charge.type === 'transfert';
            
            return (
              <div key={charge.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border-2 hover:shadow-md transition-all gap-3 ${
                isTransfert 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
              }`}>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={charge.nom}
                        onBlur={(e) => updateChargeFixe(charge.id, { nom: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                        placeholder="Nom"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <input
                          type="number"
                          defaultValue={Math.abs(charge.montant)}
                          onBlur={(e) => {
                            let montant = Math.abs(parseFloat(e.target.value) || 0);
                            if (charge.montant < 0) {
                              montant = -montant;
                            }
                            updateChargeFixe(charge.id, { montant });
                          }}
                          className="px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                          placeholder="Montant"
                        />
                        {!isTransfert && (
                          <select
                            defaultValue={charge.categorie}
                            onChange={(e) => updateChargeFixe(charge.id, { categorie: e.target.value })}
                            className="px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                          >
                            <optgroup label="Revenus">
                              {categoriesRevenus.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Dépenses">
                              {categoriesDepenses.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </optgroup>
                          </select>
                        )}
                        <select
                          defaultValue={charge.compte}
                          onChange={(e) => updateChargeFixe(charge.id, { compte: e.target.value })}
                          className="px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                        >
                          {comptes.map(c => (
                            <option key={c.id} value={c.nom}>{c.nom}</option>
                          ))}
                        </select>
                        <select
                          defaultValue={charge.frequence}
                          onChange={(e) => updateChargeFixe(charge.id, { frequence: e.target.value })}
                          className="px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                        >
                          <option value="mensuelle">Mensuel</option>
                          <option value="trimestrielle">Trimestriel</option>
                          <option value="annuelle">Annuel</option>
                        </select>
                        <input
                          type="number"
                          defaultValue={charge.jourMois}
                          onBlur={(e) => updateChargeFixe(charge.id, { jourMois: parseInt(e.target.value) || 1 })}
                          className="px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                          placeholder="Jour"
                          min="1"
                          max="31"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-800">{charge.nom}</p>
                        {isTransfert ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                            🔄 Transfert
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            charge.montant >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {charge.categorie}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {charge.frequence === 'mensuelle' ? '📅 Mensuel' : 
                           charge.frequence === 'trimestrielle' ? '📅 Trimestriel' : '📅 Annuel'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          💳 {charge.compte}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {isTransfert ? (
                          `${Math.abs(charge.montant).toFixed(2)} € - De ${charge.compte} vers ${charge.compteDestination} - Le ${charge.jourMois} du mois`
                        ) : (
                          `${Math.abs(charge.montant).toFixed(2)} € - Le ${charge.jourMois} du mois`
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 items-center justify-end md:justify-start flex-shrink-0 md:ml-4">
                  <button 
                    onClick={() => setEditingChargeFixe(isEditing ? null : charge.id)}
                    className={`p-2 rounded-lg transition-all flex-shrink-0 ${isEditing ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    title={isEditing ? 'Terminer' : 'Modifier'}
                  >
                    {isEditing ? <Check size={20} /> : '✏️'}
                  </button>
                  <button 
                    onClick={() => setDeletingChargeFixe(charge)} 
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
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
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setActiveChargeType('normale')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeChargeType === 'normale'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Revenu / Dépense
          </button>
          <button
            onClick={() => setActiveChargeType('transfert')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeChargeType === 'transfert'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔄 Transfert / Épargne
          </button>
        </div>
        
        {activeChargeType === 'normale' && (
          <>
            <h4 className="font-bold mb-4">Ajouter une transaction</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Nom (ex: Salaire, Loyer...)"
                value={newChargeFixe.nom}
                onChange={e => setNewChargeFixe({...newChargeFixe, nom: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Montant (€)"
                value={newChargeFixe.montant}
                onChange={e => setNewChargeFixe({...newChargeFixe, montant: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                step="0.01"
                min="0"
              />
              <select
                value={newChargeFixe.categorie}
                onChange={e => setNewChargeFixe({...newChargeFixe, categorie: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="">Catégorie</option>
                <optgroup label="Revenus">
                  {categoriesRevenus.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
                <optgroup label="Dépenses">
                  {categoriesDepenses.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
              </select>
              <select
                value={newChargeFixe.frequence}
                onChange={e => setNewChargeFixe({...newChargeFixe, frequence: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="mensuelle">Mensuelle</option>
                <option value="trimestrielle">Trimestrielle</option>
                <option value="annuelle">Annuelle</option>
              </select>
              <input
                type="number"
                placeholder="Jour (1-31)"
                value={newChargeFixe.jourMois}
                onChange={e => setNewChargeFixe({...newChargeFixe, jourMois: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                min="1"
                max="31"
              />
              <select
                value={newChargeFixe.compte}
                onChange={e => setNewChargeFixe({...newChargeFixe, compte: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="">Compte</option>
                {comptes.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
              💡 Le signe sera automatique (revenus en +, dépenses en -). Les transactions seront générées pour l'année en cours.
            </div>
            <button 
              onClick={handleAddChargeFixe} 
              className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter la transaction
            </button>
          </>
        )}
        
        {activeChargeType === 'transfert' && (
          <>
            <h4 className="font-bold mb-2">Ajouter un transfert / épargne récurrent(e)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Exemple : Je vire 200€ chaque mois de mon Compte Courant vers mon Livret A le 5 du mois
            </p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Nom (ex: Épargne Livret A)"
                value={newTransfertFixe.nom}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, nom: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Montant (€)"
                value={newTransfertFixe.montant}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, montant: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                step="0.01"
                min="0"
              />
              <select
                value={newTransfertFixe.frequence}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, frequence: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="mensuelle">Mensuel</option>
                <option value="trimestrielle">Trimestriel</option>
                <option value="annuelle">Annuel</option>
              </select>
              <input
                type="number"
                placeholder="Jour (1-31)"
                value={newTransfertFixe.jourMois}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, jourMois: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                min="1"
                max="31"
              />
              <select
                value={newTransfertFixe.compteSource}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, compteSource: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="">Depuis...</option>
                {comptes.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
              <select
                value={newTransfertFixe.compteDestination}
                onChange={e => setNewTransfertFixe({...newTransfertFixe, compteDestination: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="">Vers...</option>
                {comptes.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 p-3 bg-purple-50 rounded-xl text-sm text-purple-800">
              💡 Ce transfert sera automatiquement généré chaque mois et ne comptera PAS comme une dépense.
            </div>
            <button 
              onClick={handleAddTransfertFixe} 
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter le transfert récurrent
            </button>
          </>
        )}
      </div>
    </div>
  );
};