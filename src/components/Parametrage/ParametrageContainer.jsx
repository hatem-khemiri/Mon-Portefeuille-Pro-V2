import { useState } from 'react';
import { ComptesTab } from './ComptesTab';
import { CategoriesTab } from './CategoriesTab';
import { ChargesTab } from './ChargesTab';
import { MemosTab } from './MemosTab';
import { ProfilTab } from './ProfilTab';
import { BankConnection } from '../Bank/BankConnection';

export const ParametrageContainer = ({ onExport, onLogout }) => {
  const [activeSection, setActiveSection] = useState('comptes');

  const sections = [
    { id: 'comptes', label: '💳 Comptes Bancaires' },
    { id: 'bank', label: '🏦 Synchronisation Bancaire' },
    { id: 'categories', label: '🏷️ Catégories' },
    { id: 'charges', label: '🔄 Transactions Récurrentes' },
    { id: 'memos', label: '📝 Mémos Budgétaires' },
    { id: 'profil', label: '👤 Mon Profil' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'comptes':
        return <ComptesTab />;
      case 'bank':
        return <BankConnection />;
      case 'categories':
        return <CategoriesTab />;
      case 'charges':
        return <ChargesTab />;
      case 'memos':
        return <MemosTab />;
      case 'profil':
        return <ProfilTab onExport={onExport} onLogout={onLogout} />;
      default:
        return <ComptesTab />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Paramétrage
      </h2>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
        <div className="flex border-b overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeSection === section.id
                  ? 'border-b-4 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};