import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const CancelReservationModal = ({ show, onClose, onConfirm, isLoading }) => {
  if (!show) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1060 }}
      onClick={() => !isLoading && onClose()}
    >
      <div 
        className="bg-white position-relative shadow d-flex flex-column align-items-center justify-content-between p-4" 
        style={{ width: '576px', minHeight: '209px', height: 'auto', borderRadius: '16px', gap: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка Хрестик */}
        <button 
          className="btn border-0 position-absolute p-1 bg-transparent" 
          style={{ right: '20px', top: '16px' }}
          disabled={isLoading}
          onClick={onClose}
        >
          <i className="bi bi-x-lg text-muted" style={{ fontSize: '1.1rem' }}></i>
        </button>

        {/* Текст контенту */}
        <div className="w-100 text-center mt-3">
          <h4 className="fw-bold mb-3" style={{ color: '#4C4C4C', fontSize: '24px', lineHeight: '29px' }}>
            Скасування бронювання
          </h4>
          <p className="mb-0 mx-auto ps-3 pe-3" style={{ color: '#4C4C4C', fontSize: '14px', lineHeight: '22px', maxWidth: '480px' }}>
            Ви справді хочете покинути спільне бронювання для цього бажання?
          </p>
        </div>

        {/* Кнопки дій */}
        <div className="d-flex justify-content-between w-100 px-3 mb-2" style={{ height: '40px', gap: '16px' }}>
          <button 
            className="btn border-0 d-flex align-items-center justify-content-center" 
            style={{ flex: 1, height: '40px', backgroundColor: '#E6E6E6', color: '#757575', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
            disabled={isLoading}
            onClick={onClose}
          >
            Ні, залишити
          </button>
          <button 
            className="btn d-flex align-items-center justify-content-center border-0 text-white" 
            style={{ flex: 1, height: '40px', backgroundColor: '#DC362E', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-light"></div>
            ) : (
              'Так, скасувати'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};