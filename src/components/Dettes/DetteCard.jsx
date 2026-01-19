import { Trash2 } from 'lucide-react';
import { useDettes } from '../../hooks/useDettes';

export const DetteCard = ({ dette }) => {
  const { deleteDette, getProgressionRemboursement } = useDettes();
  
  const progressionRemboursement = getProgressionRemboursement(dette);
  const typeLabel = dette.type === 'dette_personnelle' ? '👤 Dette personnelle' : '🏦 Crédit bancaire';
  const typeColor = dette.type === 'dette_personnelle' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">{dette.nom}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{dette.compte}</p>
        </div>
        <button
          onClick={() => deleteDette(dette.id)}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total emprunté</p>
          <p className="font-bold text-gray-800">{dette.total.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Restant dû</p>
          <p className="font-bold text-red-600">{dette.restant.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Mensualité</p>
          <p className="font-bold text-orange-600">{dette.mensualite.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Taux</p>
          <p className="font-bold text-gray-800">{dette.taux}%</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressionRemboursement}%` }}
        ></div>
      </div>
      <p className="text-center text-sm font-bold text-gray-700 mt-2">
        {progressionRemboursement.toFixed(1)}% remboursé
      </p>
    </div>
  );
};