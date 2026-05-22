import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const WishItemCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    price: '',
    wishlistId: id || '',
    description: '',
    priority: 'HIGH'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchWishlists = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8085/api/wishlists', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setWishlists(data);
          if (!id && data.length > 0) {
            setFormData(prev => ({ ...prev, wishlistId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Помилка завантаження вішлістів", err);
      }
    };
    fetchWishlists();
  }, [id]);

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Поле обов’язкове для заповнення";
    if (formData.price !== '' && parseFloat(formData.price) < 0) {
      tempErrors.price = "Значення повинне бути більше або рівне 0";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const token = localStorage.getItem('token');

    // Формуємо об'єкт згідно з вимогами бекенду
    const wishData = {
      wishlistId: parseInt(formData.wishlistId),
      name: formData.name,
      storeLink: formData.link || null,
      price: formData.price === '' ? 0 : parseFloat(formData.price),
      description: formData.description || null,
      imageUrl: null, // Поки що null, якщо не реалізовано завантаження на хмару
      priority: formData.priority
    };

    try {
      const response = await fetch('http://localhost:8085/api/wishes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wishData)
      });

      const result = await response.json();

      switch (response.status) {
        case 201:
          console.log("Створено бажання:", result);
          navigate(`/wishlists/${formData.wishlistId}`);
          break;
        
        case 400:
          setErrors({ server: result.message || "Некоректні дані запиту" });
          break;

        case 401:
          alert("Увійдіть в обліковий запис");
          navigate('/login');
          break;

        case 403:
          alert("Доступ заборонено: ви не можете додавати бажання в цей список");
          break;

        case 404:
          alert("Вказаний вішліст не знайдено");
          break;

        case 500:
          alert("Сталася неочікувана помилка на сервері");
          break;

        default:
          alert(result.message || "Щось пішло не так");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Не вдалося з'єднатися з сервером");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file && !allowedTypes.includes(file.type)) {
      alert("Дозволені тільки формати .jpg, .png та .webp");
      e.target.value = null;
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-bg">
      <div className="bg-white shadow-sm position-relative p-4 p-md-5" style={{ width: '100%', maxWidth: '500px', borderRadius: '15px' }}>
        
        <button type="button" className="btn-close position-absolute top-0 end-0 m-4" onClick={() => navigate(-1)}></button>
        <h4 className="fw-bold mb-4 text-start">Додати бажання</h4>

        <form onSubmit={handleSubmit} noValidate>
          {/* Вивід серверної помилки валідації */}
          {errors.server && <div className="alert alert-danger p-2 small">{errors.server}</div>}

          {/* Назва */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Назва *</label>
            <input 
              type="text" 
              className={`form-control bg-light border-0 py-2 ${errors.name ? 'is-invalid-field' : ''}`}
              placeholder="Назва" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={isLoading}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          {/* Посилання на магазин */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Посилання на магазин</label>
            <input 
              type="text" 
              className="form-control bg-light border-0 py-2"
              placeholder="Введіть посилання" 
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              disabled={isLoading}
            />
          </div>

          {/* Ціна */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Ціна</label>
            <div className="input-group">
              <span className={`input-group-text bg-light border-0 ${errors.price ? 'is-invalid-field' : ''}`}>₴</span>
              <input 
                type="number" 
                className={`form-control bg-light border-0 py-2 ${errors.price ? 'is-invalid-field' : ''}`}
                placeholder="0,00" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                disabled={isLoading}
              />
            </div>
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>

          {/* Вибір вішліста */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Вішліст</label>
            <select 
              className="form-select bg-light border-0 py-2" 
              value={formData.wishlistId}
              onChange={(e) => setFormData({...formData, wishlistId: e.target.value})}
              disabled={isLoading}
            >
              {wishlists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>

          {/* Опис */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Опис</label>
            <textarea 
              className="form-control bg-light border-0 py-2" 
              rows="3" 
              placeholder="Наприклад розмір, колір"
              style={{ resize: 'none' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={isLoading}
            ></textarea>
          </div>

          {/* Зображення */}
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small d-block">Зображення</label>
            <label className="d-flex align-items-center justify-content-center bg-light rounded" style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
              <input type="file" className="d-none" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} disabled={isLoading} />
              <i className="bi bi-image text-muted opacity-50" style={{ fontSize: '1.5rem' }}></i>
            </label>
          </div>

          {/* Пріоритет */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold small">Пріоритет бажання</label>
            <select 
              className="form-select bg-light border-0 py-2"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              disabled={isLoading}
            >
              <option value="HIGH">🙂 Високий</option>
              <option value="MEDIUM">😐 Середній</option>
              <option value="LOW">☹️ Низький</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-purple w-100 py-2 fw-bold shadow-sm mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Додавання...' : 'Додати'}
          </button>
        </form>
      </div>
    </div>
  );
};