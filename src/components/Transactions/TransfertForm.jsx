import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTransactions } from '../../hooks/useTransactions';

export const TransfertForm = () => {
  const { comptes } = useFinance();
  const { addTransfert } = useTransactions();
  
  const [newTransfert, setNewTransfert] = useState({
    date: '', 
    description: '', 
    montant: '', 
    compteSource: comptes[0]?.nom || '', 
    compteDestination: '', 
    statut: 'realisee'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addTransfert(newTransfert)) {
      setNewTransfert({ 
        date: '', 
        description: '', 
        montant: '', 
        compteSource: comptes[0]?.nom || '', 
        compteDestination: '', 
        statut: 'realisee' 
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold mb-2">Ajouter un transfert ou épargne</h3>
      <p className="text-sm text-gray-600 mb-4">
        Les transferts ne sont pas comptés comme des dépenses. L'argent passe simplement d'un de vos comptes à un autre.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="date"
            value={newTransfert.date}
            onChange={e => setNewTransfert({...newTransfert, date: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTransfert.description}
            onChange={e => setNewTransfert({...newTransfert, description: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Montant (€)"
            value={newTransfert.montant}
            onChange={e => setNewTransfert({...newTransfert, montant: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            step="0.01"
            min="0"
          />
          <select
            value={newTransfert.compteSource}
            onChange={e => setNewTransfert({...newTransfert, compteSource: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Depuis...</option>
            {comptes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
          <select
            value={newTransfert.compteDestination}
            onChange={e => setNewTransfert({...newTransfert, compteDestination: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Vers...</option>
            {comptes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
          <select
            value={newTransfert.statut}
            onChange={e => setNewTransfert({...newTransfert, statut: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="realisee">Réalisée</option>
            <option value="a_venir">À venir</option>
          </select>
        </div>
        <button 
          type="submit"
          className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter le transfert
        </button>
      </form>
    </div>
  );
};