import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const CategoriesTab = () => {
  const { 
    categoriesDepenses, 
    setCategoriesDepenses,
    categoriesRevenus,
    setCategoriesRevenus,
    categoriesEpargnes,
    setCategoriesEpargnes
  } = useFinance();
  
  const [newCategorieDepense, setNewCategorieDepense] = useState('');
  const [newCategorieRevenu, setNewCategorieRevenu] = useState('');
  const [newCategorieEpargne, setNewCategorieEpargne] = useState('');

  const addCategorieDepense = () => {
    if (newCategorieDepense && !categoriesDepenses.includes(newCategorieDepense)) {
      setCategoriesDepenses([...categoriesDepenses, newCategorieDepense]);
      setNewCategorieDepense('');
    }
  };

  const addCategorieRevenu = () => {
    if (newCategorieRevenu && !categoriesRevenus.includes(newCategorieRevenu)) {
      setCategoriesRevenus([...categoriesRevenus, newCategorieRevenu]);
      setNewCategorieRevenu('');
    }
  };

  const addCategorieEpargne = () => {
    if (newCategorieEpargne && !categoriesEpargnes.includes(newCategorieEpargne)) {
      setCategoriesEpargnes([...categoriesEpargnes, newCategorieEpargne]);
      setNewCategorieEpargne('');
    }
  };

  const deleteCategorieDepense = (cat) => setCategoriesDepenses(categoriesDepenses.filter(c => c !== cat));
  const deleteCategorieRevenu = (cat) => setCategoriesRevenus(categoriesRevenus.filter(c => c !== cat));
  const deleteCategorieEpargne = (cat) => setCategoriesEpargnes(categoriesEpargnes.filter(c => c !== cat));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4">Catégories de Dépenses</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoriesDepenses.map(cat => (
            <div key={cat} className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
              <span className="font-medium">{cat}</span>
              <button onClick={() => deleteCategorieDepense(cat)} className="text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nouvelle catégorie de dépense"
            value={newCategorieDepense}
            onChange={e => setNewCategorieDepense(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
          />
          <button 
            onClick={addCategorieDepense} 
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Catégories de Revenus</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoriesRevenus.map(cat => (
            <div key={cat} className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <span className="font-medium">{cat}</span>
              <button onClick={() => deleteCategorieRevenu(cat)} className="text-green-600 hover:text-green-800">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nouvelle catégorie de revenu"
            value={newCategorieRevenu}
            onChange={e => setNewCategorieRevenu(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
          />
          <button 
            onClick={addCategorieRevenu} 
            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Catégories d'Épargnes</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoriesEpargnes.map(cat => (
            <div key={cat} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
              <span className="font-medium">{cat}</span>
              <button onClick={() => deleteCategorieEpargne(cat)} className="text-purple-600 hover:text-purple-800">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nouvelle catégorie d'épargne"
            value={newCategorieEpargne}
            onChange={e => setNewCategorieEpargne(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          <button 
            onClick={addCategorieEpargne} 
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};