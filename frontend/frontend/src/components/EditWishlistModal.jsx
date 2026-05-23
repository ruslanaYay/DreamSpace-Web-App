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

    // Підготовка даних (Триммінг)
    const cleanedData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      privacyStatus: formData.privacyStatus,
      showBooked: formData.showBooked
    };

    // Клієнтська валідація (щоб не смикати API дарма)
    if (!cleanedData.name) {
      setErrors({ name: "Це поле обов’язкове" });
      return;
    }

    const token = localStorage.getItem('token');
    
    // Перевірка наявності токена перед запитом
    if (!token) {
      setServerError("Увійдіть в обліковий запис (відсутній токен)");
      return;
    }

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

      if (response.ok) { // Status: 200 OK
        onUpdate(data); 
        onClose();
        return;
      }

      // Обробка статусів помилок
      switch (response.status) {
        case 400: // Bad Request (Помилки валідації)
          if (data && typeof data === 'object' && !data.message) {
            // Прив'язуємо помилки до полів: { "name": "..." }
            setErrors(data); 
          } else {
            setServerError(data.message || "Некоректні дані");
          }
          break;

        case 401: // Unauthorized
          setServerError("Увійдіть в обліковий запис");
          // Тут можна додати логіку navigate('/login')
          break;

        case 403: // Forbidden
          setServerError("Доступ заборонено (ви не є власником)");
          break;

        case 404: // Not Found
          setServerError("Вказаний вішліст не знайдено");
          break;

        case 500: // Internal Server Error
          setServerError("Сталася неочікувана помилка на сервері");
          break;

        default:
          setServerError(data?.message || "Сталася помилка при збереженні");
      }

    } catch (err) {
      // Обробка помилки мережі (Network Error)
      setServerError("Не вдалося підключитися до сервера. Перевірте з'єднання.");
    }
  };
  
  if (!show) return null;

  
  return (
    <div 
      className="modal d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose} // Клік по фону закриє модалку
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // Клік всередині вікна нічого не зробить
      >
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