import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionItem } from './TransactionItem';

export const TransactionList = ({ onDeleteTransaction }) => {
  const { transactions, categoriesDepenses, categoriesRevenus, categoriesEpargnes } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');

  const transactionsFiltrees = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       t.categorie?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = filterCategorie === 'all' || t.categorie === filterCategorie;
    return matchSearch && matchCategorie;
  });

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold mb-4">Recherche et filtres</h3>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filterCategorie}
            onChange={e => setFilterCategorie(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Toutes catégories</option>
            {[...categoriesDepenses, ...categoriesRevenus, ...categoriesEpargnes].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Catégorie</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Compte</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Montant</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Statut</th>
                <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactionsFiltrees
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction, idx) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction}
                    onDelete={onDeleteTransaction}
                  />
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};