import { ArrowRight } from 'lucide-react';

export const OnboardingWelcome = ({ username, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-5xl">👋</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Bienvenue {username} !</h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          Pour commencer à utiliser Mon Portefeuille Pro, nous avons besoin de quelques informations 
          pour configurer votre espace financier personnel.
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
      >
        Commencer la configuration
        <ArrowRight size={20} />
      </button>
    </div>
  );
};