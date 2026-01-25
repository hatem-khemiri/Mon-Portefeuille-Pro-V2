import { useMemo } from 'react';

export const useStatistiques = (transactions, comptes, vueTableauBord, compteSelectionne) => {
  return useMemo(() => {
    const aujourdHui = new Date();
    const moisActuel = aujourdHui.getMonth();
    const anneeActuelle = aujourdHui.getFullYear();
    
    let dateDebut, dateFin, dateFinPrevue;
    
    if (vueTableauBord === 'mensuel') {
      dateDebut = new Date(anneeActuelle, moisActuel, 1);
      dateFin = aujourdHui;
      dateFinPrevue = new Date(anneeActuelle, moisActuel + 1, 0);
    } else {
      dateDebut = new Date(anneeActuelle, 0, 1);
      dateFin = aujourdHui;
      dateFinPrevue = new Date(anneeActuelle, 11, 31);
    }
    
    // Utiliser le compte sélectionné ou le premier compte courant par défaut
    const compteActuel = compteSelectionne 
      ? comptes.find(c => c.nom === compteSelectionne)
      : comptes.find(c => c.nom === 'Compte Courant' || c.type === 'courant');
    
    if (!compteActuel) {
      return {
        soldeDebut: 0,
        revenusPeriode: 0,
        depensesPeriode: 0,
        epargnesPeriode: 0,
        soldeActuel: 0,
        revenusAVenir: 0,
        depensesAVenir: 0,
        epargnesAVenir: 0,
        soldePrevisionnel: 0,
        soldeAVenir: 0,
        dateDebut,
        dateFinPrevue,
        compteCourant: null
      };
    }
    
    const soldeInitialCompte = compteActuel.soldeInitial !== undefined ? compteActuel.soldeInitial : 0;
    
    const toutesTransactionsRealisees = transactions.filter(t => 
      t.statut === 'realisee' && 
      t.compte === compteActuel.nom &&
      new Date(t.date).getFullYear() === anneeActuelle
    );
    
    const transactionsAvantPeriode = toutesTransactionsRealisees.filter(t => 
      new Date(t.date) < dateDebut
    );
    const mouvementsAvantPeriode = transactionsAvantPeriode.reduce((acc, t) => acc + t.montant, 0);
    const soldeDebut = soldeInitialCompte + mouvementsAvantPeriode;
    
    const transactionsPeriode = toutesTransactionsRealisees.filter(t => {
      const dateT = new Date(t.date);
      return dateT >= dateDebut && dateT <= dateFin;
    });
    
    // ✅ CORRECTION CRITIQUE : Accepter 'avenir' ET 'a_venir'
    const transactionsAVenir = transactions.filter(t => {
      const dateT = new Date(t.date);
      const dansLaPeriode = (t.statut === 'a_venir' || t.statut === 'avenir') && 
                            dateT >= dateDebut && 
                            dateT <= dateFinPrevue;
      
      return dansLaPeriode && (
        t.compte === compteActuel.nom || 
        (t.type === 'transfert' && t.montant > 0 && t.compte === compteActuel.nom)
      );
    });
    
    const revenusPeriode = transactionsPeriode.filter(t => 
      t.montant > 0
    ).reduce((acc, t) => acc + t.montant, 0);
    
    const depensesPeriode = Math.abs(transactionsPeriode.filter(t => 
      t.montant < 0
    ).reduce((acc, t) => acc + t.montant, 0));
    
    const epargnesPeriode = Math.abs(transactionsPeriode.filter(t => {
      const compte = comptes.find(c => c.nom === t.compte);
      return t.montant > 0 && compte && compte.type === 'epargne';
    }).reduce((acc, t) => acc + t.montant, 0));
    
    const totalMouvementsPeriode = transactionsPeriode.reduce((acc, t) => acc + t.montant, 0);
    const soldeActuel = soldeDebut + totalMouvementsPeriode;
    
    const revenusAVenir = transactionsAVenir.filter(t => 
      t.montant > 0
    ).reduce((acc, t) => acc + t.montant, 0);
    
    const depensesAVenir = Math.abs(transactionsAVenir.filter(t => 
      t.montant < 0
    ).reduce((acc, t) => acc + t.montant, 0));
    
    const epargnesAVenir = Math.abs(transactionsAVenir.filter(t => {
      const compte = comptes.find(c => c.nom === t.compte);
      return t.montant > 0 && compte && compte.type === 'epargne';
    }).reduce((acc, t) => acc + t.montant, 0));
    
    const soldeAVenir = transactionsAVenir.reduce((acc, t) => acc + t.montant, 0);
    
    const totalMouvementsAVenir = transactionsAVenir.reduce((acc, t) => acc + t.montant, 0);
    const soldePrevisionnel = soldeActuel + totalMouvementsAVenir;
    
    return {
      soldeDebut,
      revenusPeriode,
      depensesPeriode,
      epargnesPeriode,
      soldeActuel,
      revenusAVenir,
      depensesAVenir,
      epargnesAVenir,
      soldeAVenir,
      soldePrevisionnel,
      dateDebut,
      dateFinPrevue,
      compteCourant: compteActuel
    };
  }, [transactions, comptes, vueTableauBord, compteSelectionne]);
};