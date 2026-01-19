export const StatCard = ({ 
  titre, 
  valeur, 
  couleur, 
  icon: Icon, 
  details,
  children 
}) => {
  return (
    <div className={`bg-gradient-to-br ${couleur} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {children ? children : (
            <>
              <p className="text-sm font-medium opacity-90 mb-2">{titre}</p>
              <p className="text-3xl font-bold">{valeur}</p>
            </>
          )}
        </div>
        {Icon && (
          <div className="bg-white/20 p-3 rounded-xl">
            <Icon size={32} />
          </div>
        )}
      </div>
      {details && (
        <div className="border-t border-white/30 pt-3 space-y-1">
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <p className="opacity-90">{detail.label}</p>
              <p className="font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};