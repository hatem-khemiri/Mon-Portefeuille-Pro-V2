import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionForm = () => {
  const { comptes, categoriesDepenses, categoriesRevenus } = useFinance();
  const { addTransaction } = useTransactions();
  
  const [newTransaction, setNewTransaction] = useState({ 
    date: '', 
    description: '', 
    montant: '', 
    categorie: categoriesDepenses[0] || '', 
    compte: comptes[0]?.nom || '', 
    statut: 'realisee', 
    type: 'normale' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addTransaction(newTransaction)) {
      setNewTransaction({ 
        date: '', 
        description: '', 
        montant: '', 
        categorie: categoriesDepenses[0] || '', 
        compte: comptes[0]?.nom || '', 
        statut: 'realisee', 
        type: 'normale' 
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold mb-4">Ajouter une transaction normale</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="date"
            value={newTransaction.date}
            onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Montant (€)"
            value={newTransaction.montant}
            onChange={e => setNewTransaction({...newTransaction, montant: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            step="0.01"
            min="0"
          />
          <select
            value={newTransaction.categorie}
            onChange={e => setNewTransaction({...newTransaction, categorie: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <optgroup label="Dépenses">
              {categoriesDepenses.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </optgroup>
            <optgroup label="Revenus">
              {categoriesRevenus.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </optgroup>
          </select>
          <select
            value={newTransaction.compte}
            onChange={e => setNewTransaction({...newTransaction, compte: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            {comptes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
          <select
            value={newTransaction.statut}
            onChange={e => setNewTransaction({...newTransaction, statut: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="realisee">Réalisée</option>
            <option value="a_venir">À venir</option>
          </select>
        </div>
        <button 
          type="submit"
          className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter la transaction
        </button>
      </form>
    </div>
  );
};