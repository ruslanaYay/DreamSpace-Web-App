import React from 'react';

export const Admin = () => {
  return (
    <div className="p-5 text-center" style={{ marginTop: '100px' }}>
      <div className="card shadow-sm p-4 d-inline-block" style={{ maxWidth: '600px' }}>
        <h1 className="text-purple mb-4">Адмін панель</h1>
        <p className="lead">Вітаємо в системі керування DreamSpace.</p>
        <div className="alert alert-info">
          Це тимчасова заглушка для адміністративних функцій.
        </div>
        <button 
          className="btn btn-outline-secondary mt-3"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Вийти з системи
        </button>
      </div>
    </div>
  );
};