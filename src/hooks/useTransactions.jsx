import { useFinance } from '../contexts/FinanceContext';
import { isCategorieSortie } from '../utils/calculations';

export const useTransactions = () => {
  const { 
    transactions, 
    setTransactions,
    categoriesDepenses,
    categoriesEpargnes,
    comptes
  } = useFinance();

  const addTransaction = (newTransaction) => {
    if (!newTransaction.date || !newTransaction.description || !newTransaction.montant) {
      alert('Veuillez remplir au moins la date, la description et le montant !');
      return false;
    }

    let montant = Math.abs(parseFloat(newTransaction.montant));
    let categorie = newTransaction.categorie;
    
    if (!categorie) {
      categorie = categoriesDepenses[0] || 'Autres dépenses';
    }
    
    if (isCategorieSortie(categorie, categoriesDepenses, categoriesEpargnes)) {
      montant = -montant;
    }
    
    const transaction = { 
      ...newTransaction, 
      id: Date.now(), 
      montant: montant,
      isFromChargeFixe: false,
      type: 'normale',
      categorie: categorie
    };
    
    setTransactions([...transactions, transaction]);
    return true;
  };

  const addTransfert = (newTransfert) => {
    if (!newTransfert.date || !newTransfert.description || !newTransfert.montant || 
        !newTransfert.compteSource || !newTransfert.compteDestination) {
      alert('Veuillez remplir tous les champs !');
      return false;
    }

    const montant = Math.abs(parseFloat(newTransfert.montant));
    const transfertId = Date.now();
    
    const transactionSortie = {
      id: transfertId,
      date: newTransfert.date,
      description: `${newTransfert.description} (vers ${newTransfert.compteDestination})`,
      montant: -montant,
      categorie: 'Transfert',
      compte: newTransfert.compteSource,
      statut: newTransfert.statut,
      type: 'transfert',
      transfertLieId: transfertId + 1,
      isFromChargeFixe: false
    };
    
    const transactionEntree = {
      id: transfertId + 1,
      date: newTransfert.date,
      description: `${newTransfert.description} (depuis ${newTransfert.compteSource})`,
      montant: montant,
      categorie: 'Transfert',
      compte: newTransfert.compteDestination,
      statut: newTransfert.statut,
      type: 'transfert',
      transfertLieId: transfertId,
      isFromChargeFixe: false
    };
    
    setTransactions([...transactions, transactionSortie, transactionEntree]);
    return true;
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updatedData };
        
        if (updatedData.categorie && updatedData.categorie !== t.categorie) {
          let montant = Math.abs(updated.montant);
          if (isCategorieSortie(updatedData.categorie, categoriesDepenses, categoriesEpargnes)) {
            montant = -montant;
          } else {
            montant = Math.abs(montant);
          }
          updated.montant = montant;
        }
        return updated;
      }
      return t;
    }));
  };

  const deleteTransaction = (id) => {
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction && transaction.type === 'transfert' && transaction.transfertLieId) {
      setTransactions(transactions.filter(t => t.id !== id && t.id !== transaction.transfertLieId));
    } else {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return {
    transactions,
    addTransaction,
    addTransfert,
    updateTransaction,
    deleteTransaction
  };
};