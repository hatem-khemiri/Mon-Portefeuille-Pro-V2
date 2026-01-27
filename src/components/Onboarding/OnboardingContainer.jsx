import { useState } from 'react';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingComptes } from './OnboardingComptes';
import { OnboardingRevenus } from './OnboardingRevenus';
import { OnboardingCharges } from './OnboardingCharges';
import { OnboardingTransferts } from './OnboardingTransferts';
import { OnboardingEpargnes } from './OnboardingEpargnes';
import { useFinance } from '../../contexts/FinanceContext';

export const OnboardingContainer = ({ onComplete }) => {
  const { currentUser } = useFinance();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    comptes: [],
    transactions: [],
    revenus: [],
    charges: [],
    transferts: [],
    epargnes: []
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OnboardingWelcome username={currentUser} onNext={() => setStep(2)} />;
      
      case 2:
        return (
          <OnboardingComptes
            comptes={data.comptes}
            transactions={data.transactions}
            onComptesChange={(newComptes) => {
              setData(prevData => ({ ...prevData, comptes: newComptes }));
            }}
            onTransactionsChange={(newTransactions) => {
              setData(prevData => ({ ...prevData, transactions: newTransactions }));
            }}
            onNext={() => setStep(3)}
            onPrevious={() => setStep(1)}
            currentUser={currentUser}
          />
        );
      
      case 3:
        return (
          <OnboardingRevenus
            revenus={data.revenus}
            comptes={data.comptes}
            onRevenusChange={revenus => setData(prevData => ({ ...prevData, revenus }))}
            onNext={() => setStep(4)}
            onPrevious={() => setStep(2)}
            onSkip={() => setStep(4)}
          />
        );
      
      case 4:
        return (
          <OnboardingCharges
            charges={data.charges}
            comptes={data.comptes}
            onChargesChange={charges => setData(prevData => ({ ...prevData, charges }))}
            onNext={() => setStep(5)}
            onPrevious={() => setStep(3)}
            onSkip={() => setStep(5)}
          />
        );
      
      case 5:
        return (
          <OnboardingTransferts
            transferts={data.transferts}
            comptes={data.comptes}
            onTransfertsChange={transferts => setData(prevData => ({ ...prevData, transferts }))}
            onNext={() => setStep(6)}
            onPrevious={() => setStep(4)}
            onSkip={() => setStep(6)}
          />
        );
      
      case 6:
        return (
          <OnboardingEpargnes
            epargnes={data.epargnes}
            comptes={data.comptes}
            revenus={data.revenus}
            charges={data.charges}
            transferts={data.transferts}
            onEpargnesChange={epargnes => setData(prevData => ({ ...prevData, epargnes }))}
            onComplete={() => onComplete(data)}
            onPrevious={() => setStep(5)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Configuration initiale</h2>
              <span className="text-sm text-gray-600">Étape {step} / 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};