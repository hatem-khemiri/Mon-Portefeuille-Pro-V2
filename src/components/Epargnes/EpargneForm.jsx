import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useEpargnes } from '../../hooks/useEpargnes';

export const EpargneForm = () => {
  const { comptes, categoriesEpargnes } = useFinance();
  const { addEpargne } = useEpargnes();
  
  const [newEpargne, setNewEpargne] = useState({
    nom: '',
    objectif: '',
    categorie: '',
    comptesAssocies: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addEpargne(newEpargne)) {
      setNewEpargne({ nom: '', objectif: '', categorie: '', comptesAssocies: [] });
    }
  };

  const toggleCompte = (compteNom) => {
    if (newEpargne.comptesAssocies.includes(compteNom)) {
      setNewEpargne({
        ...newEpargne,
        comptesAssocies: newEpargne.comptesAssocies.filter(c => c !== compteNom)
      });
    } else {
      setNewEpargne({
        ...newEpargne,
        comptesAssocies: [...newEpargne.comptesAssocies, compteNom]
      });
    }
  };

  const soldeTotal = newEpargne.comptesAssocies.reduce((total, nom) => {
    const c = comptes.find(compte => compte.nom === nom);
    return total + (c ? c.solde : 0);
  }, 0);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold mb-4">Créer un nouvel objectif d'épargne</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom de l'objectif (ex: Vacances 2026, Voiture, Apport immobilier...)"
          value={newEpargne.nom}
          onChange={e => setNewEpargne({ ...newEpargne, nom: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Montant objectif (€)"
            value={newEpargne.objectif}
            onChange={e => setNewEpargne({ ...newEpargne, objectif: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <select
            value={newEpargne.categorie}
            onChange={e => setNewEpargne({ ...newEpargne, categorie: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="">Catégorie</option>
            {categoriesEpargnes.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sélectionnez les comptes qui contribuent à cet objectif :
          </label>
          {comptes.length > 0 ? (
            <div className="space-y-2">
              {comptes.map(compte => (
                <label key={compte.id} className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={newEpargne.comptesAssocies.includes(compte.nom)}
                    onChange={() => toggleCompte(compte.nom)}
                    className="w-5 h-5 mr-3 accent-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{compte.nom}</p>
                    <p className="text-sm text-gray-600">
                      {compte.type === 'courant' ? '💳 Compte Courant' : compte.type === 'epargne' ? '💰 Épargne' : '💵 Espèces'}
                      {' - '}Solde: {compte.solde.toFixed(2)} €
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                ⚠️ Vous n'avez pas encore de compte configuré. Créez-en un dans le Paramétrage d'abord.
              </p>
            </div>
          )}
        </div>
        
        {newEpargne.comptesAssocies.length > 0 && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Solde total actuel : {soldeTotal.toFixed(2)} €
            </p>
          </div>
        )}
        
        <button 
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Créer cet objectif
        </button>
      </form>
    </div>
  );
};