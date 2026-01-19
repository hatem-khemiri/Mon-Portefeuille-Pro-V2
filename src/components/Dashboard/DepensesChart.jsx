import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../utils/constants';

export const DepensesChart = ({ depensesParCategorie }) => {
  if (depensesParCategorie.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
        <p className="text-gray-500 text-center py-10">Aucune dépense enregistrée</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={depensesParCategorie}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {depensesParCategorie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};