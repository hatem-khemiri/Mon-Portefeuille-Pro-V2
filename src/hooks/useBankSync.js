import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';

export const useBankSync = () => {
  const { transactions, setTransactions } = useFinance();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const connectBank = async (userId) => {
    try {
      const response = await fetch('/api/bridge/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error);
      }

      // Ouvrir Bridge Connect dans une popup
      window.location.href = data.connectUrl;

      return data;
    } catch (error) {
      setSyncError(error.message);
      throw error;
    }
  };

  const syncTransactions = async (itemId, userId) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch('/api/bridge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Fusionner les transactions bancaires avec les transactions manuelles
      const manualTransactions = transactions.filter(t => !t.isSynced);
      const allTransactions = [...manualTransactions, ...data.transactions];

      setTransactions(allTransactions);

      return {
        accounts: data.accounts,
        transactionsCount: data.transactions.length,
        syncDate: data.syncDate
      };

    } catch (error) {
      setSyncError(error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectBank = async (itemId) => {
    try {
      const response = await fetch('/api/bridge/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Supprimer les transactions synchronisées
      const manualTransactions = transactions.filter(t => !t.isSynced);
      setTransactions(manualTransactions);

      return data;
    } catch (error) {
      setSyncError(error.message);
      throw error;
    }
  };

  return {
    connectBank,
    syncTransactions,
    disconnectBank,
    isSyncing,
    syncError
  };
};