import { useState } from 'react';
import { checkUserExists } from '../../utils/storage';

export const LoginForm = ({ onLogin, onSwitchToSignup, onForgotPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const storedPassword = localStorage.getItem(`user_${username}`);
    if (storedPassword === password) {
      onLogin(username);
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-4xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mon Portefeuille Pro
        </h1>
        <p className="text-gray-600 mt-2">Gérez vos finances en toute simplicité</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
        
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
        >
          Se connecter
        </button>
      </form>

      <button
        onClick={onForgotPassword}
        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Mot de passe oublié ?
      </button>

      <div className="text-center">
        <span className="text-gray-600">Pas encore de compte ? </span>
        <button
          onClick={onSwitchToSignup}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          S'inscrire
        </button>
      </div>
    </div>
  );
};