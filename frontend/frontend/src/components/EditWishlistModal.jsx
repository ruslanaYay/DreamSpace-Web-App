import React, { useState, useEffect } from 'react';

export const EditWishlistModal = ({ show, onClose, wishlistData, onUpdate }) => {
  // Стейт форми
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacyStatus: 'LINK',
    showBooked: false
  });

  // Стейт для помилок (серверних та клієнтських)
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // 1. Автоматична ініціалізація стейту форми актуальними даними
  useEffect(() => {
    if (wishlistData) {
      setFormData({
        name: wishlistData.name || '',
        description: wishlistData.description || '',
        privacyStatus: wishlistData.privacyStatus || 'LINK',
        showBooked: wishlistData.showBooked ?? false
      });
      setErrors({}); // Скидаємо помилки при відкритті
      setServerError("");
    }
  }, [wishlistData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Очищаємо помилку поля при зміні
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // 2. Валідація та відправка
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Триммінг даних (ігнорування пробілів на початку та в кінці)
    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    // Клієнтська перевірка
    if (!cleanedData.name) {
      setErrors({ name: "Назва є обов'язковою" });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/${wishlistData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });

      const data = await response.json();

      if (!response.ok) {
        // 3. Відображення серверних помилок валідації
        if (data.errors) {
          // Якщо сервер повертає об'єкт { field: "error message" }
          setErrors(data.errors);
        } else {
          setServerError(data.message || "Сталася помилка при збереженні");
        }
        return;
      }

      onUpdate(data); // Оновлюємо список у батьківському компоненті
      onClose();      // Закриваємо модалку
    } catch (err) {
      setServerError("Не вдалося підключитися до сервера");
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3" style={{ borderRadius: '15px' }}>
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Редагувати вішліст</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {serverError && <div className="alert alert-danger py-2 small">{serverError}</div>}

              {/* Поле Назва */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Назва *</label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Поле Опис */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Опис</label>
                <textarea
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Приватність */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Налаштування приватності</label>
                <select 
                  name="privacyStatus" 
                  className="form-select"
                  value={formData.privacyStatus}
                  onChange={handleChange}
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

              <div className="modal-footer border-0">
                <button 
                  type="submit" 
                  className="btn w-100 text-white" 
                  style={{ backgroundColor: '#8A60C2', borderRadius: '10px' }}
                >
                  Зберегти
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};