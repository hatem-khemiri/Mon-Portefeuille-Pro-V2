import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionItem = ({ transaction, onDelete }) => {
  const { comptes, categoriesDepenses, categoriesRevenus, categoriesEpargnes } = useFinance();
  const { updateTransaction } = useTransactions();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (field, value) => {
    updateTransaction(transaction.id, { [field]: value });
  };

  // ✅ CORRECTION : Vérifier les deux formats de statut
  const isAVenir = transaction.statut === 'a_venir' || transaction.statut === 'avenir';
  const isRealisee = transaction.statut === 'realisee';

  return (
    <tr className={`hover:bg-blue-50/50 transition-colors ${isAVenir ? 'opacity-60' : ''}`}>
      <td className="px-6 py-4 text-sm font-medium">
        {isEditing ? (
          <input
            type="date"
            defaultValue={transaction.date}
            onChange={(e) => handleUpdate('date', e.target.value)}
            className="px-2 py-1 border-2 border-blue-500 rounded-lg text-sm"
          />
        ) : (
          new Date(transaction.date + 'T12:00:00').toLocaleDateString('fr-FR')
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        {isEditing ? (
          <input
            type="text"
            defaultValue={transaction.description}
            onBlur={(e) => handleUpdate('description', e.target.value)}
            className="w-full px-2 py-1 border-2 border-blue-500 rounded-lg text-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            {transaction.isSynced && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800" title="Transaction synchronisée depuis votre banque">
                🏦
              </span>
            )}
            {transaction.isFromChargeFixe && <span title="Issue d'une charge fixe">📌</span>}
            {transaction.type === 'transfert' && <span title="Transfert entre comptes">🔄</span>}
            {transaction.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        {isEditing ? (
          <select
            value={transaction.categorie || ''}
            onChange={(e) => handleUpdate('categorie', e.target.value)}
            className="px-2 py-1 border-2 border-blue-500 rounded-lg text-sm"
          >
            <option value="">Sélectionner une catégorie</option>
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
            <optgroup label="Épargnes">
              {categoriesEpargnes.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </optgroup>
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            transaction.categorie ? 'bg-gray-200' : 'bg-red-100 text-red-600'
          }`}>
            {transaction.categorie || '⚠️ Non catégorisé'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        {isEditing ? (
          <select
            defaultValue={transaction.compte}
            onChange={(e) => handleUpdate('compte', e.target.value)}
            className="px-2 py-1 border-2 border-blue-500 rounded-lg text-sm"
          >
            {comptes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
        ) : (
          transaction.compte
        )}
      </td>
      <td className={`px-6 py-4 text-sm text-right font-bold ${transaction.montant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {isEditing ? (
          <input
            type="number"
            defaultValue={Math.abs(transaction.montant)}
            onBlur={(e) => {
              let montant = parseFloat(e.target.value) || 0;
              if (transaction.montant < 0) {
                montant = -Math.abs(montant);
              } else {
                montant = Math.abs(montant);
              }
              handleUpdate('montant', montant);
            }}
            className="w-24 px-2 py-1 border-2 border-blue-500 rounded-lg text-sm text-right"
            step="0.01"
          />
        ) : (
          <>{transaction.montant >= 0 ? '+' : ''}{transaction.montant.toFixed(2)} €</>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-center">
        {isEditing ? (
          <select
            value={isAVenir ? 'a_venir' : 'realisee'}
            onChange={(e) => handleUpdate('statut', e.target.value)}
            className="px-2 py-1 border-2 border-blue-500 rounded-lg text-sm"
          >
            <option value="realisee">Réalisée</option>
            <option value="a_venir">À venir</option>
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isRealisee ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isRealisee ? '✓ Réalisée' : '⏱ À venir'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            title={isEditing ? 'Terminer' : 'Modifier'}
          >
            {isEditing ? <Check size={18} /> : '✏️'}
          </button>
          <button 
            onClick={() => onDelete(transaction)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};