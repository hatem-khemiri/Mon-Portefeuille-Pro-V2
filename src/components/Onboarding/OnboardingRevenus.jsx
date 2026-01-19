import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { CATEGORIES_REVENUS } from '../../utils/constants';

export const OnboardingRevenus = ({ revenus, comptes, onRevenusChange, onNext, onPrevious, onSkip }) => {
  const [newRevenu, setNewRevenu] = useState({
    nom: '',
    montant: '',
    categorie: CATEGORIES_REVENUS[0],
    frequence: 'mensuelle',
    jourMois: '1',
    compte: comptes[0]?.nom || ''
  });

  const addRevenu = () => {
    if (newRevenu.nom && newRevenu.montant && newRevenu.categorie && newRevenu.compte) {
      onRevenusChange([...revenus, { ...newRevenu }]);
      setNewRevenu({
        nom: '',
        montant: '',
        categorie: CATEGORIES_REVENUS[0],
        frequence: 'mensuelle',
        jourMois: '1',
        compte: comptes[0]?.nom || ''
      });
    } else {
      alert('Veuillez remplir tous les champs, y compris la catégorie');
    }
  };

  const removeRevenu = (index) => {
    onRevenusChange(revenus.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Vos revenus récurrents</h3>
        <p className="text-gray-600 mb-4">Ajoutez au moins votre salaire ou revenu principal</p>
      </div>

      {revenus.length > 0 && (
        <div className="space-y-2 mb-4">
          {revenus.map((revenu, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div>
                <p className="font-medium">{revenu.nom}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-green-700">{revenu.categorie}</span> - {revenu.montant} € - 
                  {revenu.frequence === 'mensuelle' ? ' Mensuel' : revenu.frequence === 'trimestrielle' ? ' Trimestriel' : ' Annuel'} - 
                  Le {revenu.jourMois} du mois
                </p>
              </div>
              <button
                onClick={() => removeRevenu(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Nom (ex: Salaire)"
          value={newRevenu.nom}
          onChange={e => setNewRevenu({ ...newRevenu, nom: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Montant (€)"
          value={newRevenu.montant}
          onChange={e => setNewRevenu({ ...newRevenu, montant: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <select
          value={newRevenu.categorie}
          onChange={e => setNewRevenu({ ...newRevenu, categorie: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="">Sélectionner...</option>
          {CATEGORIES_REVENUS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={newRevenu.frequence}
          onChange={e => setNewRevenu({ ...newRevenu, frequence: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="mensuelle">Mensuel</option>
          <option value="trimestrielle">Trimestriel</option>
          <option value="annuelle">Annuel</option>
        </select>
        <input
          type="number"
          placeholder="Jour (1-31)"
          value={newRevenu.jourMois}
          onChange={e => setNewRevenu({ ...newRevenu, jourMois: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          min="1"
          max="31"
        />
      </div>

      <button
        onClick={addRevenu}
        className="w-full py-3 bg-green-100 text-green-600 rounded-xl font-medium hover:bg-green-200 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Ajouter ce revenu
      </button>

      {revenus.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 mb-3">
            💡 Si vous n'avez aucun revenu récurrent à déclarer, cliquez sur le bouton ci-dessous
          </p>
          <button
            onClick={onSkip}
            className="w-full py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-all"
          >
            Je n'ai aucun revenu récurrent
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onPrevious}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Précédent
        </button>
        {revenus.length > 0 && (
          <button
            onClick={onNext}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Suivant
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};