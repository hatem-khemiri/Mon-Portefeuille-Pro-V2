import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const MemosTab = () => {
  const { memos, setMemos } = useFinance();
  const [newMemo, setNewMemo] = useState({ date: '', description: '', budget: '' });
  const [editingMemo, setEditingMemo] = useState(null);

  const addMemo = () => {
    if (newMemo.date && newMemo.description && newMemo.budget) {
      setMemos([...memos, { 
        ...newMemo, 
        id: Date.now(), 
        budget: parseFloat(newMemo.budget) 
      }]);
      setNewMemo({ date: '', description: '', budget: '' });
    }
  };

  const deleteMemo = (id) => {
    setMemos(memos.filter(m => m.id !== id));
  };

  const updateMemo = (id, updatedData) => {
    setMemos(memos.map(m => m.id === id ? { ...m, ...updatedData } : m));
    setEditingMemo(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Mémos Budgétaires</h3>
        <p className="text-gray-600 mb-4">
          Notez vos projets futurs et budgets associés pour mieux planifier.
        </p>
        
        <div className="space-y-3">
          {memos.map(memo => {
            const isEditing = editingMemo === memo.id;
            return (
              <div key={memo.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-md transition-all">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="date"
                        defaultValue={memo.date}
                        onChange={(e) => updateMemo(memo.id, { date: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        defaultValue={memo.description}
                        onBlur={(e) => updateMemo(memo.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        defaultValue={memo.budget}
                        onBlur={(e) => updateMemo(memo.id, { budget: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm"
                        placeholder="Budget"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-gray-800">{memo.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(memo.date).toLocaleDateString('fr-FR')} - Budget: {memo.budget.toFixed(2)} €
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => setEditingMemo(isEditing ? null : memo.id)}
                    className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    title={isEditing ? 'Terminer' : 'Modifier'}
                  >
                    {isEditing ? <Check size={20} /> : '✏️'}
                  </button>
                  <button 
                    onClick={() => deleteMemo(memo.id)} 
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t-2 pt-6">
        <h4 className="font-bold mb-4">Ajouter un mémo</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={newMemo.date}
            onChange={e => setNewMemo({...newMemo, date: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={newMemo.description}
            onChange={e => setNewMemo({...newMemo, description: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Budget (€)"
            value={newMemo.budget}
            onChange={e => setNewMemo({...newMemo, budget: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button 
          onClick={addMemo} 
          className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter le mémo
        </button>
      </div>
    </div>
  );
};