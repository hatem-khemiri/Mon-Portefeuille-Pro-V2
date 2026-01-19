import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { CATEGORIES_EPARGNES } from '../../utils/constants';

export const OnboardingEpargnes = ({ 
  epargnes, 
  comptes, 
  revenus, 
  charges, 
  transferts,
  onEpargnesChange, 
  onComplete, 
  onPrevious 
}) => {
  const [newEpargne, setNewEpargne] = useState({
    nom: '',
    objectif: '',
    categorie: '',
    comptesAssocies: []
  });

  const addEpargne = () => {
    if (newEpargne.nom && newEpargne.objectif && newEpargne.categorie && newEpargne.comptesAssocies.length > 0) {
      onEpargnesChange([...epargnes, { ...newEpargne }]);
      setNewEpargne({ nom: '', objectif: '', categorie: '', comptesAssocies: [] });
    }
  };

  const removeEpargne = (index) => {
    onEpargnesChange(epargnes.filter((_, i) => i !== index));
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Vos objectifs d'épargne</h3>
        <p className="text-gray-600 mb-4">Définissez vos objectifs et associez-y vos comptes épargne (optionnel)</p>
      </div>

      {epargnes.length > 0 && (
        <div className="space-y-2 mb-4">
          {epargnes.map((epargne, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div>
                <p className="font-medium">{epargne.nom}</p>
                <p className="text-sm text-gray-600">{epargne.categorie} - Objectif: {epargne.objectif} €</p>
                <p className="text-xs text-gray-500 mt-1">Comptes: {epargne.comptesAssocies.join(', ')}</p>
              </div>
              <button
                onClick={() => removeEpargne(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nom de l'objectif (ex: Vacances 2026)"
          value={newEpargne.nom}
          onChange={e => setNewEpargne({ ...newEpargne, nom: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Objectif (€)"
            value={newEpargne.objectif}
            onChange={e => setNewEpargne({ ...newEpargne, objectif: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <select
            value={newEpargne.categorie}
            onChange={e => setNewEpargne({ ...newEpargne, categorie: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="">Catégorie d'objectif</option>
            {CATEGORIES_EPARGNES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionnez les comptes associés à cet objectif
          </label>
          <div className="space-y-2">
            {comptes.map((compte, idx) => (
              <label key={idx} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={newEpargne.comptesAssocies.includes(compte.nom)}
                  onChange={() => toggleCompte(compte.nom)}
                  className="w-5 h-5 mr-3 accent-purple-500"
                />
                <div>
                  <p className="font-medium">{compte.nom}</p>
                  <p className="text-sm text-gray-600">
                    {compte.type === 'courant' ? '💳 Compte Courant' : compte.type === 'epargne' ? '💰 Épargne' : '💵 Espèces'} 
                    {' - '}Solde: {parseFloat(compte.solde).toFixed(2)} €
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={addEpargne}
        className="w-full py-3 bg-purple-100 text-purple-600 rounded-xl font-medium hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Ajouter cet objectif
      </button>

      {epargnes.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 mb-3">
            💡 Si vous n'avez aucun objectif d'épargne à définir, cliquez sur le bouton ci-dessous
          </p>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-all"
          >
            Je n'ai aucun objectif d'épargne
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
          <Check size={20} />
          Récapitulatif de votre configuration
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ {comptes.length} compte(s) bancaire(s)</li>
          <li>✓ {revenus.length} revenu(s) récurrent(s)</li>
          <li>✓ {charges.length} charge(s) fixe(s)</li>
          <li>✓ {transferts.length} transfert(s) automatique(s)</li>
          <li>✓ {epargnes.length} objectif(s) d'épargne</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onPrevious}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Précédent
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Terminer et accéder à l'application
        </button>
      </div>
    </div>
  );
};