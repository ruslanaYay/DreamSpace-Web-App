import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { CancelReservationModal } from '../components/CancelReservationModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import emptyPresentImg from '../assets/empty_present.png';

export const BookedReservations = () => {
  const navigate = useNavigate();

  // Стани для даних
  const [reservedItems, setReservedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 4;

  // Стани для модального вікна скасування
  const [modalConfig, setModalConfig] = useState({
    show: false,
    reservationId: null,
    reservationType: 'INDIVIDUAL'
  });
  const [isCanceling, setIsCanceling] = useState(false);

  // Завантаження заброньованих бажань поточного користувача
  const fetchReservedItems = async (page) => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:8085/api/reservations/my?page=${page - 1}&size=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        alert("Увійдіть в обліковий запис");
        navigate('/login');
        return;
      }

      if (response.status === 500) {
        alert("Сталася неочікувана помилка");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setReservedItems(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservedItems(currentPage);
  }, [currentPage]);

  // Клік на кнопку «Скасувати» в картці
  const handleCancelClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation(); // Запобігаємо переходу на сторінку деталізації

    setModalConfig({
      show: true,
      reservationId: item.reservationId,
      reservationType: item.reservationType || 'INDIVIDUAL'
    });
  };

  // Підтвердження видалення всередині CancelReservationModal
  const handleCancelConfirm = async () => {
    if (isCanceling || !modalConfig.reservationId) return;
    setIsCanceling(true);

    const token = localStorage.getItem('token');
    const isGroup = modalConfig.reservationType === "GROUP";
    const url = isGroup
        ? `http://localhost:8085/api/reservations/${modalConfig.reservationId}/leave`
        : `http://localhost:8085/api/reservations/${modalConfig.reservationId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        alert(`Доступ заборонено: ${errData.message || 'Ви не можете скасувати це бронювання'}`);
        closeModal();
        return;
      }

      if (response.ok || response.status === 204) {
        closeModal();
        // Якщо видалили останній елемент на поточній сторінці — переходимо на попередню
        if (reservedItems.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchReservedItems(currentPage);
        }
      }
    } catch (err) {
      console.error("Помилка при скасуванні:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  const closeModal = () => {
    setModalConfig({ show: false, reservationId: null, reservationType: 'INDIVIDUAL' });
  };

  // ОНОВЛЕНО: Спрощено навігацію на делікатний роут деталізації
  const handleCardClick = (item) => {
    const wishId = item.wishId || item.id;
    
    // Передаємо `fromBooked: true` у state, щоб компонент WishItemDetails 
    // робив запит до спеціального гостьового API
    navigate(`/wish-items/${wishId}`, { 
      state: { 
        fromBooked: true,
        token: item.shareToken // Передаємо токен, якщо він є в об'єкті
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="spinner-border" role="status" style={{ color: '#8A60C2' }}></div>
      </div>
    );
  }

  return (
    <div className="flex-grow-1 p-0 min-vh-100 ms-4 mt-2" style={{ backgroundColor: '#F3F8FE' }}>
      <div className="w-100 d-flex flex-column align-items-start" style={{ backgroundColor: '#F3F8FE' }}>
        
        <h2 
          className="fw-bold m-0" 
          style={{ color: '#4C4C4C', fontSize: '2.25rem', lineHeight: '1.0', textAlign: 'left' }}
        >
          Заброньовані бажання
        </h2>

        {reservedItems.length === 0 ? (
          <div className="w-100 d-flex flex-column align-items-start" style={{ marginTop: '32px' }}>
            <p 
              className="m-0" 
              style={{ color: '#4C4C4C', fontSize: '1.15rem', lineHeight: '1.2', textAlign: 'left' }}
            >
              У вас немає заброньованих бажань
            </p>
            
            <div className="w-100 d-flex justify-content-center align-items-center" style={{ marginTop: '50px' }}>
              <img 
                src={emptyPresentImg} 
                alt="Немає бронювань" 
                style={{ maxWidth: '420px', width: '100%', height: 'auto' }} 
              />
            </div>
          </div>
        ) : (
          <div className="w-100 d-flex flex-column align-items-start" style={{ marginTop: '32px' }}>
            
            <div className="d-flex flex-column gap-3 w-100 align-items-start">
              {reservedItems.map((item) => (
                <div 
                  key={item.wishId || item.id}
                  className="card border-0 shadow-sm p-4 d-flex flex-row align-items-center justify-content-between"
                  onClick={() => handleCardClick(item)}
                  style={{ 
                    width: '1076px', 
                    height: '182px', 
                    borderRadius: '16px', 
                    cursor: 'pointer', 
                    backgroundColor: '#ffffff' 
                  }}
                >
                  {/* Ліва частина: Зображення + Інформація */}
                  <div className="d-flex align-items-start gap-4">
                    
                    <div 
                      className="d-flex align-items-center justify-content-center bg-light"
                      style={{ width: '134px', height: '134px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.wishName} className="w-100 h-100 object-cover" />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary">
                          <i className="bi bi-image" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>
                        </div>
                      )}
                    </div>

                    <div className="d-flex flex-column justify-content-start">
                      <h4 className="fw-bold mb-1" style={{ color: '#4C4C4C', fontSize: '20px', lineHeight: '1.2' }}>
                        {item.wishName || "Без назви"}
                      </h4>
                      <span className="text-muted mb-2" style={{ fontSize: '15px' }}>
                        {item.wishlistName || "Мій день народження"}
                      </span>
                      
                      {/* ОНОВЛЕНО: Чітка відповідність полів до DTO з бекенду (currentParticipantsCount) */}
                      {item.reservationType === "GROUP" && (
                        <span className="text-secondary mt-1" style={{ fontSize: '14px', fontWeight: '500' }}>
                          Спільне: {item.currentParticipantsCount ?? item.currentParticipants ?? 0} з {item.maxParticipants ?? 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Права частина: Кнопка "Скасувати" */}
                  <button
                    onClick={(e) => handleCancelClick(e, item)}
                    className="btn d-flex align-items-center justify-content-center shadow-none"
                    style={{ 
                      width: '107px', 
                      height: '40px', 
                      border: '1px solid rgba(220, 54, 46, 0.8)', 
                      backgroundColor: 'rgba(244, 129, 124, 0.48)', 
                      color: '#f5f5f5',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Скасувати
                  </button>
                </div>
              ))}
            </div>

            {/* Блок пагінації */}
            <div className="d-flex justify-content-center w-100 mt-5" style={{ maxWidth: '1076px' }}>
              <button className="d-none"></button> {/* Технічний хак для уникнення зсувів */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

          </div>
        )}
      </div>

      <CancelReservationModal 
        show={modalConfig.show}
        isLoading={isCanceling}
        reservationType={modalConfig.reservationType}
        onClose={closeModal}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};