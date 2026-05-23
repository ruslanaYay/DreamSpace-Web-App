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

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
          // Якщо id не передано в URL, вибираємо перший вішліст зі списку
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

  // Валідація полів форми перед відправкою
  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = "Це поле обов’язкове";
    }
    if (formData.price !== '' && parseFloat(formData.price) < 0) {
      tempErrors.price = "Значення повинне бути більше або рівне 0";
    }
    if (!formData.wishlistId) {
      tempErrors.wishlistId = "Оберіть вішліст";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert("Дозволено лише формати JPG, JPEG та PNG");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Розмір файлу не повинен перевищувати 5 МБ");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Етап 1: Завантаження файлу на сервер зображень
  const uploadImage = async () => {
    if (!selectedFile) return null;

    const token = localStorage.getItem('token');
    const formDataImage = new FormData();
    formDataImage.append('file', selectedFile); 

    const response = await fetch('http://localhost:8085/api/images/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      // Content-Type НЕ ставимо вручну для FormData
      body: formDataImage
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Не вдалося зберегти зображення");
    }
    return data.imageUrl; 
  };

  // Етап 2: Відправка даних бажання
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let finalImageUrl = null;
      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage();
        } catch (imgErr) {
          setErrors({ server: imgErr.message });
          setIsLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const wishData = {
        wishlistId: parseInt(formData.wishlistId),
        name: formData.name,
        storeLink: formData.link || null,
        price: formData.price === '' ? 0 : parseFloat(formData.price),
        description: formData.description || null,
        imageUrl: finalImageUrl,
        priority: formData.priority
      };

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
          // Успіх: повертаємось до вішліста
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
          setErrors({ server: "Доступ заборонено: це не ваш вішліст" });
          break;
        case 404:
          setErrors({ server: "Вказаний вішліст не знайдено" });
          break;
        case 500:
          setErrors({ server: "Сталася неочікувана помилка на сервері" });
          break;
        default:
          setErrors({ server: result.message || "Сталася неочікувана помилка" });
      }
    } catch (err) {
      setErrors({ server: "Не вдалося з'єднатися з сервером" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-bg">
      <div className="bg-white shadow-sm position-relative p-4 p-md-5" style={{ width: '100%', maxWidth: '500px', borderRadius: '15px' }}>
        <button type="button" className="btn-close position-absolute top-0 end-0 m-4" onClick={() => navigate(-1)}></button>
        <h4 className="fw-bold mb-4 text-start">Додати бажання</h4>

        <form onSubmit={handleSubmit} noValidate>
          {/* Повідомлення про серверні помилки зверху форми */}
          {errors.server && (
            <div className="alert alert-danger py-2 px-3 small mb-3 border-0" style={{ borderRadius: '10px' }}>
              {errors.server}
            </div>
          )}

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Назва *</label>
            <input 
              type="text" 
              className={`form-control bg-light border-0 py-2 ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Назва" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={isLoading}
            />
            {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
          </div>

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

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Ціна</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0">₴</span>
              <input 
                type="number" 
                className={`form-control bg-light border-0 py-2 ${errors.price ? 'is-invalid' : ''}`}
                placeholder="0,00" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                disabled={isLoading}
              />
            </div>
            {errors.price && <div className="text-danger small mt-1">{errors.price}</div>}
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Вішліст</label>
            <select 
              className="form-select bg-light border-0 py-2" 
              value={formData.wishlistId}
              onChange={(e) => setFormData({...formData, wishlistId: e.target.value})}
              disabled={isLoading}
            >
              <option value="" disabled>Оберіть вішліст</option>
              {wishlists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>

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

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small d-block">Зображення</label>
            <label className="d-flex align-items-center justify-content-center bg-light rounded overflow-hidden shadow-sm" style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
              <input type="file" className="d-none" accept=".jpg,.jpeg,.png" onChange={handleFileChange} disabled={isLoading} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-100 h-100 object-fit-cover" />
              ) : (
                <i className="bi bi-image text-muted opacity-50" style={{ fontSize: '1.5rem' }}></i>
              )}
            </label>
          </div>

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
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {isLoading ? 'Додавання...' : 'Додати'}
          </button>
        </form>
      </div>
    </div>
  );
};