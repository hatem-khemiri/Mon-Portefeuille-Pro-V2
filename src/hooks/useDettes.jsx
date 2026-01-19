import { useFinance } from '../contexts/FinanceContext';
import { calculerMensualite } from '../utils/calculations';

export const useDettes = () => {
  const { dettes, setDettes } = useFinance();

  const addDette = (newDette) => {
    if (!newDette.nom || !newDette.compte || !newDette.total || !newDette.restant || !newDette.duree || !newDette.taux) {
      return false;
    }

    const mensualite = calculerMensualite(
      parseFloat(newDette.restant), 
      parseFloat(newDette.taux), 
      parseFloat(newDette.duree)
    );

    setDettes([...dettes, { 
      ...newDette, 
      id: Date.now(), 
      total: parseFloat(newDette.total),
      restant: parseFloat(newDette.restant),
      mensualite: mensualite,
      taux: parseFloat(newDette.taux),
      duree: parseFloat(newDette.duree),
      type: newDette.type || 'credit_bancaire'
    }]);
    return true;
  };

  const deleteDette = (id) => {
    setDettes(dettes.filter(d => d.id !== id));
  };

  const updateDette = (id, updatedData) => {
    setDettes(dettes.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...updatedData };
        if (updatedData.restant || updatedData.taux || updatedData.duree) {
          updated.mensualite = calculerMensualite(
            updated.restant,
            updated.taux,
            updated.duree
          );
        }
        return updated;
      }
      return d;
    }));
  };

  const getTotalDettes = () => {
    return dettes.reduce((acc, d) => acc + d.restant, 0);
  };

  const getMensualitesTotales = () => {
    return dettes.reduce((acc, d) => acc + d.mensualite, 0);
  };

  const getProgressionRemboursement = (dette) => {
    return ((dette.total - dette.restant) / dette.total) * 100;
  };

  return {
    dettes,
    addDette,
    deleteDette,
    updateDette,
    getTotalDettes,
    getMensualitesTotales,
    getProgressionRemboursement
  };
};