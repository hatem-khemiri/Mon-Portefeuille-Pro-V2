import { useState } from 'react';
import { Download, Trash2, User } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { deleteUserAccount } from '../../utils/storage';

export const ProfilTab = ({ onExport, onLogout }) => {
  const { currentUser, setComptes, setTransactions, setChargesFixes, setEpargnes, setDettes, setMemos } = useFinance();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  const handleReset = () => {
    // Supprimer toutes les données financières
    setComptes([]);
    setTransactions([]);
    setChargesFixes([]);
    setEpargnes([]);
    setDettes([]);
    setMemos([]);
    
    // ✅ CORRECTION COMPLÈTE : Supprimer TOUTES les données bancaires ET financières
    // La clé user_data_H contient les transactions synchronisées !
    const keysToRemove = [
      `bank_connection_${currentUser}`,
      `bank_token_${currentUser}`,
      `bank_accounts_${currentUser}`,
      `bank_sync_date_${currentUser}`,
      `last_sync_${currentUser}`,
      `user_data_${currentUser}` // ← CRITIQUE : Supprime les transactions sync
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Nettoyer toutes les autres clés bancaires potentielles
    Object.keys(localStorage).forEach(key => {
      if (key.includes(currentUser) && (key.startsWith('bank_') || key.startsWith('bridge_'))) {
        localStorage.removeItem(key);
      }
    });
    
    setShowResetConfirm(false);
    
    // Redémarrer l'onboarding
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    // ✅ Supprimer TOUTES les clés (bancaires + données utilisateur)
    const keysToRemove = [
      `bank_connection_${currentUser}`,
      `bank_token_${currentUser}`,
      `bank_accounts_${currentUser}`,
      `bank_sync_date_${currentUser}`,
      `last_sync_${currentUser}`,
      `user_data_${currentUser}`,
      `security_${currentUser}`,
      `user_${currentUser}`
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Nettoyer toutes les clés bancaires
    Object.keys(localStorage).forEach(key => {
      if (key.includes(currentUser) && (key.startsWith('bank_') || key.startsWith('bridge_'))) {
        localStorage.removeItem(key);
      }
    });
    
    deleteUserAccount(currentUser);
    setShowDeleteAccountConfirm(false);
    onLogout();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Gestion du compte</h3>
        <p className="text-gray-600 mb-6">Gérez vos données et votre compte utilisateur</p>
      </div>
      
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <User size={20} />
          Informations du compte
        </h4>
        <div className="space-y-2 text-sm">
          <p><strong>Nom d'utilisateur :</strong> {currentUser}</p>
          <p><strong>Mode :</strong> {currentUser === 'demo_user' ? '🚀 Démonstration' : '💾 Compte sauvegardé'}</p>
        </div>
      </div>
      
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <h4 className="font-bold text-green-800 mb-3">💾 Sauvegarde des données</h4>
        <p className="text-sm text-green-700 mb-4">
          Exportez toutes vos données (comptes, transactions, épargnes...) dans un rapport HTML complet.
        </p>
        <button
          onClick={onExport}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Exporter toutes mes données (Rapport)
        </button>
      </div>
      
      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
        <h4 className="font-bold text-orange-800 mb-3">🔄 Réinitialisation</h4>
        <p className="text-sm text-orange-700 mb-4">
          Supprimez TOUTES vos données financières (comptes, transactions, épargnes) ET votre connexion bancaire. Votre compte utilisateur sera conservé.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            Réinitialiser l'application
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-2">⚠️ ÊTES-VOUS SÛR ?</p>
              <p className="text-xs text-red-700 mb-2">Cette action supprimera :</p>
              <ul className="text-xs text-red-700 list-disc list-inside">
                <li>Toutes vos données financières (comptes, transactions, épargnes, dettes)</li>
                <li>Votre connexion bancaire (token + transactions synchronisées)</li>
              </ul>
              <p className="text-xs text-red-700 mt-2">Cette action est IRRÉVERSIBLE.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                ✓ Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <h4 className="font-bold text-red-800 mb-3">🗑️ Suppression du compte</h4>
        <p className="text-sm text-red-700 mb-4">
          Cette action supprimera définitivement votre compte ET toutes vos données. Vous ne pourrez plus vous reconnecter avec ce nom d'utilisateur.
        </p>
        {!showDeleteAccountConfirm ? (
          <button
            onClick={() => setShowDeleteAccountConfirm(true)}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            Supprimer définitivement mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-2">⚠️ SUPPRESSION DÉFINITIVE</p>
              <p className="text-xs text-red-700 mb-3">
                Vous êtes sur le point de supprimer DÉFINITIVEMENT :
              </p>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                <li>Votre compte "{currentUser}"</li>
                <li>Tous vos identifiants</li>
                <li>TOUTES vos données financières</li>
                <li>Votre connexion bancaire</li>
              </ul>
              <p className="text-xs font-bold text-red-900 mt-3">
                Cette action est IRRÉVERSIBLE et vous ne pourrez JAMAIS récupérer ce compte.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="py-3 bg-red-700 text-white rounded-xl font-medium hover:bg-red-800 transition-all"
              >
                ✓ Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3">📋 Aide</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Différence entre Réinitialiser et Supprimer :</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Réinitialiser</strong> : Efface vos données financières + connexion bancaire, conserve votre compte</li>
            <li><strong>Supprimer le compte</strong> : Efface TOUT définitivement (compte + données + banque)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};