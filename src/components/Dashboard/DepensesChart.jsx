import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/constants';

export const DepensesChart = ({ depensesParCategorie, depensesRealisees }) => {
  const [includeAVenir, setIncludeAVenir] = useState(true);
  
  // Utiliser les données appropriées selon le toggle
  const dataToDisplay = includeAVenir ? depensesParCategorie : depensesRealisees;

  if (dataToDisplay.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIncludeAVenir(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !includeAVenir
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✓ Réalisées
          </button>
          <button
            onClick={() => setIncludeAVenir(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              includeAVenir
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📊 Réalisées + À venir
          </button>
        </div>
        
        <p className="text-gray-500 text-center py-10">Aucune dépense enregistrée</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
      
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setIncludeAVenir(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !includeAVenir
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✓ Réalisées uniquement
        </button>
        <button
          onClick={() => setIncludeAVenir(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            includeAVenir
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Réalisées + À venir
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataToDisplay}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {dataToDisplay.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Indicateur visuel en bas */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {includeAVenir 
            ? '📈 Vue prospective : dépenses réalisées et prévues' 
            : '✅ Vue historique : dépenses réalisées uniquement'}
        </p>
      </div>
    </div>
  );
};