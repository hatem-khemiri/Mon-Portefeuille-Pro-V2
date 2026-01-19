import { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { getCurrentUser, setCurrentUser as saveCurrentUser } from './utils/storage';
import { useChargesFixes } from './hooks/useChargesFixes';
import { Notification } from './components/Common/Notification';
import { Header } from './components/Layout/Header';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { OnboardingContainer } from './components/Onboarding/OnboardingContainer';
import { DashboardContainer } from './components/Dashboard/DashboardContainer';
import { TransactionsContainer } from './components/Transactions/TransactionsContainer';
import { PrevisionnelContainer } from './components/Previsionnel/PrevisionnelContainer';
import { EpargnesContainer } from './components/Epargnes/EpargnesContainer';
import { DettesContainer } from './components/Dettes/DettesContainer';
import { ParametrageContainer } from './components/Parametrage/ParametrageContainer';
import { TrendingUp, FileText, Calendar, PiggyBank, CreditCard, Settings } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'previsionnel', label: 'Prévisionnel', icon: Calendar },
  { id: 'epargnes', label: 'Épargnes', icon: PiggyBank },
  { id: 'dettes', label: 'Crédits & Dettes', icon: CreditCard },
  { id: 'parametrage', label: 'Paramétrage', icon: Settings }
];

function AppContent() {
  const { 
    currentUser, 
    setCurrentUser, 
    isLoading, 
    setIsLoading,
    loadData,
    comptes,
    setComptes,
    transactions,
    chargesFixes,
    setChargesFixes,
    epargnes,
    setEpargnes,
    dettes, // ✅ AJOUT : Déstructurer dettes depuis useFinance
    setDateCreationCompte,
    categoriesDepenses,
    categoriesRevenus,
    categoriesEpargnes
  } = useFinance();

  const { genererTransactionsChargesFixes } = useChargesFixes();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      const username = getCurrentUser();
      if (username) {
        setCurrentUser(username);
        await loadData(username);
        
        // Vérifier si l'onboarding est complété
        const data = localStorage.getItem(`user_data_${username}`);
        if (data) {
          const parsed = JSON.parse(data);
          if (!parsed.onboardingCompleted) {
            setOnboardingStep(1);
          }
        } else {
          setOnboardingStep(1);
        }
      } else {
        setShowAuth(true);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const handleLogin = async (username) => {
    saveCurrentUser(username);
    setCurrentUser(username);
    setShowAuth(false);
    await loadData(username);
    
    // Vérifier si l'onboarding est complété
    const data = localStorage.getItem(`user_data_${username}`);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.onboardingCompleted) {
        setOnboardingStep(1);
      }
    } else {
      setOnboardingStep(1);
    }
  };

  const handleSignup = (username) => {
    saveCurrentUser(username);
    setCurrentUser(username);
    setShowAuth(false);
    setOnboardingStep(1);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(true);
    setOnboardingStep(0);
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = (onboardingData) => {
    // Enregistrer la date de création
    const dateCreation = new Date().toISOString();
    setDateCreationCompte(dateCreation);
    
    // Créer les comptes
    const nouveauxComptes = onboardingData.comptes.map((c, i) => {
      const soldeInitialFixe = parseFloat(c.solde);
      return {
        id: Date.now() + i,
        nom: c.nom,
        type: c.type,
        solde: soldeInitialFixe,
        soldeInitial: soldeInitialFixe
      };
    });
    setComptes(nouveauxComptes);

    // Créer les charges fixes
    const nouvellesCharges = [...onboardingData.revenus, ...onboardingData.charges, ...onboardingData.transferts].map((c, i) => {
      if (c.type === 'transfert') {
        return {
          id: Date.now() + i + 1000,
          nom: c.nom,
          montant: Math.abs(parseFloat(c.montant)),
          categorie: 'Transfert',
          frequence: c.frequence,
          jourMois: parseInt(c.jourMois),
          compte: c.compteSource,
          compteDestination: c.compteDestination,
          type: 'transfert'
        };
      }
      
      let montant = Math.abs(parseFloat(c.montant));
      if (categoriesDepenses.includes(c.categorie) || categoriesEpargnes.includes(c.categorie)) {
        montant = -montant;
      }
      
      return {
        id: Date.now() + i + 1000,
        ...c,
        montant,
        jourMois: parseInt(c.jourMois)
      };
    });
    setChargesFixes(nouvellesCharges);

    // Créer les épargnes
    const nouvellesEpargnes = onboardingData.epargnes.map((e, i) => ({
      id: Date.now() + i + 2000,
      ...e,
      objectif: parseFloat(e.objectif)
    }));
    setEpargnes(nouvellesEpargnes);

    // Générer les transactions pour toute l'année 
    setTimeout(() => {
      genererTransactionsChargesFixes(nouvellesCharges, dateCreation);
    }, 500);                                        

    // Terminer l'onboarding
    setOnboardingStep(0);
  };

  const handleExport = async () => {
    setNotification({ type: 'info', message: '📄 Génération du rapport en cours...' });

    try {
      // Importer la fonction de génération du rapport
      const { generateReport } = await import('./utils/reportGenerator');
  
      // Générer le rapport HTML
      const reportHTML = generateReport({
        currentUser,
        comptes,
        transactions,
        chargesFixes,
        epargnes,
        dettes,
        categoriesDepenses,
        categoriesRevenus,
        categoriesEpargnes
      });
  
      // Créer un Blob avec le HTML
      const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
    
      // Ouvrir directement dans un nouvel onglet
      const newWindow = window.open(url, '_blank');
    
      if (newWindow) {
        // Succès : la fenêtre s'est ouverte
        setNotification({ 
          type: 'success', 
          message: '✅ Rapport ouvert dans un nouvel onglet ! Vous pouvez l\'imprimer ou le sauvegarder.' 
        });
      
        // Libérer la mémoire après un délai
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        // Échec : popup bloquée
        setNotification({ 
          type: 'warning', 
          message: '⚠️ Pop-up bloquée ! Autorisez les pop-ups pour ce site et réessayez.' 
        });
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      setNotification({ type: 'error', message: '❌ Erreur lors de la génération du rapport' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {showForgotPassword ? (
            <ForgotPassword
              onBack={() => setShowForgotPassword(false)}
              onSuccess={() => {
                setShowForgotPassword(false);
                setNotification({ type: 'success', message: '✅ Mot de passe réinitialisé avec succès !' });
              }}
            />
          ) : authMode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setAuthMode('signup')}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  if (onboardingStep > 0) {
    return <OnboardingContainer onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      
      <Header onLogout={handleLogout} />

      <nav className="bg-white/60 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-3 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mr-2" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardContainer />}
        {activeTab === 'transactions' && <TransactionsContainer />}
        {activeTab === 'previsionnel' && <PrevisionnelContainer />}
        {activeTab === 'epargnes' && <EpargnesContainer />}
        {activeTab === 'dettes' && <DettesContainer />}
        {activeTab === 'parametrage' && (
          <ParametrageContainer 
            onExport={handleExport} 
            onLogout={handleLogout} 
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;