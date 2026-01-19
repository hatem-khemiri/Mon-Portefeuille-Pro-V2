import { useFinance } from '../contexts/FinanceContext';
import { isCategorieSortie } from '../utils/calculations';

export const useChargesFixes = () => {
  const { 
    chargesFixes, 
    setChargesFixes,
    transactions,
    setTransactions,
    comptes,
    categoriesDepenses,
    categoriesEpargnes,
    dateCreationCompte
  } = useFinance();

  const addChargeFixe = (newCharge) => {
    if (!newCharge.nom || !newCharge.montant || !newCharge.categorie || !newCharge.compte) {
      alert('Veuillez remplir tous les champs, y compris la catégorie');
      return false;
    }

    let montant = Math.abs(parseFloat(newCharge.montant));
    if (isCategorieSortie(newCharge.categorie, categoriesDepenses, categoriesEpargnes)) {
      montant = -montant;
    }
    
    const charge = { 
      ...newCharge, 
      id: Date.now(), 
      montant: montant,
      jourMois: parseInt(newCharge.jourMois),
      type: 'normale'
    };
    
    setChargesFixes([...chargesFixes, charge]);
    
    // Générer les transactions automatiquement
    setTimeout(() => {
      genererTransactionsChargesFixes([charge]);
    }, 100);
    
    return true;
  };

  const addTransfertFixe = (newTransfert) => {
    if (!newTransfert.nom || !newTransfert.montant || !newTransfert.compteSource || !newTransfert.compteDestination) {
      alert('Veuillez remplir tous les champs !');
      return false;
    }

    const montant = Math.abs(parseFloat(newTransfert.montant));
    
    const charge = {
      id: Date.now(),
      nom: newTransfert.nom,
      montant: montant,
      categorie: 'Transfert',
      frequence: newTransfert.frequence,
      jourMois: parseInt(newTransfert.jourMois),
      compte: newTransfert.compteSource,
      type: 'transfert',
      compteDestination: newTransfert.compteDestination
    };
    
    setChargesFixes([...chargesFixes, charge]);
    
    // Générer les transactions automatiquement
    setTimeout(() => {
      genererTransactionsChargesFixes([charge]);
    }, 100);
    
    return true;
  };

  const deleteChargeFixe = (id) => {
    // Supprimer les transactions liées
    setTransactions(transactions.filter(t => t.chargeFixeId !== id));
    // Supprimer la charge fixe
    setChargesFixes(chargesFixes.filter(cf => cf.id !== id));
  };

  const updateChargeFixe = (id, updatedData) => {
  // Trouver la charge à modifier
  const chargeModifiee = chargesFixes.find(cf => cf.id === id);
  if (!chargeModifiee) return;
  
  // Créer la nouvelle charge avec les modifications
  const nouvelleCharge = { ...chargeModifiee, ...updatedData };
  
  // Mettre à jour la liste des charges fixes
  setChargesFixes(chargesFixes.map(cf => cf.id === id ? nouvelleCharge : cf));
  
  // Supprimer TOUTES les anciennes transactions de cette charge
  const transactionsAGarder = transactions.filter(t => t.chargeFixeId !== id);
  setTransactions(transactionsAGarder);
  
  // Régénérer les transactions avec les nouvelles valeurs
  setTimeout(() => {
    // Calculer les nouvelles transactions
    const aujourdHui = new Date();
    const anneeActuelle = aujourdHui.getFullYear();
    const nouvellesTransactions = [];
    
    let moisDebut = 0;
    const dateCreationUtilisee = dateCreationCompte;
    
    if (dateCreationUtilisee) {
      const dateCreationObj = new Date(dateCreationUtilisee);
      const anneeCreation = dateCreationObj.getFullYear();
      const moisCreation = dateCreationObj.getMonth();
  
      if (anneeActuelle === anneeCreation) {
        // ✅ CORRECTION : Vérifier si la transaction du mois en cours est déjà passée
        const dateTransactionMoisActuel = new Date(anneeActuelle, moisCreation, nouvelleCharge.jourMois, 12, 0, 0);
    
        // Si la transaction du mois en cours n'est pas encore passée, commencer ce mois-ci
        if (dateTransactionMoisActuel >= aujourdHui) {
          moisDebut = moisCreation;
        } else {
        // Sinon, commencer au mois suivant
        moisDebut = moisCreation + 1;
      }
    }
  }
    
    const moisFin = 12;
    
    for (let mois = moisDebut; mois < moisFin; mois++) {
      const dateTransaction = new Date(anneeActuelle, mois, nouvelleCharge.jourMois, 12, 0, 0);
      
      if (dateTransaction.getFullYear() !== anneeActuelle) continue;
      
      if (dateCreationUtilisee) {
        const dateCreation = new Date(dateCreationUtilisee);
        if (dateTransaction < dateCreation) continue;
      }
      
      const statut = dateTransaction < aujourdHui ? 'realisee' : 'a_venir';
      
      let inclureTransaction = true;
      if (nouvelleCharge.frequence === 'trimestrielle' && mois % 3 !== 0) {
        inclureTransaction = false;
      }
      if (nouvelleCharge.frequence === 'annuelle' && mois !== 0) {
        inclureTransaction = false;
      }
      
      if (inclureTransaction) {
        if (nouvelleCharge.type === 'transfert') {
          const transfertId = Date.now() + Math.random();
          const montant = Math.abs(nouvelleCharge.montant);
          
          nouvellesTransactions.push({
            id: transfertId,
            date: dateTransaction.toISOString().split('T')[0],
            description: `${nouvelleCharge.nom} (vers ${nouvelleCharge.compteDestination})`,
            montant: -montant,
            categorie: 'Transfert',
            compte: nouvelleCharge.compte,
            statut: statut,
            type: 'transfert',
            transfertLieId: transfertId + 0.1,
            isFromChargeFixe: true,
            chargeFixeId: nouvelleCharge.id
          });
          
          nouvellesTransactions.push({
            id: transfertId + 0.1,
            date: dateTransaction.toISOString().split('T')[0],
            description: `${nouvelleCharge.nom} (depuis ${nouvelleCharge.compte})`,
            montant: montant,
            categorie: 'Transfert',
            compte: nouvelleCharge.compteDestination,
            statut: statut,
            type: 'transfert',
            transfertLieId: transfertId,
            isFromChargeFixe: true,
            chargeFixeId: nouvelleCharge.id
          });
        } else {
          nouvellesTransactions.push({
            id: Date.now() + Math.random(),
            date: dateTransaction.toISOString().split('T')[0],
            description: nouvelleCharge.nom,
            montant: nouvelleCharge.montant,
            categorie: nouvelleCharge.categorie,
            compte: nouvelleCharge.compte,
            statut: statut,
            isFromChargeFixe: true,
            chargeFixeId: nouvelleCharge.id,
            type: 'normale'
          });
        }
      }
    }
    
    // Ajouter les nouvelles transactions
    setTransactions([...transactionsAGarder, ...nouvellesTransactions]);
  }, 200);
};

  const genererTransactionsChargesFixes = (charges = chargesFixes, dateCreationForcee = null) => {
    const aujourdHui = new Date();
    const anneeActuelle = aujourdHui.getFullYear();
    const nouvellesTransactions = [];
    
    // Toujours générer pour toute l'année
    let moisDebut = 0;
  
  const dateCreationUtilisee = dateCreationForcee || dateCreationCompte;

  if (dateCreationUtilisee) {
  const dateCreationObj = new Date(dateCreationUtilisee);
  const anneeCreation = dateCreationObj.getFullYear();
  const moisCreation = dateCreationObj.getMonth();
  
  if (anneeActuelle === anneeCreation) {
    // ✅ Pour chaque charge, vérifier si elle est déjà passée ce mois-ci
    // On va commencer au mois actuel par défaut
    moisDebut = moisCreation;
  }
}
    const moisFin = 12;

      charges.forEach(charge => {
        for (let mois = moisDebut; mois < moisFin; mois++) {
        const dateTransaction = new Date(anneeActuelle, mois, charge.jourMois, 12, 0, 0);
        
        if (dateTransaction.getFullYear() !== anneeActuelle) continue;
        
        // Ignorer les transactions avant la date de création du compte
if (dateCreationUtilisee) {
  const dateCreation = new Date(dateCreationUtilisee);
  const aujourdHuiMinuit = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
  
  // Si la transaction est avant la création OU si elle est dans le passé (déjà passée)
  if (dateTransaction < dateCreation) continue;
  if (dateTransaction < aujourdHuiMinuit && new Date(dateTransaction).getMonth() === new Date(dateCreation).getMonth()) {
    // Si c'est le mois de création ET que la date de transaction est déjà passée, skip
    continue;
  }
}

        // Vérifier si cette transaction existe déjà
        const existeDeja = transactions.some(t => {
          const memeCharge = t.chargeFixeId === charge.id;
          const memeMois = new Date(t.date).getMonth() === dateTransaction.getMonth();
          const memeAnnee = new Date(t.date).getFullYear() === dateTransaction.getFullYear();
          return memeCharge && memeMois && memeAnnee;
        });
        
        if (existeDeja) continue;
        
        const statut = dateTransaction < aujourdHui ? 'realisee' : 'a_venir';
        
        let inclureTransaction = true;
        if (charge.frequence === 'trimestrielle' && mois % 3 !== 0) {
          inclureTransaction = false;
        }
        if (charge.frequence === 'annuelle' && mois !== 0) {
          inclureTransaction = false;
        }
        
        if (inclureTransaction) {
          if (charge.type === 'transfert') {
            const transfertId = Date.now() + Math.random();
            const montant = Math.abs(charge.montant);
            
            nouvellesTransactions.push({
              id: transfertId,
              date: dateTransaction.toISOString().split('T')[0],
              description: `${charge.nom} (vers ${charge.compteDestination})`,
              montant: -montant,
              categorie: 'Transfert',
              compte: charge.compte,
              statut: statut,
              type: 'transfert',
              transfertLieId: transfertId + 0.1,
              isFromChargeFixe: true,
              chargeFixeId: charge.id
            });
            
            nouvellesTransactions.push({
              id: transfertId + 0.1,
              date: dateTransaction.toISOString().split('T')[0],
              description: `${charge.nom} (depuis ${charge.compte})`,
              montant: montant,
              categorie: 'Transfert',
              compte: charge.compteDestination,
              statut: statut,
              type: 'transfert',
              transfertLieId: transfertId,
              isFromChargeFixe: true,
              chargeFixeId: charge.id
            });
          } else {
            nouvellesTransactions.push({
              id: Date.now() + Math.random(),
              date: dateTransaction.toISOString().split('T')[0],
              description: charge.nom,
              montant: charge.montant,
              categorie: charge.categorie,
              compte: charge.compte,
              statut: statut,
              isFromChargeFixe: true,
              chargeFixeId: charge.id,
              type: 'normale'
            });
          }
        }
      }
    });
    
    if (nouvellesTransactions.length > 0) {
      setTransactions([...transactions, ...nouvellesTransactions]);
    }
    
    return nouvellesTransactions.length;
  };

  return {
    chargesFixes,
    addChargeFixe,
    addTransfertFixe,
    deleteChargeFixe,
    updateChargeFixe,
    genererTransactionsChargesFixes
  };
};