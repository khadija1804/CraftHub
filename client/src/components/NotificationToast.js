import React, { useEffect } from 'react';

function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Disparaît après 4 secondes

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      background: notification.type === 'success' 
        ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
        : notification.type === 'error'
        ? 'linear-gradient(135deg, #f44336, #ef5350)'
        : notification.type === 'warning'
        ? 'linear-gradient(135deg, #ff9800, #ffb74d)'
        : 'linear-gradient(135deg, #2196f3, #42a5f5)',
      color: '#fff',
      padding: '20px 30px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      minWidth: '350px',
      maxWidth: '500px',
      animation: 'slideInRight 0.3s ease-out',
      fontFamily: '"Georgia", serif',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center'
      }}>
        {notification.type === 'success' ? '✅' : 
         notification.type === 'error' ? '❌' :
         notification.type === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div style={{
        flex: 1,
        fontSize: '1.1em',
        fontWeight: 600,
        lineHeight: '1.4'
      }}>
        {notification.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          fontSize: '1.5em',
          cursor: 'pointer',
          padding: '5px 10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          width: '35px',
          height: '35px'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.3)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ×
      </button>
    </div>
    </>
  );
}

export default NotificationToast;
