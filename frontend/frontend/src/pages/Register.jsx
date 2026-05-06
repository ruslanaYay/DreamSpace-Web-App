import React from 'react';
import { useNavigate } from 'react-router-dom';
// Виправляємо шлях до стилів (виходимо з папки pages у папку src)
import '../App.css'; 

export const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page-wrapper">
      <div className="register-card shadow-sm">
        <h2 className="register-form-title">Реєстрація</h2>
        
        <form className="mt-4">
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Ім’я *</label>
            <input type="text" className="form-control custom-input" placeholder="Значення" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Прізвище *</label>
            <input type="text" className="form-control custom-input" placeholder="Значення" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Email *</label>
            <input type="email" className="form-control custom-input" placeholder="Значення" />
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Пароль *</label>
            <input type="password" className="form-control custom-input" placeholder="Значення" />
          </div>

          <button type="submit" className="btn btn-purple w-100 py-2 mb-3">
            Зареєструватися
          </button>

          <button 
            type="button" 
            className="btn btn-light-gray w-100 py-2"
            onClick={() => navigate('/login')}
          >
            Вже маю обліковий запис
          </button>
        </form>
      </div>
    </div>
  );
};