import { Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useEpargnes } from '../../hooks/useEpargnes';

export const EpargneCard = ({ epargne }) => {
  const { comptes } = useFinance();
  const { 
    deleteEpargne, 
    calculerSoldeObjectif, 
    getMensualiteSuggeree, 
    getProgression,
    getMoisRestants 
  } = useEpargnes();

  const soldeTotal = calculerSoldeObjectif(epargne);
  const progression = getProgression(epargne);
  const mensualiteSuggeree = getMensualiteSuggeree(epargne);
  const moisRestants = getMoisRestants();
  const aujourdHui = new Date();

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-2 border-purple-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{epargne.nom}</h3>
          <p className="text-sm text-gray-600 mt-1">{epargne.categorie}</p>
        </div>
        <button
          onClick={() => deleteEpargne(epargne.id)}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-600">Total épargné</span>
          <span className="text-2xl font-bold text-green-600">{soldeTotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-600">Objectif</span>
          <span className="text-xl font-bold text-gray-800">{epargne.objectif.toFixed(2)} €</span>
        </div>
        
        {progression < 100 && mensualiteSuggeree > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-blue-800">💡 Mensualité suggérée</p>
                <p className="text-xs text-blue-600 mt-1">
                  Pour atteindre l'objectif d'ici fin {aujourdHui.getFullYear()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{mensualiteSuggeree.toFixed(2)} €</p>
                <p className="text-xs text-blue-500">par mois ({moisRestants} mois restants)</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white/60 rounded-xl p-3 mt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Répartition :</p>
          {epargne.comptesAssocies.map((compteNom, idx) => {
            const compte = comptes.find(c => c.nom === compteNom);
            return compte ? (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">• {compte.nom}</span>
                <span className="font-semibold text-gray-800">{compte.solde.toFixed(2)} €</span>
              </div>
            ) : null;
          })}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              progression >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
              progression >= 75 ? 'bg-gradient-to-r from-blue-400 to-purple-500' :
              progression >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-pink-500'
            }`}
            style={{ width: `${Math.min(progression, 100)}%` }}
          ></div>
        </div>
        <p className="text-center text-sm font-bold text-gray-700 mt-2">
          {progression.toFixed(1)}% de l'objectif atteint
        </p>
        {progression < 100 && (
          <p className="text-center text-xs text-gray-500">
            Encore {(epargne.objectif - soldeTotal).toFixed(2)} € à économiser
          </p>
        )}
        {progression >= 100 && (
          <p className="text-center text-sm font-bold text-green-600">
            🎉 Objectif atteint !
          </p>
        )}
      </div>
    </div>
  );
};