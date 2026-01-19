import { useDettes } from '../../hooks/useDettes';
import { DetteCard } from './DetteCard';
import { DetteForm } from './DetteForm';

export const DettesContainer = () => {
  const { dettes, getTotalDettes, getMensualitesTotales } = useDettes();
  
  const totalDettes = getTotalDettes();
  const mensualitesTotales = getMensualitesTotales();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Crédits & Dettes
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-red-100 text-sm font-medium mb-2">Total des dettes</p>
          <p className="text-3xl font-bold">{totalDettes.toFixed(2)} €</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-orange-100 text-sm font-medium mb-2">Mensualités totales</p>
          <p className="text-3xl font-bold">{mensualitesTotales.toFixed(2)} €</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-yellow-100 text-sm font-medium mb-2">Taux d'endettement</p>
          <p className="text-3xl font-bold">{((mensualitesTotales / 3200) * 100).toFixed(1)}%</p>
          <p className="text-xs text-yellow-100 mt-1">Base 3200€ de revenus</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {dettes.map(dette => (
          <DetteCard key={dette.id} dette={dette} />
        ))}
      </div>
      
      <DetteForm />
    </div>
  );
};