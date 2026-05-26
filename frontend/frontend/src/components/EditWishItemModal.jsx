import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const EditWishItemModal = ({ show, wishData, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    price: '',
    description: '',
    priority: 'HIGH'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (wishData && show) {
      setFormData({
        name: wishData.name || '',
        link: wishData.storeLink || '',
        price: wishData.price || '',
        description: wishData.description || '',
        priority: wishData.priority || 'HIGH'
      });
      setImagePreview(wishData.imageUrl || null);
      setSelectedFile(null);
      setErrors({});
    }
  }, [wishData, show]);

  if (!show) return null;

  // Логіка валідації (ідентична формі створення)
  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = "Це поле обов’язкове";
    }
    if (formData.price !== '' && parseFloat(formData.price) < 0) {
      tempErrors.price = "Значення повинне бути більше або рівне 0";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Обмеження форматів (ідентично формі створення)
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

  const uploadImage = async () => {
    if (!selectedFile) return wishData.imageUrl;

    const token = localStorage.getItem('token');
    const formDataImage = new FormData();
    formDataImage.append('file', selectedFile);

    const response = await fetch('http://localhost:8085/api/images/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataImage
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Не вдалося зберегти зображення");
    }
    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const finalImageUrl = await uploadImage();
      const token = localStorage.getItem('token');

      const updatedWish = {
        name: formData.name,
        storeLink: formData.link || null,
        price: formData.price === '' ? 0 : parseFloat(formData.price),
        description: formData.description || null,
        imageUrl: finalImageUrl,
        priority: formData.priority,
        wishlistId: wishData.wishlistId
      };

      const response = await fetch(`http://localhost:8085/api/wishes/${wishData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedWish)
      });

      const result = await response.json();

      if (response.ok) {
        // ПЕРЕВІРКА: Якщо це перше бажання і фото змінилося — ініціюємо оновлення
        // (Це спрацює автоматично на бекенді або при оновленні списку в onUpdate)
        onUpdate(result); 
        onClose();
      } else {
        // ОБРОБКА ПОМИЛОК СЕРВЕРА (400, 403, 500)
        switch (response.status) {
          case 400:
            setErrors({ server: result.message || "Некоректні дані. Перевірте заповнення полів." });
            break;
          case 403:
            setErrors({ server: "Доступ заборонено: ви не можете редагувати це бажання." });
            break;
          case 404:
            setErrors({ server: "Бажання не знайдено на сервері." });
            break;
          case 500:
            setErrors({ server: "Помилка сервера. Спробуйте пізніше." });
            break;
          default:
            setErrors({ server: result.message || "Сталася неочікувана помилка." });
        }
      }
    } catch (err) {
      setErrors({ server: err.message || "Не вдалося з'єднатися з сервером" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center px-3" 
         style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
         onClick={onClose}>
      <div className="bg-white p-4 p-md-5 position-relative shadow-lg" 
           style={{ width: '100%', maxWidth: '500px', borderRadius: '15px' }}
           onClick={e => e.stopPropagation()}>
        
        <button type="button" className="btn-close position-absolute top-0 end-0 m-4" onClick={onClose}></button>
        
        <h4 className="fw-bold mb-4 text-start">Редагування бажання</h4>

        <form onSubmit={handleSubmit} noValidate>
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
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Опис</label>
            <textarea 
              className="form-control bg-light border-0 py-2" 
              rows="3" 
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

          <button type="submit" className="btn btn-purple w-100 py-2 fw-bold shadow-sm" disabled={isLoading}>
            {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Зберегти
          </button>
        </form>
      </div>
    </div>
  );
};