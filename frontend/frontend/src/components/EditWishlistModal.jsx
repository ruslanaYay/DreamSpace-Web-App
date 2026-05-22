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
  // Додано перевірку [show], щоб дані оновлювалися саме в момент відкриття вікна
  useEffect(() => {
    if (show && wishlistData) {
      setFormData({
        name: wishlistData.name || '',
        description: wishlistData.description || '',
        privacyStatus: wishlistData.privacyStatus || 'LINK',
        showBooked: wishlistData.showBooked ?? false
      });
      setErrors({}); 
      setServerError("");
    }
  }, [wishlistData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // 2. Валідація та відправка
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    // Триммінг даних (ігнорування пробілів на початку та в кінці)
    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    // Програмна перевірка цілісності (після ігнорування пробілів)
    if (!cleanedData.name) {
      setErrors({ name: "Назва не може бути порожньою" });
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

      // Перевірка на порожню відповідь сервера перед парсингом
      const contentType = response.headers.get("content-type");
      const data = contentType && contentType.includes("application/json") 
        ? await response.json() 
        : null;

      if (!response.ok) {
        // 3. Відображення серверних помилок валідації
        if (data && data.errors) {
          // Прив'язка тексту помилки до відповідного поля (наприклад, errors.name)
          setErrors(data.errors);
        } else {
          setServerError(data?.message || "Сталася помилка при збереженні");
        }
        return;
      }

      onUpdate(data); 
      onClose();      
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