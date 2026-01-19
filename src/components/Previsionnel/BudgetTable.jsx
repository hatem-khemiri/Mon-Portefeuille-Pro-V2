import { MONTHS } from '../../utils/constants';

export const BudgetTable = ({ 
  budgetPrevisionnel, 
  previsionnelData, 
  editMode, 
  onEditChange,
  modeCalcul 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold">Mois</th>
              <th className="px-6 py-4 text-right text-sm font-bold">Revenus</th>
              <th className="px-6 py-4 text-right text-sm font-bold">Épargnes</th>
              <th className="px-6 py-4 text-right text-sm font-bold">Factures</th>
              <th className="px-6 py-4 text-right text-sm font-bold">Dépenses</th>
              <th className="px-6 py-4 text-right text-sm font-bold">Solde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {MONTHS.map((month, idx) => {
              // ✅ NOUVEAU : Vérifier si le mois est hors période
              const horsPeriode = previsionnelData[idx]?.horsPeriode || false;
              
              return (
                <tr 
                  key={idx} 
                  className={`transition-colors ${
                    horsPeriode 
                      ? 'bg-gray-100 opacity-50' 
                      : `hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-gray-50/50' : ''}`
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-bold">
                    {month}
                    {horsPeriode && (
                      <span className="ml-2 text-xs text-gray-500 italic">
                        (Hors période)
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm">
                    {horsPeriode ? (
                      <span className="text-gray-400">-</span>
                    ) : (editMode && modeCalcul !== 'automatique') ? (
                      <input
                        type="number"
                        value={budgetPrevisionnel.revenus[idx]}
                        onChange={e => {
                          const newRevenus = [...budgetPrevisionnel.revenus];
                          newRevenus[idx] = parseFloat(e.target.value) || 0;
                          onEditChange({ ...budgetPrevisionnel, revenus: newRevenus });
                        }}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-green-600 font-bold">
                        {budgetPrevisionnel.revenus[idx].toFixed(2)} €
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm">
                    {horsPeriode ? (
                      <span className="text-gray-400">-</span>
                    ) : (editMode && modeCalcul !== 'automatique') ? (
                      <input
                        type="number"
                        value={budgetPrevisionnel.epargnes[idx]}
                        onChange={e => {
                          const newEpargnes = [...budgetPrevisionnel.epargnes];
                          newEpargnes[idx] = parseFloat(e.target.value) || 0;
                          onEditChange({ ...budgetPrevisionnel, epargnes: newEpargnes });
                        }}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-purple-600 font-bold">
                        {previsionnelData[idx].epargnesCumulees.toFixed(2)} €
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm">
                    {horsPeriode ? (
                      <span className="text-gray-400">-</span>
                    ) : (editMode && modeCalcul !== 'automatique') ? (
                      <input
                        type="number"
                        value={budgetPrevisionnel.factures[idx]}
                        onChange={e => {
                          const newFactures = [...budgetPrevisionnel.factures];
                          newFactures[idx] = parseFloat(e.target.value) || 0;
                          onEditChange({ ...budgetPrevisionnel, factures: newFactures });
                        }}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-orange-600 font-bold">
                        {budgetPrevisionnel.factures[idx].toFixed(2)} €
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm">
                    {horsPeriode ? (
                      <span className="text-gray-400">-</span>
                    ) : (editMode && modeCalcul !== 'automatique') ? (
                      <input
                        type="number"
                        value={budgetPrevisionnel.depenses[idx]}
                        onChange={e => {
                          const newDepenses = [...budgetPrevisionnel.depenses];
                          newDepenses[idx] = parseFloat(e.target.value) || 0;
                          onEditChange({ ...budgetPrevisionnel, depenses: newDepenses });
                        }}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-red-600 font-bold">
                        {budgetPrevisionnel.depenses[idx].toFixed(2)} €
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm">
                    {horsPeriode ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <>
                        <span className={`text-lg font-bold ${previsionnelData[idx].solde >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {previsionnelData[idx].solde.toFixed(2)} €
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          ({previsionnelData[idx].soldeMensuel >= 0 ? '+' : ''}{previsionnelData[idx].soldeMensuel.toFixed(2)} € ce mois)
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};