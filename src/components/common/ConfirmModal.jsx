import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Yes',
  cancelText = 'No'
}) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button 
            className="btn btn-error"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmModal; 