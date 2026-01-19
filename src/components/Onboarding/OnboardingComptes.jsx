import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export const OnboardingComptes = ({ comptes, onComptesChange, onNext, onPrevious }) => {
  const [newCompte, setNewCompte] = useState({ nom: '', solde: '', type: 'courant' });

  const addCompte = () => {
    if (newCompte.nom && newCompte.solde) {
      onComptesChange([...comptes, { ...newCompte }]);
      setNewCompte({ nom: '', solde: '', type: 'courant' });
    }
  };

  const removeCompte = (index) => {
    onComptesChange(comptes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Vos comptes bancaires</h3>
        <p className="text-gray-600 mb-4">Ajoutez au moins un compte courant (obligatoire)</p>
      </div>

      {comptes.length > 0 && (
        <div className="space-y-2 mb-4">
          {comptes.map((compte, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div>
                <p className="font-medium">{compte.nom}</p>
                <p className="text-sm text-gray-600">
                  {compte.type === 'courant' ? 'Compte Courant' : compte.type === 'epargne' ? 'Épargne' : 'Espèces'} 
                  {' - '}{parseFloat(compte.solde).toFixed(2)} €
                </p>
              </div>
              <button
                onClick={() => removeCompte(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <option value="courant">Compte Courant</option>
          <option value="epargne">Épargne</option>
          <option value="especes">Espèces/Cash</option>
        </select>
      </div>

      <button
        onClick={addCompte}
        className="w-full py-3 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Ajouter ce compte
      </button>

      {comptes.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Vous devez ajouter au moins un compte pour continuer
          </p>
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
  );
};