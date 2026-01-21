import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');

      console.log('📞 Callback reçu avec userId:', userId);

      if (!userId) {
        console.error('❌ Pas de userId dans callback');
        navigate('/');
        return;
      }

      try {
        // Récupérer les items Bridge
        console.log('🔍 Récupération des items...');
        
        const itemsResponse = await fetch('/api/bridge/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        if (!itemsResponse.ok) throw new Error('Erreur récupération items');

        const { items } = await itemsResponse.json();
        console.log('✅ Items récupérés:', items);

        if (items && items.length > 0) {
          const latestItem = items[0];

          // Sauvegarder la connexion
          localStorage.setItem(`bank_connection_${userId}`, JSON.stringify({
            itemId: latestItem.id,
            userId: userId,
            bankName: latestItem.bank_name,
            connectedAt: new Date().toISOString()
          }));

          // Synchroniser les transactions
          console.log('🔄 Synchronisation des transactions...');
          
          const syncResponse = await fetch('/api/bridge/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: latestItem.id, userId })
          });

          if (!syncResponse.ok) throw new Error('Erreur synchronisation');

          const syncData = await syncResponse.json();
          console.log('✅ Transactions synchronisées:', syncData);

          // Stocker les transactions
          if (syncData.transactions && syncData.transactions.length > 0) {
            const existingData = localStorage.getItem(`user_data_${userId}`);
            const userData = existingData ? JSON.parse(existingData) : {};
            
            const existingTransactions = userData.transactions || [];
            const bridgeIds = new Set(existingTransactions.map(t => t.bridgeId).filter(Boolean));
            
            const newTransactions = syncData.transactions.filter(t => !bridgeIds.has(t.bridgeId));
            
            userData.transactions = [...existingTransactions, ...newTransactions];
            
            localStorage.setItem(`user_data_${userId}`, JSON.stringify(userData));
            
            console.log(`✅ ${newTransactions.length} nouvelles transactions ajoutées`);
          }

          // Rediriger vers le dashboard
          alert(`✅ Synchronisation réussie ! ${syncData.transactionsCount} transactions récupérées.`);
          navigate('/');
          window.location.reload(); // Forcer le rechargement pour mettre à jour le contexte
        }

      } catch (error) {
        console.error('❌ Erreur callback:', error);
        alert(`❌ Erreur : ${error.message}`);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Synchronisation en cours...</h2>
        <p className="text-gray-600 mt-2">Récupération de vos transactions bancaires</p>
      </div>
    </div>
  );
};
