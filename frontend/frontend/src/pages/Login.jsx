import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Очищуємо помилку при зміні тексту в полі
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Це поле обов’язкове";
    if (!formData.password.trim()) newErrors.password = "Це поле обов’язкове";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Клієнтська валідація на порожні поля
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({}); 

    try {
      const response = await fetch('http://localhost:8085/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 200) {
        // --- ОБРОБКА УСПІХУ (200 OK) ---
        // Зберігаємо дані з AuthResponse (бекенд)
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        console.log(`Вхід успішний. Роль: ${data.role}`);

        // Логіка перенаправлення згідно з роллю
        if (data.role === 'ADMIN') {
          navigate('/admin'); // Адмін-панель
        } else {
          navigate('/wishlists'); // Особистий кабінет користувача
        }
      } 
      else if (response.status === 404) {
        // Якщо користувача не знайдено (Email невірний)
        setErrors({ email: data.message || "Користувача з таким Email не знайдено" });
      } 
      else if (response.status === 401) {
        // Якщо пароль невірний
        setErrors({ password: data.message || "Неправильний пароль" });
      } 
      else if (response.status === 400) {
        // Помилки валідації (наприклад, невірний формат пошти)
        setErrors(data); 
      }
    } catch (error) {
      console.error("Помилка мережі:", error);
      alert("Не вдалося з'єднатися з сервером. Переконайтеся, що бекенд запущений на порті 8085.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper auth-bg">
      <div className="register-card shadow-sm">
        <h2 className="register-form-title">Вхід</h2>
        
        <form className="mt-4" onSubmit={handleSubmit} noValidate>
          {/* Поле Email */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Email *</label>
            <input 
              type="email" 
              name="email"
              className={`form-control custom-input ${errors.email ? 'is-invalid-field' : ''}`}
              placeholder="Значення"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* Поле Пароль */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Пароль *</label>
            <input 
              type="password" 
              name="password"
              className={`form-control custom-input ${errors.password ? 'is-invalid-field' : ''}`}
              placeholder="Значення"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="text-start mb-4">
            <Link to="/resetpassword" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
              Забули пароль?
            </Link>
          </div>

          <button type="submit" className="btn btn-purple w-100 py-2 mb-3" disabled={isLoading}>
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>

          <button 
            type="button" 
            className="btn btn-light-gray w-100 py-2"
            onClick={() => navigate('/register')}
            disabled={isLoading}
          >
            Не маю облікового запису
          </button>
        </form>
      </div>
    </div>
  );
};