import { useEffect } from 'react';

export const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-xl shadow-2xl p-4 min-w-[300px] border-2 ${
        notification.type === 'success' 
          ? 'bg-green-50 border-green-300 text-green-800' 
          : notification.type === 'error'
          ? 'bg-red-50 border-red-300 text-red-800'
          : 'bg-blue-50 border-blue-300 text-blue-800'
      }`}>
        <p className="font-medium">{notification.message}</p>
      </div>
    </div>
  );
};