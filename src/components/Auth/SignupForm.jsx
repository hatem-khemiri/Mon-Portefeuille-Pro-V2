import { useState } from 'react';
import { saveUserCredentials, saveSecurityQuestion, checkUserExists } from '../../utils/storage';

const SECURITY_QUESTIONS = [
  "Quel est le nom de votre premier animal de compagnie ?",
  "Quelle est votre ville de naissance ?",
  "Quel est le nom de jeune fille de votre mère ?",
  "Quel était le nom de votre école primaire ?",
  "Quel est votre plat préféré ?"
];

export const SignupForm = ({ onSignup, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    if (!securityQuestion || !securityAnswer) {
      setError('Veuillez définir une question de sécurité');
      return;
    }

    if (checkUserExists(username)) {
      setError('Cet utilisateur existe déjà');
      return;
    }

    saveUserCredentials(username, password);
    saveSecurityQuestion(username, securityQuestion, securityAnswer);
    onSignup(username);
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
        <p className="text-gray-600 mt-2">Créez votre compte</p>
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
            placeholder="Mot de passe (min. 4 caractères)"
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

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-3">
            🔒 Question de sécurité (pour récupération du mot de passe)
          </p>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg mb-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choisissez une question...</option>
            {SECURITY_QUESTIONS.map((q, idx) => (
              <option key={idx} value={q}>{q}</option>
            ))}
          </select>
          {securityQuestion && (
            <input
              type="text"
              placeholder="Votre réponse"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
        >
          Créer mon compte
        </button>
      </form>

      <div className="text-center">
        <span className="text-gray-600">Déjà un compte ? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
};