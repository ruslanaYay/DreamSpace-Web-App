import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Admin = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Завантаження даних...");

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch('http://localhost:8085/api/admin/test', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Передаємо JWT
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message); // "Доступ підтверджено" з твоєї Java
        } else {
          // Якщо бекенд повернув 403 (Forbidden) або 401
          localStorage.clear();
          navigate('/login');
        }
      } catch (error) {
        console.error("Помилка доступу:", error);
        setMessage("Помилка з'єднання з сервером");
      }
    };

    checkAdminAccess();
  }, [navigate]);

  return (
    <div className="p-5 text-center auth-bg min-vh-100">
      <div className="register-card shadow-sm d-inline-block p-4">
        <h2 className="register-form-title">Адмін панель</h2>
        <div className="alert alert-success mt-4">
          <i className="bi bi-shield-check"></i> {message}
        </div>
        <p className="text-muted">Ви увійшли як адміністратор системи.</p>
        <button 
          className="btn btn-purple w-100 mt-3"
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
        >
          Вийти
        </button>
      </div>
    </div>
  );
};