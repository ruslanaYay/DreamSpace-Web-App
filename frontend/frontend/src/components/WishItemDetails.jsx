import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:8085/api/wish-items/${itemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setItem(data);
        }
      } catch (err) {
        console.error("Помилка завантаження:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!item) return <div className="text-center mt-5">Бажання не знайдено</div>;

  // Функція для вибору іконки пріоритету
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-heart-eyes-fill text-danger';
      case 'MEDIUM': return 'bi-emoji-smile-fill text-warning';
      case 'LOW': return 'bi-emoji-neutral text-info';
      default: return 'bi-emoji-smile';
    }
  };

  return (
    <div className="details-page-wrapper" style={{ backgroundColor: '#F3F8FE', minHeight: '100vh', padding: '40px' }}>
      <div className="container-custom" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Кнопка Назад */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn border-0 p-0 mb-4" 
          style={{ fontSize: '1.5rem', color: '#333' }}
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        <div className="d-flex flex-column flex-md-row gap-5 align-items-start">
          
          {/* Блок зображення */}
          <div className="position-relative shadow-sm bg-white rounded-4 overflow-hidden" 
               style={{ width: '436px', height: '470px', flexShrink: 0 }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '5rem' }}></i>
              </div>
            )}
            
            {/* Іконка пріоритету */}
            <div className="position-absolute bottom-0 start-0 m-3 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                 style={{ width: '45px', height: '45px' }}>
              <i className={`bi ${getPriorityIcon(item.priority)} fs-4`}></i>
            </div>
          </div>

          {/* Блок тексту */}
          <div className="flex-grow-1" style={{ maxWidth: '700px' }}>
            <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: '#333' }}>{item.name}</h1>
            <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
              Додано {item.createdAt || '2026-05-17 13:15:00'}
            </p>

            <h2 className="fw-bold mb-4" style={{ fontSize: '2rem', color: '#333' }}>
              {(item.price || 0).toFixed(2)} ₴
            </h2>

            {/* Умовний рендеринг Опису */}
            {item.description && (
              <div className="mb-5">
                <p className="text-secondary lh-base" style={{ fontSize: '1.1rem' }}>
                  {item.description}
                </p>
              </div>
            )}

            {/* Умовний рендеринг Посилання */}
            {item.link && (
              <div className="mt-auto">
                <h6 className="fw-bold text-dark mb-2">Посилання</h6>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control border-1 bg-white py-2 shadow-none" 
                    value={item.link} 
                    readOnly 
                    style={{ borderRadius: '10px', color: '#555', cursor: 'text' }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};