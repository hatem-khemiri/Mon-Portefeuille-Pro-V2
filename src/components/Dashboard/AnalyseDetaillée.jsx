export const AnalyseDetaillée = ({ stats, budgetPrevisionnel }) => {
  const moisActuel = new Date().getMonth();

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-6">Analyse détaillée</h3>
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-blue-800">
              📅 Solde début {stats.dateDebut ? 'période' : 'mois'}
            </span>
            <span className="text-xl font-bold text-blue-600">
              {stats.soldeDebut.toFixed(2)} €
            </span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">+ Revenus réalisés</span>
            <span className="text-sm font-bold text-green-600">
              +{stats.revenusPeriode.toFixed(2)} €
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-inner" 
              style={{
                width: `${Math.min((stats.revenusPeriode / (budgetPrevisionnel.revenus[moisActuel] || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            Prévu: {budgetPrevisionnel.revenus[moisActuel].toFixed(2)} €
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">- Dépenses réalisées</span>
            <span className="text-sm font-bold text-red-600">
              -{stats.depensesPeriode.toFixed(2)} €
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full shadow-inner" 
              style={{
                width: `${Math.min((stats.depensesPeriode / ((budgetPrevisionnel.depenses[moisActuel] + budgetPrevisionnel.factures[moisActuel]) || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            Prévu: {(budgetPrevisionnel.depenses[moisActuel] + budgetPrevisionnel.factures[moisActuel]).toFixed(2)} €
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">- Épargnes réalisées</span>
            <span className="text-sm font-bold text-purple-600">
              -{stats.epargnesPeriode.toFixed(2)} €
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full shadow-inner" 
              style={{
                width: `${Math.min((stats.epargnesPeriode / (budgetPrevisionnel.epargnes[moisActuel] || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            Prévu: {budgetPrevisionnel.epargnes[moisActuel].toFixed(2)} €
          </p>
        </div>
        
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-800">= Solde actuel</span>
            <span className="text-2xl font-bold text-blue-600">
              {stats.soldeActuel.toFixed(2)} €
            </span>
          </div>
        </div>
        
        {(stats.revenusAVenir > 0 || stats.depensesAVenir > 0) && (
          <>
            <div className="bg-yellow-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-yellow-800 mb-2">Transactions à venir :</p>
              {stats.revenusAVenir > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">+ Revenus à venir</span>
                  <span className="font-semibold text-green-600">
                    +{stats.revenusAVenir.toFixed(2)} €
                  </span>
                </div>
              )}
              {stats.depensesAVenir > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">- Dépenses à venir</span>
                  <span className="font-semibold text-red-600">
                    -{stats.depensesAVenir.toFixed(2)} €
                  </span>
                </div>
              )}
              {stats.epargnesAVenir > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">- Épargnes à venir</span>
                  <span className="font-semibold text-purple-600">
                    -{stats.epargnesAVenir.toFixed(2)} €
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-800">= Solde prévu fin période</span>
                <span className={`text-2xl font-bold ${stats.soldePrevisionnel >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {stats.soldePrevisionnel.toFixed(2)} €
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};