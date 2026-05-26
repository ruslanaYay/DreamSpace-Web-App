import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditWishItemModal } from '../components/EditWishItemModal';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuOpen, setActiveMenuOpen] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      const token = localStorage.getItem('token');
      
      // Якщо токена немає, відразу перенаправляємо на логін або показуємо 401
      if (!token) {
        setErrorMessage("Увійдіть в обліковий запис");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8085/api/wishes/${itemId}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          setItem(data);
        } else {
          // Обробка помилок згідно з ТЗ бекенду
          switch (response.status) {
            case 401:
              setErrorMessage("Увійдіть в обліковий запис");
              break;
            case 403:
              setErrorMessage("Доступ заборонено");
              break;
            case 404:
              setErrorMessage("Вказане бажання не знайдено");
              break;
            case 500:
              setErrorMessage("Сталася неочікувана помилка");
              break;
            default:
              setErrorMessage(data.message || "Сталася помилка");
          }
        }
      } catch (err) {
        console.error("Network error:", err);
        setErrorMessage("Не вдалося з'єднатися з сервером");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  };
  
  // Стан завантаження
  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  // Стан помилки
  if (errorMessage) return (
    <div className="container mt-5 text-center">
      <div className="alert alert-danger shadow-sm rounded-4">{errorMessage}</div>
      <button className="btn btn-primary rounded-3" onClick={() => navigate(-1)}>Повернутися назад</button>
    </div>
  );

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

return (
    /* Хедер вже рендериться в App.jsx, тут тільки контент */
    <main className="flex-grow-1 position-relative" style={{ backgroundColor: '#F3F8FE', minHeight: 'calc(100vh - 82px)' }}>
      
      {/* Кнопка Назад (Стрілка) - Позиціонується відносно краю екрану */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn border-0 p-0 shadow-none position-absolute" 
        style={{ 
          left: '20px', 
          top: '20px',
          zIndex: 10
        }}
      >
        <i className="bi bi-arrow-left" style={{ fontSize: '2rem', color: '#333' }}></i>
      </button>

      {/* МЕНЮ ДОДАТКОВИХ ДІЙ (Три крапки) */}
      <div className="position-absolute" style={{ right: '40px', top: '20px', zIndex: 20 }}>
        <button 
          className="btn border-0 p-1 shadow-none bg-transparent"
          onClick={() => setActiveMenuOpen(!activeMenuOpen)}
        >
          <i className="bi bi-three-dots-vertical text-dark" style={{ fontSize: '1.8rem' }}></i>
        </button>

        {activeMenuOpen && (
          <div 
            className="position-absolute shadow bg-white py-2" 
            style={{ right: 0, top: '50px', borderRadius: '12px', minWidth: '160px', border: '1px solid #eee' }}
          >
            <button 
              className="dropdown-item py-2 px-3 d-flex align-items-center" 
              onClick={() => {
                setIsEditModalOpen(true);
                setActiveMenuOpen(false);
              }}
            >
                Редагувати
            </button>
          </div>
        )}
      </div>

      <div className="container-fluid" style={{ paddingLeft: '80px', paddingTop: '60px' }}>
        <div className="d-flex flex-column flex-md-row gap-5 align-items-start">
          
          {/* Блок зображення (436x470) */}
          <div className="position-relative shadow-sm bg-white" 
               style={{ width: '436px', height: '470px', flexShrink: 0 }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: '#E5E5E5'}}>
                <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '6rem' }}></i>
              </div>
            )}
            
            {/* Пріоритет (Нижній лівий кут) */}
            <div className="position-absolute bottom-0 start-0 m-3 d-flex align-items-center justify-content-center" 
                 style={{ width: '40px', height: '40px' }}>
              <i className={`bi ${getPriorityIcon(item.priority)} fs-2 text-dark`}></i>
            </div>
          </div>

          {/* Блок тексту */}
          <div className="flex-grow-1">
            <h1 className="fw-bold mb-1" style={{ fontSize: '2.8rem', color: '#4C4C4C', fontFamily: 'Raleway, sans-serif' }}>
              {item.name}
            </h1>
            <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
              Додано {formatDate(item.createdAt)}
            </p>

            <h2 className="fw-bold mb-4" style={{ fontSize: '2.2rem', color: '#4C4C4C' }}>
              {Number(item.price || 0).toFixed(2)} ₴
            </h2>

            {/* Опис */}
            <div className="mb-5" style={{ maxWidth: '700px' }}>
              <p style={{ fontSize: '1.2rem', color: '#4C4C4C', lineHeight: '1.6' }}>
                {item.description || "Опис відсутній."}
              </p>
            </div>

            {/* Посилання */}
            {item.storeLink && (
              <div className="mt-4">
                <h6 className="fw-bold mb-2" style={{ color: '#4C4C4C', fontSize: '1.1rem' }}>Посилання</h6>
                <div 
                  className="bg-white border d-inline-block" 
                  style={{ 
                    borderRadius: '8px', 
                    padding: '8px 15px', 
                    maxWidth: '100%',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(item.storeLink, '_blank')}
                >
                  <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                    {item.storeLink}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ */}
      {isEditModalOpen && (
        <EditWishItemModal 
          show={isEditModalOpen}
          wishData={item}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updatedData) => {
            setItem(updatedData); // Миттєве оновлення даних на сторінці
            setIsEditModalOpen(false);
          }}
        />
      )}

    </main>
  );
};