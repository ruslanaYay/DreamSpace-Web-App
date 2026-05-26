import React from 'react';

export const DeleteWishModal = ({ show, onClose, onConfirm, isLoading }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" 
         style={{ 
           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
           backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 
         }}
         onClick={onClose}>
      
      <div className="bg-white p-4 position-relative shadow-lg text-center" 
           style={{ width: '100%', maxWidth: '450px', borderRadius: '15px' }}
           onClick={e => e.stopPropagation()}>
        
        {/* Кнопка-хрестик */}
        <button 
          type="button" 
          className="btn-close position-absolute top-0 end-0 m-3 shadow-none" 
          onClick={onClose}
          disabled={isLoading}
        ></button>
        
        <h5 className="fw-bold mt-3 mb-3">Видалити бажання?</h5>
        <p className="text-muted mb-4 small">
          Воно буде безповоротнo видалене з вішліста
        </p>

        <div className="d-flex gap-3 justify-content-center">
          <button 
            className="btn btn-light px-4 py-2 fw-bold text-muted border-0" 
            style={{ borderRadius: '10px', minWidth: '140px', backgroundColor: '#E9E9E9' }}
            onClick={onClose}
            disabled={isLoading}
          >
            Скасувати
          </button>
          <button 
            className="btn btn-danger px-4 py-2 fw-bold shadow-none border-0" 
            style={{ borderRadius: '10px', minWidth: '140px', backgroundColor: '#E53935' }}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : 'Видалити'}
          </button>
        </div>
      </div>
    </div>
  );
};