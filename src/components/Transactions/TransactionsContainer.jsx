import { useState } from 'react';
import { TransactionForm } from './TransactionForm';
import { TransfertForm } from './TransfertForm';
import { TransactionList } from './TransactionList';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionsContainer = () => {
  const { deleteTransaction } = useTransactions();
  const [activeTab, setActiveTab] = useState('transaction');
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const handleDelete = (transaction) => {
    setDeletingTransaction(transaction);
  };

  const confirmDelete = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  return (
    <div className="space-y-6">
      {deletingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🗑️ Supprimer la transaction</h3>
            {deletingTransaction.isFromChargeFixe ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ Cette transaction provient d'une <strong>charge fixe récurrente</strong>.
                  </p>
                  <p className="text-sm text-yellow-700">
                    La supprimer ne supprimera que cette occurrence. Les autres transactions de cette charge fixe resteront intactes.
                  </p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-800">
                    💡 Pour supprimer définitivement cette charge récurrente, allez dans <strong>Paramétrage → Transactions Récurrentes</strong>
                  </p>
                </div>
              </div>
            ) : deletingTransaction.isSynced ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    🏦 Cette transaction provient de votre <strong>synchronisation bancaire</strong>.
                  </p>
                  <p className="text-sm text-blue-700">
                    La supprimer ne la supprimera que localement. Elle réapparaîtra lors de la prochaine synchronisation.
                  </p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-xs text-yellow-800">
                    💡 Pour masquer définitivement des transactions bancaires, déconnectez votre banque dans <strong>Paramétrage → Synchronisation Bancaire</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">
                  Êtes-vous sûr de vouloir supprimer cette transaction ?
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingTransaction(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Transactions
        </h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          💡 Les transactions marquées 🏦 sont synchronisées depuis votre banque. Les transactions marquées 📌 proviennent de vos charges fixes. Les transactions marquées 🔄 sont des transferts entre vos comptes.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('transaction')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'transaction'
                ? 'border-b-4 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            💳 Transaction
          </button>
          <button
            onClick={() => setActiveTab('transfert')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'transfert'
                ? 'border-b-4 border-purple-500 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🔄 Transfert / Épargne
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'transaction' ? <TransactionForm /> : <TransfertForm />}
        </div>
      </div>

      <TransactionList onDeleteTransaction={handleDelete} />
    </div>
  );
};