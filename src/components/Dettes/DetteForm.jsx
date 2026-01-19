import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useDettes } from '../../hooks/useDettes';
import { calculerMensualite } from '../../utils/calculations';

export const DetteForm = () => {
  const { comptes } = useFinance();
  const { addDette } = useDettes();
  
  const [newDette, setNewDette] = useState({ 
    nom: '', 
    compte: comptes[0]?.nom || '', 
    total: '', 
    restant: '', 
    duree: '', 
    taux: '', 
    type: 'credit_bancaire' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addDette(newDette)) {
      setNewDette({ 
        nom: '', 
        compte: comptes[0]?.nom || '', 
        total: '', 
        restant: '', 
        duree: '', 
        taux: '', 
        type: 'credit_bancaire' 
      });
    }
  };

  const mensualiteCalculee = newDette.restant && newDette.duree && newDette.taux 
    ? calculerMensualite(parseFloat(newDette.restant), parseFloat(newDette.taux), parseFloat(newDette.duree))
    : 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold mb-4">Ajouter un crédit ou une dette</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <input
            type="text"
            placeholder="Nom"
            value={newDette.nom}
            onChange={e => setNewDette({ ...newDette, nom: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <select
            value={newDette.type}
            onChange={e => setNewDette({ ...newDette, type: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="credit_bancaire">🏦 Crédit bancaire</option>
            <option value="dette_personnelle">👤 Dette personnelle</option>
          </select>
          <select
            value={newDette.compte}
            onChange={e => setNewDette({ ...newDette, compte: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="">Compte</option>
            {comptes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Total (€)"
            value={newDette.total}
            onChange={e => setNewDette({ ...newDette, total: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Restant (€)"
            value={newDette.restant}
            onChange={e => setNewDette({ ...newDette, restant: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Durée (mois)"
            value={newDette.duree}
            onChange={e => setNewDette({ ...newDette, duree: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Taux (%)"
            value={newDette.taux}
            onChange={e => setNewDette({ ...newDette, taux: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
        {mensualiteCalculee > 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm text-green-800 font-medium">
            ✓ Mensualité calculée : {mensualiteCalculee.toFixed(2)} €/mois
          </div>
        )}
        <button 
          type="submit"
          className="mt-4 w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter
        </button>
      </form>
    </div>
  );
};