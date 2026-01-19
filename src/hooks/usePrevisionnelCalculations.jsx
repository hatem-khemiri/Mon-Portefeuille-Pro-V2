import { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { MONTHS } from '../utils/constants';
import { isCategorieSortie } from '../utils/calculations';

export const usePrevisionnelCalculations = () => {
  const { 
    chargesFixes, 
    comptes,
    categoriesRevenus,
    categoriesDepenses,
    categoriesEpargnes,
    budgetPrevisionnel,
    dateCreationCompte  // ✅ AJOUT
  } = useFinance();

  const calculerPrevisionnelAutomatique = () => {
    const previsionnel = {
      revenus: Array(12).fill(0),
      epargnes: Array(12).fill(0),
      factures: Array(12).fill(0),
      depenses: Array(12).fill(0)
    };

    // ✅ CORRECTION : Déterminer le mois de début
    let moisDebut = 0;
    const aujourdHui = new Date();
    const anneeActuelle = aujourdHui.getFullYear();
    
    if (dateCreationCompte) {
      const dateCreation = new Date(dateCreationCompte);
      const anneeCreation = dateCreation.getFullYear();
      const moisCreation = dateCreation.getMonth();
      
      // Si on est dans l'année de création, commencer au mois de création
      if (anneeActuelle === anneeCreation) {
        moisDebut = moisCreation;
      }
    }

    chargesFixes.forEach(charge => {
      for (let mois = moisDebut; mois < 12; mois++) {  // ✅ MODIFIÉ
        let inclure = true;
        
        if (charge.frequence === 'trimestrielle' && mois % 3 !== 0) {
          inclure = false;
        }
        if (charge.frequence === 'annuelle' && mois !== 0) {
          inclure = false;
        }
        
        if (inclure) {
          const montant = Math.abs(charge.montant);
          
          if (charge.type === 'transfert') {
            const compteDestination = comptes.find(c => c.nom === charge.compteDestination);
            if (compteDestination && compteDestination.type === 'epargne') {
              previsionnel.epargnes[mois] += montant;
            }
          } else if (charge.montant > 0) {
            previsionnel.revenus[mois] += montant;
          } else {
            if (charge.categorie === 'Factures' || categoriesDepenses.includes(charge.categorie)) {
              if (charge.categorie === 'Factures') {
                previsionnel.factures[mois] += montant;
              } else {
                previsionnel.depenses[mois] += montant;
              }
            } else {
              previsionnel.depenses[mois] += montant;
            }
          }
        }
      }
    });

    return previsionnel;
  };

  // ✅ NOUVEAU : Calculer le mois de début pour l'affichage
  const moisDebutAffichage = useMemo(() => {
    if (!dateCreationCompte) return 0;
    
    const aujourdHui = new Date();
    const anneeActuelle = aujourdHui.getFullYear();
    const dateCreation = new Date(dateCreationCompte);
    const anneeCreation = dateCreation.getFullYear();
    const moisCreation = dateCreation.getMonth();
    
    // Si on est dans l'année de création, afficher depuis le mois de création
    if (anneeActuelle === anneeCreation) {
      return moisCreation;
    }
    
    return 0;
  }, [dateCreationCompte]);

  const previsionnelData = useMemo(() => {
    return MONTHS.map((month, idx) => {
      // ✅ CORRECTION : Marquer les mois hors période
      const horsPeriode = idx < moisDebutAffichage;
      
      let soldeCumule = 0;
      let epargnesCumulees = 0;
      
      // Ne calculer que depuis le mois de début
      for (let i = moisDebutAffichage; i <= idx; i++) {
        soldeCumule += budgetPrevisionnel.revenus[i] - 
                       budgetPrevisionnel.epargnes[i] - 
                       budgetPrevisionnel.factures[i] - 
                       budgetPrevisionnel.depenses[i];
        epargnesCumulees += budgetPrevisionnel.epargnes[i];
      }
      
      return {
        mois: month,
        moisIndex: idx,
        horsPeriode,  // ✅ NOUVEAU
        revenus: horsPeriode ? 0 : budgetPrevisionnel.revenus[idx],
        epargnes: horsPeriode ? 0 : budgetPrevisionnel.epargnes[idx],
        epargnesCumulees: horsPeriode ? 0 : epargnesCumulees,
        factures: horsPeriode ? 0 : budgetPrevisionnel.factures[idx],
        depenses: horsPeriode ? 0 : budgetPrevisionnel.depenses[idx],
        soldeMensuel: horsPeriode ? 0 : (
          budgetPrevisionnel.revenus[idx] - 
          budgetPrevisionnel.epargnes[idx] - 
          budgetPrevisionnel.factures[idx] - 
          budgetPrevisionnel.depenses[idx]
        ),
        solde: horsPeriode ? 0 : soldeCumule
      };
    });
  }, [budgetPrevisionnel, moisDebutAffichage]);

  return {
    calculerPrevisionnelAutomatique,
    previsionnelData,
    moisDebutAffichage  // ✅ NOUVEAU : Export pour utilisation dans les composants
  };
};