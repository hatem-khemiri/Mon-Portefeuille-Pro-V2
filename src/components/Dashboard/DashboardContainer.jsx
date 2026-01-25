import { useState, useMemo } from 'react';
import { CreditCard, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useStatistiques } from '../../hooks/useStatistiques';
import { StatCard } from './StatCard';
import { DepensesChart } from './DepensesChart';
import { AnalyseDetaillée } from './AnalyseDetaillée';

export const DashboardContainer = () => {
  const { 
    comptes, 
    transactions, 
    epargnes, 
    dettes, 
    budgetPrevisionnel,
    categoriesDepenses,
    categoriesEpargnes 
  } = useFinance();
  
  const [vueTableauBord, setVueTableauBord] = useState('mensuel');
  const [compteSelectionne, setCompteSelectionne] = useState(null);
  
  const stats = useStatistiques(transactions, comptes, vueTableauBord, compteSelectionne);
  
  const totalEpargnes = useMemo(() => {
    return epargnes.reduce((total, e) => {
      return total + e.comptesAssocies.reduce((sum, compteNom) => {
        const compte = comptes.find(c => c.nom === compteNom);
        return sum + (compte ? compte.solde : 0);
      }, 0);
    }, 0);
  }, [epargnes, comptes]);
  
  const totalDettes = useMemo(() => 
    dettes.reduce((acc, d) => acc + d.restant, 0), 
    [dettes]
  );
  
  // Dépenses incluant "à venir" (pour vue prospective)
  const depensesParCategorie = useMemo(() => {
    const grouped = {};
    transactions
      .filter(t => 
        t.montant < 0 && 
        t.type !== 'transfert' &&
        (t.statut === 'realisee' || t.statut === 'avenir')
      )
      .forEach(t => {
        grouped[t.categorie] = (grouped[t.categorie] || 0) + Math.abs(t.montant);
      });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // ✅ AJOUT : Dépenses réalisées uniquement (pour vue historique)
  const depensesRealisees = useMemo(() => {
    const grouped = {};
    transactions
      .filter(t => 
        t.montant < 0 && 
        t.type !== 'transfert' &&
        t.statut === 'realisee'
      )
      .forEach(t => {
        grouped[t.categorie] = (grouped[t.categorie] || 0) + Math.abs(t.montant);
      });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tableau de Bord
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setVueTableauBord('mensuel')}
            className={`px-6 py-3 rounded-xl transition-all font-bold shadow-lg transform hover:scale-105 ${
              vueTableauBord === 'mensuel'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
            }`}
          >
            📅 Vue Mensuelle
          </button>
          <button
            onClick={() => setVueTableauBord('annuel')}
            className={`px-6 py-3 rounded-xl transition-all font-bold shadow-lg transform hover:scale-105 ${
              vueTableauBord === 'annuel'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
            }`}
          >
            📊 Vue Annuelle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          couleur="from-blue-500 to-blue-600"
          icon={CreditCard}
        >
          <p className="text-blue-100 text-sm font-medium mb-2">Compte visualisé</p>
          <select
            value={compteSelectionne || (stats.compteCourant?.nom || '')}
            onChange={(e) => setCompteSelectionne(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border-2 border-white/30 focus:border-white focus:outline-none font-medium text-sm appearance-none cursor-pointer hover:bg-white/30 transition-all mb-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            {comptes.map(c => (
              <option key={c.id} value={c.nom} className="text-gray-800 bg-white">
                {c.nom} ({c.type === 'courant' ? 'Courant' : c.type === 'epargne' ? 'Épargne' : 'Espèces'})
              </option>
            ))}
          </select>
          <p className="text-3xl font-bold">{stats.soldeActuel.toFixed(2)} €</p>
          <p className="text-blue-100 text-xs mt-1">Solde actuel</p>
          <div className="border-t border-blue-400 pt-3 mt-3 space-y-1">
            <div className="flex justify-between items-center text-sm">
              <p className="text-blue-100">Solde début {vueTableauBord === 'mensuel' ? 'mois' : 'année'}</p>
              <p className="font-semibold">{stats.soldeDebut.toFixed(2)} €</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-blue-100">Prévu fin {vueTableauBord === 'mensuel' ? 'mois' : 'année'}</p>
              <p className={`font-bold ${stats.soldePrevisionnel >= stats.soldeDebut ? 'text-white' : 'text-red-200'}`}>
                {stats.soldePrevisionnel.toFixed(2)} €
              </p>
            </div>
          </div>
        </StatCard>
        
        <StatCard
          titre={`Revenus ${vueTableauBord === 'mensuel' ? 'du mois' : 'de l\'année'}`}
          valeur={`${stats.revenusPeriode.toFixed(2)} €`}
          couleur="from-green-500 to-emerald-600"
          icon={TrendingUp}
          details={stats.revenusAVenir > 0 ? [
            { label: 'À venir', value: `${stats.revenusAVenir.toFixed(2)} €` }
          ] : null}
        />
        
        <StatCard
          titre={`Dépenses ${vueTableauBord === 'mensuel' ? 'du mois' : 'de l\'année'}`}
          valeur={`${stats.depensesPeriode.toFixed(2)} €`}
          couleur="from-red-500 to-pink-600"
          icon={TrendingDown}
          details={stats.depensesAVenir > 0 ? [
            { label: 'À venir', value: `${stats.depensesAVenir.toFixed(2)} €` }
          ] : null}
        />
        
        <StatCard
          titre={`Épargnes ${vueTableauBord === 'mensuel' ? 'du mois' : 'de l\'année'}`}
          valeur={`${stats.epargnesPeriode.toFixed(2)} €`}
          couleur="from-purple-500 to-purple-600"
          icon={PiggyBank}
          details={stats.epargnesAVenir > 0 ? [
            { label: 'À venir', value: `${stats.epargnesAVenir.toFixed(2)} €` }
          ] : null}
        />
        
        <StatCard
          titre="Solde de la période"
          valeur={`${(stats.revenusPeriode - stats.depensesPeriode - stats.epargnesPeriode).toFixed(2)} €`}
          couleur="from-indigo-500 to-indigo-600"
          icon={TrendingUp}
          details={(stats.revenusAVenir > 0 || stats.depensesAVenir > 0 || stats.epargnesAVenir > 0) ? [
            { label: 'À venir', value: `${stats.soldeAVenir.toFixed(2)} €` }
          ] : null}
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-2">Période analysée</p>
            <p className="text-xl font-bold text-blue-600">
              {vueTableauBord === 'mensuel' 
                ? `${stats.dateDebut?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} - ${stats.dateFinPrevue?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}`
                : `01 janvier - 31 décembre ${new Date().getFullYear()}`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Épargnes totales</p>
            <p className="text-xl font-bold text-green-600">{totalEpargnes.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Dettes restantes</p>
            <p className="text-xl font-bold text-red-600">{totalDettes.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ✅ MODIFICATION : Passage des deux props */}
        <DepensesChart 
          depensesParCategorie={depensesParCategorie}
          depensesRealisees={depensesRealisees}
        />
        <AnalyseDetaillée stats={stats} budgetPrevisionnel={budgetPrevisionnel} />
      </div>
    </div>
  );
};