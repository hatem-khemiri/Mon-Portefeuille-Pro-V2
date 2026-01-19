import { LogOut } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { clearCurrentUser } from '../../utils/storage';

export const Header = ({ onLogout }) => {
  const { currentUser } = useFinance();

  const handleLogout = () => {
    clearCurrentUser();
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Mon Portefeuille Pro
            </h1>
            <p className="text-sm text-gray-600">Bienvenue {currentUser}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};