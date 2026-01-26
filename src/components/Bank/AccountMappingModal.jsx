import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export const AccountMappingModal = ({ 
  isOpen, 
  onClose, 
  comptes, 
  bankName, 
  transactionsCount,
  onConfirm 
}) => {
  const [selectedOption, setSelectedOption] = useState(comptes.length > 0 ? 'existing' : 'new'); // ✅ Nouveau par défaut si aucun compte
  const [selectedCompteId, setSelectedCompteId] = useState(comptes.length > 0 ? comptes[0].id : null);
  const [newCompteName, setNewCompteName] = useState(bankName || 'Ma Banque');
  const [newCompteType, setNewCompteType] = useState('courant');

  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log('🔵 MODAL : handleConfirm appelé');
    console.log('🔵 selectedOption:', selectedOption);
    console.log('🔵 selectedCompteId:', selectedCompteId);
    console.log('🔵 newCompteName:', newCompteName);
  
    if (selectedOption === 'existing' && selectedCompteId) {
        const compte = comptes.find(c => c.id === selectedCompteId);
        console.log('🔵 Compte trouvé:', compte);
        onConfirm({ 
            type: 'existing', 
            compte: compte 
        });
    } else if (selectedOption === 'new') {
        console.log('🔵 Création nouveau compte');
        onConfirm({ 
            type: 'new', 
            compteName: newCompteName,
            compteType: newCompteType
        });
    }
  
    console.log('✅ MODAL : onConfirm appelé');
    };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={28} />
              <div>
                <h3 className="text-xl font-bold">Synchronisation réussie !</h3>
                <p className="text-sm text-blue-100 mt-1">
                  {transactionsCount} transaction{transactionsCount > 1 ? 's' : ''} trouvée{transactionsCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>
                {comptes.length > 0 
                  ? 'Choisissez où assigner ces transactions :' 
                  : 'Configurez votre nouveau compte bancaire :'}
              </strong>
            </p>
            <p className="text-xs text-blue-700 mt-2">
              {comptes.length > 0
                ? 'Vous pouvez les fusionner avec un compte existant ou créer un nouveau compte.'
                : 'Personnalisez le nom et le type de votre compte.'}
            </p>
          </div>

          {/* Option 1 : Compte existant (seulement si des comptes existent) */}
          {comptes.length > 0 && (
            <div 
              onClick={() => setSelectedOption('existing')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedOption === 'existing' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="radio"
                  name="option"
                  checked={selectedOption === 'existing'}
                  onChange={() => setSelectedOption('existing')}
                  className="w-5 h-5 text-blue-600"
                />
                <label className="font-bold text-gray-800 cursor-pointer">
                  📁 Fusionner avec un compte existant
                </label>
              </div>
              
              {selectedOption === 'existing' && (
                <select
                  value={selectedCompteId || ''}
                  onChange={(e) => setSelectedCompteId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {comptes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.type === 'courant' ? 'Compte Courant' : c.type === 'epargne' ? 'Épargne' : 'Espèces'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Option 2 : Nouveau compte */}
          <div 
            onClick={() => setSelectedOption('new')}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedOption === 'new' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <input
                type="radio"
                name="option"
                checked={selectedOption === 'new'}
                onChange={() => setSelectedOption('new')}
                className="w-5 h-5 text-green-600"
              />
              <label className="font-bold text-gray-800 cursor-pointer">
                ✨ Créer un nouveau compte
              </label>
            </div>
            
            {selectedOption === 'new' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Nom du compte</label>
                  <input
                    type="text"
                    value={newCompteName}
                    onChange={(e) => setNewCompteName(e.target.value)}
                    placeholder="Nom du nouveau compte"
                    className="w-full px-4 py-3 border-2 border-green-500 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Type de compte</label>
                  <select
                    value={newCompteType}
                    onChange={(e) => setNewCompteType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-500 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    <option value="courant">💳 Compte Courant</option>
                    <option value="epargne">💰 Épargne</option>
                    <option value="especes">💵 Espèces/Cash</option>
                  </select>
                </div>
                <p className="text-xs text-green-700">
                  💡 Vous pouvez personnaliser le nom (ex: "BNP Paribas", "Crédit Agricole")
                </p>
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">📋 Résumé :</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• {transactionsCount} transaction{transactionsCount > 1 ? 's' : ''} synchronisée{transactionsCount > 1 ? 's' : ''}</li>
              <li>
                • Assignée{transactionsCount > 1 ? 's' : ''} au compte : <strong>
                  {selectedOption === 'existing' 
                    ? comptes.find(c => c.id === selectedCompteId)?.nom || 'Sélectionner'
                    : newCompteName || 'Nouveau compte'
                  }
                </strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedOption === 'new' && !newCompteName.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};