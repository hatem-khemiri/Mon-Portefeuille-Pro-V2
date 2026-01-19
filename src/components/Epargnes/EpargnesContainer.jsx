import { useEpargnes } from '../../hooks/useEpargnes';
import { EpargneCard } from './EpargneCard';
import { EpargneForm } from './EpargneForm';

export const EpargnesContainer = () => {
  const { epargnes } = useEpargnes();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Objectifs d'Épargne
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {epargnes.map(epargne => (
          <EpargneCard key={epargne.id} epargne={epargne} />
        ))}
      </div>
      
      <EpargneForm />
    </div>
  );
};