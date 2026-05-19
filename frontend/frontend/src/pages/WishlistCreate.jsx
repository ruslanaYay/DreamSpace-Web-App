import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishlistCreate = () => {
  const navigate = useNavigate();

  // Стан форми
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacyStatus: 'LINK',
    showBooked: false
  });

  // Стан для валідації
  const [errors, setErrors] = useState({
    name: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Прибираємо помилку при введенні тексту
    if (name === 'name' && value.trim() !== '') {
      setErrors({ name: false });
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: true });
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8085/api/wishlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 201) {
        // Успішно створено — перенаправляємо на список
        navigate('/wishlists');
      } else if (response.status === 401) {
        alert("Сесія вичерпана, увійдіть знову");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Помилка при створенні вішліста");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Не вдалося з'єднатися з сервером");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="card shadow-sm border-0 position-relative" style={{ maxWidth: '500px', width: '100%', borderRadius: '12px' }}>
        
        {/* Кнопка закриття (Хрестик) */}
        <button 
          onClick={() => navigate('/wishlists')}
          className="btn-close position-absolute top-0 end-0 m-3 shadow-none"
          aria-label="Close"
        ></button>

        <div className="card-body p-4 pt-5">
          <h4 className="fw-bold mb-4">Створити новий вішліст</h4>

          <form onSubmit={handleSubmit} noValidate>
            {/* Поле Назва */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Назва *</label>
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Мій вішліст"
                value={formData.name}
                onChange={handleChange}
                style={{ backgroundColor: '#fdfdfd' }}
              />
              {errors.name && (
                <div className="invalid-feedback">Це поле обов’язкове</div>
              )}
            </div>

            {/* Поле Опис */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Опис</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Для чого вішліст"
                value={formData.description}
                onChange={handleChange}
                style={{ backgroundColor: '#fdfdfd' }}
              ></textarea>
            </div>

            {/* Налаштування приватності */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Налаштування приватності</label>
              <select
                name="privacyStatus"
                className="form-select"
                value={formData.privacyStatus}
                onChange={handleChange}
                style={{ backgroundColor: '#fdfdfd' }}
              >
                <option value="PRIVATE">Приватний</option>
                <option value="LINK">Доступ за посиланням</option>
                <option value="PUBLIC">Публічний</option>
              </select>
            </div>

            {/* Чекбокс */}
            <div className="mb-4 form-check">
              <input
                type="checkbox"
                name="showBooked"
                className="form-check-input"
                id="showBookedCheck"
                checked={formData.showBooked}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="showBookedCheck">
                Відображати заброньовані бажання
              </label>
            </div>

            {/* Кнопка створення */}
            <button 
              type="submit" 
              className="btn w-100 py-2 text-white fw-bold"
              style={{ backgroundColor: '#8A60C2', borderRadius: '8px' }}
            >
              Створити
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};