import { useFinance } from '../contexts/FinanceContext';
import { calculerMensualiteSuggere } from '../utils/calculations';

export const useEpargnes = () => {
  const { epargnes, setEpargnes, comptes } = useFinance();

  const calculerSoldeObjectif = (epargne) => {
    return epargne.comptesAssocies.reduce((total, compteNom) => {
      const compte = comptes.find(c => c.nom === compteNom);
      return total + (compte ? compte.solde : 0);
    }, 0);
  };

  const addEpargne = (newEpargne) => {
    if (!newEpargne.nom || !newEpargne.objectif || !newEpargne.categorie || newEpargne.comptesAssocies.length === 0) {
      return false;
    }

    setEpargnes([...epargnes, { 
      ...newEpargne, 
      id: Date.now(), 
      objectif: parseFloat(newEpargne.objectif)
    }]);
    return true;
  };

  const deleteEpargne = (id) => {
    setEpargnes(epargnes.filter(e => e.id !== id));
  };

  const updateEpargne = (id, updatedData) => {
    setEpargnes(epargnes.map(e => 
      e.id === id ? { ...e, ...updatedData } : e
    ));
  };

  const getMensualiteSuggeree = (epargne) => {
    const soldeActuel = calculerSoldeObjectif(epargne);
    return calculerMensualiteSuggere(soldeActuel, epargne.objectif);
  };

  const getProgression = (epargne) => {
    const soldeActuel = calculerSoldeObjectif(epargne);
    return (soldeActuel / epargne.objectif) * 100;
  };

  const getMoisRestants = () => {
    const aujourdHui = new Date();
    const finAnnee = new Date(aujourdHui.getFullYear(), 11, 31);
    return Math.max(1, Math.ceil((finAnnee - aujourdHui) / (1000 * 60 * 60 * 24 * 30)));
  };

  return {
    epargnes,
    addEpargne,
    deleteEpargne,
    updateEpargne,
    calculerSoldeObjectif,
    getMensualiteSuggeree,
    getProgression,
    getMoisRestants
  };
};