export const isCategorieSortie = (categorie, categoriesDepenses, categoriesEpargnes) => {
  return categoriesDepenses.includes(categorie) || categoriesEpargnes.includes(categorie);
};

export const calculerMensualite = (capital, tauxAnnuel, dureeMois) => {
  if (!capital || !tauxAnnuel || !dureeMois) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  if (tauxMensuel === 0) return capital / dureeMois;
  return capital * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) / 
         (Math.pow(1 + tauxMensuel, dureeMois) - 1);
};

export const calculerMensualiteSuggere = (soldeActuel, objectif) => {
  const aujourdHui = new Date();
  const finAnnee = new Date(aujourdHui.getFullYear(), 11, 31);
  const moisRestants = Math.max(1, Math.ceil((finAnnee - aujourdHui) / (1000 * 60 * 60 * 24 * 30)));
  const montantRestant = Math.max(0, objectif - soldeActuel);
  return montantRestant / moisRestants;
};