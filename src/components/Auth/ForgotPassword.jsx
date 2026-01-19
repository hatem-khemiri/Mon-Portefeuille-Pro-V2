import { useState } from 'react';
import { getSecurityQuestion, saveUserCredentials } from '../../utils/storage';

export const ForgotPassword = ({ onBack, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState(1); // 1: username, 2: security question, 3: new password
  const [securityData, setSecurityData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    setError('');

    const userPassword = localStorage.getItem(`user_${username}`);
    if (!userPassword) {
      setError('❌ Aucun compte trouvé avec ce nom d\'utilisateur');
      return;
    }

    const security = getSecurityQuestion(username);
    if (!security) {
      setError('❌ Aucune question de sécurité définie pour ce compte');
      return;
    }

    setSecurityData(security);
    setStep(2);
  };

  const handleSecurityAnswerSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (userAnswer.toLowerCase().trim() === securityData.answer) {
      setStep(3);
    } else {
      setError('❌ Réponse incorrecte');
    }
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    saveUserCredentials(username, newPassword);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 Récupération du mot de passe</h2>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre nom d'utilisateur. Vous devrez répondre à votre question de sécurité.
          </p>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Continuer
          </button>
        </form>
      )}

      {step === 2 && securityData && (
        <form onSubmit={handleSecurityAnswerSubmit} className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Question de sécurité :</p>
            <p className="text-sm text-gray-700">{securityData.question}</p>
          </div>
          <input
            type="text"
            placeholder="Votre réponse"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Vérifier
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm font-medium text-green-800">✅ Réponse correcte !</p>
          </div>
          <input
            type="password"
            placeholder="Nouveau mot de passe (min. 4 caractères)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Réinitialiser le mot de passe
          </button>
        </form>
      )}

      <button
        onClick={onBack}
        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
      >
        Retour à la connexion
      </button>
    </div>
  );
};