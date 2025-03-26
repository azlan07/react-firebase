import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const alertClass = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning'
  }[type];

  return (
    <div className="toast toast-top toast-end">
      <div className={`alert ${alertClass}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast; 