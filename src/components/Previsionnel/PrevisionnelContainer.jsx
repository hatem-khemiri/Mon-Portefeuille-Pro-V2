import { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { usePrevisionnelCalculations } from '../../hooks/usePrevisionnelCalculations';
import { BudgetChart } from './BudgetChart';
import { BudgetTable } from './BudgetTable';

export const PrevisionnelContainer = () => {
  const { 
    budgetPrevisionnel, 
    setBudgetPrevisionnel,
    modeCalculPrevisionnel,
    setModeCalculPrevisionnel
  } = useFinance();
  
  const { calculerPrevisionnelAutomatique, previsionnelData } = usePrevisionnelCalculations();
  const [editMode, setEditMode] = useState(false);

  // Mettre à jour le prévisionnel si le mode est automatique
  useEffect(() => {
    if (modeCalculPrevisionnel === 'automatique') {
      const prevAuto = calculerPrevisionnelAutomatique();
      setBudgetPrevisionnel(prevAuto);
    }
  }, [modeCalculPrevisionnel]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Budget Prévisionnel
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <select
              value={modeCalculPrevisionnel}
              onChange={(e) => {
                setModeCalculPrevisionnel(e.target.value);
                if (e.target.value === 'automatique') {
                  setBudgetPrevisionnel(calculerPrevisionnelAutomatique());
                  setEditMode(false);
                }
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="automatique">🤖 Automatique</option>
              <option value="manuel">✏️ Manuel</option>
            </select>
            {modeCalculPrevisionnel !== 'automatique' && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                {editMode ? 'Terminer' : 'Modifier'}
              </button>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            title="Actualiser la page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>
      
      {modeCalculPrevisionnel === 'automatique' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
          <h3 className="font-bold text-green-800 mb-2">📊 Mode Automatique Activé</h3>
          <p className="text-sm text-green-700">
            Le prévisionnel se calcule automatiquement en fonction de vos charges fixes définies dans les paramètres.
          </p>
        </div>
      )}
      
      <BudgetChart previsionnelData={previsionnelData} />
      
      <BudgetTable 
        budgetPrevisionnel={budgetPrevisionnel}
        previsionnelData={previsionnelData}
        editMode={editMode}
        onEditChange={setBudgetPrevisionnel}
        modeCalcul={modeCalculPrevisionnel}
      />
    </div>
  );
};