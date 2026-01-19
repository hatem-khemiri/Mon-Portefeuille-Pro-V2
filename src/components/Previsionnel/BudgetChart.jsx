import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const BudgetChart = ({ previsionnelData }) => {
  // ✅ CORRECTION : Filtrer les mois hors période
  const donneesActives = previsionnelData.filter(data => !data.horsPeriode);
  
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">Vue mensuelle</h3>
      
      {donneesActives.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          <p>Aucune donnée à afficher pour cette période</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={donneesActives}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mois" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px', 
                border: '2px solid #e5e7eb' 
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenus" 
              stroke="#10b981" 
              strokeWidth={3} 
              name="Revenus" 
              dot={{ fill: '#10b981', r: 5 }} 
            />
            <Line 
              type="monotone" 
              dataKey="factures" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              name="Factures" 
              dot={{ fill: '#f59e0b', r: 5 }} 
            />
            <Line 
              type="monotone" 
              dataKey="depenses" 
              stroke="#ef4444" 
              strokeWidth={3} 
              name="Dépenses" 
              dot={{ fill: '#ef4444', r: 5 }} 
            />
            <Line 
              type="monotone" 
              dataKey="epargnesCumulees" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              name="Épargnes" 
              dot={{ fill: '#8b5cf6', r: 5 }} 
            />
            <Line 
              type="monotone" 
              dataKey="solde" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              name="Solde" 
              dot={{ fill: '#3b82f6', r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};