import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export const Register = () => {
  const navigate = useNavigate();
  
  // Поля введення
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Повідомлення про помилки
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = "Це поле обов’язкове";
    if (!formData.lastName.trim()) newErrors.lastName = "Це поле обов’язкове";

    if (!formData.email.trim()) {
      newErrors.email = "Це поле обов’язкове";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Некоректна адреса електронної пошти";
    }

    if (!formData.password) {
      newErrors.password = "Це поле обов’язкове";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль має містити щонайменше 8 символів";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Спочатку фронтенд-валідація
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // 2. Якщо фронтенд-валідація пройдена, робимо запит до сервера
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8086/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.status === 201) {
          // Успіх: зберігаємо токен і роль, йдемо в кабінет
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          navigate('/ideas');
        } 
        else if (response.status === 409) {
          // Сервер каже, що юзер існує
          setErrors({ email: data.message || "Користувач з такими даними вже існує" });
        } 
        else if (response.status === 400) {
          // Серверна валідація (якщо бекенд знайшов помилки)
          setErrors(data);
        }
      } catch (error) {
        console.error("Помилка мережі:", error);
        alert("Не вдалося підключитися до сервера");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-card shadow-sm">
        <h2 className="register-form-title">Реєстрація</h2>
        
        <form className="mt-4" onSubmit={handleSubmit} noValidate>
          {/* Поле Ім'я */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Ім’я *</label>
            <input 
              type="text" 
              name="firstName"
              className={`form-control custom-input ${errors.firstName ? 'is-invalid-field' : ''}`}
              placeholder="Значення"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>

          {/* Поле Прізвище */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Прізвище *</label>
            <input 
              type="text" 
              name="lastName"
              className={`form-control custom-input ${errors.lastName ? 'is-invalid-field' : ''}`}
              placeholder="Значення"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>

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
          <div className="mb-4 text-start">
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

          <button type="submit" className="btn btn-purple w-100 py-2 mb-3" disabled={isLoading}>
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>

          <button 
            type="button" 
            className="btn btn-light-gray w-100 py-2"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Вже маю обліковий запис
          </button>
        </form>
      </div>
    </div>
  );
};