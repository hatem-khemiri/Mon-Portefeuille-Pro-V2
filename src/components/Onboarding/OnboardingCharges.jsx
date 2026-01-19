import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { CATEGORIES_DEPENSES } from '../../utils/constants';

export const OnboardingCharges = ({ charges, comptes, onChargesChange, onNext, onPrevious, onSkip }) => {
  const [newCharge, setNewCharge] = useState({
    nom: '',
    montant: '',
    categorie: CATEGORIES_DEPENSES[0],
    frequence: 'mensuelle',
    jourMois: '5',
    compte: comptes[0]?.nom || ''
  });

  const addCharge = () => {
    if (newCharge.nom && newCharge.montant && newCharge.compte) {
      onChargesChange([...charges, { ...newCharge }]);
      setNewCharge({
        nom: '',
        montant: '',
        categorie: CATEGORIES_DEPENSES[0],
        frequence: 'mensuelle',
        jourMois: '5',
        compte: comptes[0]?.nom || ''
      });
    } else {
      alert('Veuillez remplir tous les champs, y compris le compte débité !');
    }
  };

  const removeCharge = (index) => {
    onChargesChange(charges.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Vos charges fixes</h3>
        <p className="text-gray-600 mb-4">Ajoutez vos dépenses récurrentes (loyer, factures, abonnements...)</p>
        <p className="text-sm text-gray-500">Cette étape est optionnelle</p>
      </div>

      {charges.length > 0 && (
        <div className="space-y-2 mb-4">
          {charges.map((charge, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
              <div>
                <p className="font-medium">{charge.nom}</p>
                <p className="text-sm text-gray-600">
                  {charge.montant} € - {charge.categorie} - 
                  {charge.frequence === 'mensuelle' ? ' Mensuel' : charge.frequence === 'trimestrielle' ? ' Trimestriel' : ' Annuel'}
                </p>
              </div>
              <button
                onClick={() => removeCharge(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Nom (ex: Loyer)"
          value={newCharge.nom}
          onChange={e => setNewCharge({ ...newCharge, nom: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Montant (€)"
          value={newCharge.montant}
          onChange={e => setNewCharge({ ...newCharge, montant: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <select
          value={newCharge.categorie}
          onChange={e => setNewCharge({ ...newCharge, categorie: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          {CATEGORIES_DEPENSES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={newCharge.frequence}
          onChange={e => setNewCharge({ ...newCharge, frequence: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="mensuelle">Mensuel</option>
          <option value="trimestrielle">Trimestriel</option>
          <option value="annuelle">Annuel</option>
        </select>
        <input
          type="number"
          placeholder="Jour (1-31)"
          value={newCharge.jourMois}
          onChange={e => setNewCharge({ ...newCharge, jourMois: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          min="1"
          max="31"
        />
        <select
          value={newCharge.compte}
          onChange={e => setNewCharge({ ...newCharge, compte: e.target.value })}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="">Compte débité</option>
          {comptes.map((c, idx) => (
            <option key={idx} value={c.nom}>{c.nom}</option>
          ))}
        </select>
      </div>

      <button
        onClick={addCharge}
        className="w-full py-3 bg-orange-100 text-orange-600 rounded-xl font-medium hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Ajouter cette charge
      </button>

      {charges.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 mb-3">
            💡 Si vous n'avez aucune charge fixe à déclarer, cliquez sur le bouton ci-dessous
          </p>
          <button
            onClick={onSkip}
            className="w-full py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-all"
          >
            Je n'ai aucune charge fixe
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
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Suivant
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};