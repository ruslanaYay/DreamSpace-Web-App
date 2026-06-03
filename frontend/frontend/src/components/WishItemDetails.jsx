import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { EditWishItemModal } from '../components/EditWishItemModal';
import { DeleteWishModal } from './DeleteWishModal';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishItemDetails = () => {
  const { itemId, shareToken } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOwner, setIsOwner] = useState(false); 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuOpen, setActiveMenuOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false });
  const [isDeleting, setIsDeleting] = useState(false);

  // Стан для модального вікна бронювання гостем
  const [showReserveModal, setShowReserveModal] = useState(false);
  // Стан для відстеження процесу відправки запиту бронювання
  const [isReserving, setIsReserving] = useState(false);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('uk-UA');
  };

  // Завантаження деталей бажання
  const fetchWishData = async () => {
    const authToken = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };

    try {
      setLoading(true);
      let url;

      if (shareToken) {
        url = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${itemId}`;
      } else {
        url = `http://localhost:8085/api/wishes/${itemId}`;
      }

      const response = await fetch(url, { method: 'GET', headers });
      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        if (shareToken) {
          setItem(resData.wish || resData);
          setIsOwner(resData.isOwner === true);
        } else {
          setItem(resData);
          setIsOwner(true);
        }
      } else {
        // Обробка помилок відповідно до ТЗ
        setErrorMessage(resData.message || "Вказане бажання не знайдено");
      }
    } catch (err) {
      setErrorMessage("Помилка мережі або сервера");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishData();
  }, [itemId, shareToken]);

  useEffect(() => {
    const closeMenu = () => setActiveMenuOpen(false);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishes/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 204 || response.ok) {
        setDeleteModal({ show: false });
        navigate(-1); 
      } else {
        alert("Не вдалося видалити бажання. Спробуйте ще раз.");
      }
    } catch (err) {
      console.error("Помилка при видаленні:", err);
      alert("Сталася помилка сервера під час видалення.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async () => {
    if (!isOwner) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishes/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const updatedWish = await response.json();
        const completedStatus = updatedWish.isCompleted !== undefined ? updatedWish.isCompleted : updatedWish[" isCompleted "];
        setItem(prev => ({ ...prev, isCompleted: completedStatus }));
      }
    } catch (err) { console.error(err); }
  };

  // Оновлена та інтегрована з ТЗ функція підтвердження бронювання
  const handleConfirmReservation = async () => {
    if (isReserving || !itemId) return;
    setIsReserving(true);

    const authToken = localStorage.getItem('token');
    
    // Якщо токена немає, перенаправляємо на авторизацію (відповідно до помилки 401 з ТЗ)
    if (!authToken) {
      alert("Увійдіть в обліковий запис");
      setShowReserveModal(false);
      setIsReserving(false);
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    // Тіло запиту суворо за специфікацією ТЗ
    const reservationRequestBody = {
      reservationType: "INDIVIDUAL",
      maxParticipants: 1,
      email: null
    };

    try {
      // Ендпоінт суворо за специфікацією ТЗ
      const url = shareToken 
        ? `http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${itemId}/reserve`
        : `http://localhost:8085/api/wishes/${itemId}/reserve`;

      const response = await fetch(url, {
        method: 'POST', // Суворо POST за специфікацією ТЗ
        headers: headers,
        body: JSON.stringify(reservationRequestBody)
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        // Оновлюємо стан поточного бажання за ТЗ після успішного Status 200
        setItem(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            isReserved: true,
            reservationType: "INDIVIDUAL",
            reservationId: resData.reservationId || null,
            isCurrentUserParticipant: true
          };
        });
        setShowReserveModal(false);
      } else {
        // Відображаємо точне повідомлення помилки з бекенду (400, 403, 404, 500) за ТЗ
        alert(resData.message || "Сталася неочікувана помилка");
        setShowReserveModal(false);
        
        // Якщо позиція змінилася або не знайдена, актуалізуємо дані сторінки
        if (response.status === 400 || response.status === 404) {
          fetchWishData();
        }
      }
    } catch (err) {
      console.error("Помилка при бронюванні:", err);
      alert("Не вдалося з'єднатися з сервером");
    } finally {
      setIsReserving(false);
    }
  };

  const handleReserveClick = () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    } else {
      setShowReserveModal(true);
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (errorMessage) return (
      <div className="error-page-wrapper d-flex flex-column align-items-center mt-5">
        <p className="access-denied-text">{errorMessage}</p>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate(-1)}>Повернутися</button>
      </div>
  );
  if (!item) return null;

  // Комбіноване визначення, чи є бажання заброньованим на основі ТЗ
  const isWishReserved = item.isReserved === true || !!item.reservationType || !!item.reservationId;

  return (
      <main className="flex-grow-1 position-relative" style={{ backgroundColor: '#F3F8FE', minHeight: 'calc(100vh - 82px)' }}>
        <button onClick={() => navigate(-1)} className="btn border-0 p-0 shadow-none position-absolute" style={{ left: '20px', top: '20px', zIndex: 10 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: '2rem', color: '#333' }}></i>
        </button>

        <div className="container-fluid" style={{ paddingLeft: '80px', paddingTop: '60px' }}>
          <div className="d-flex flex-column flex-md-row gap-5 align-items-start">
            
            {/* Лівий блок: Зображення */}
            <div className="position-relative shadow-sm bg-white" style={{ width: '436px', height: '470px', flexShrink: 0, overflow: 'hidden', borderRadius: '12px' }}>
              
              {/* Бейдж: Виконано */}
              {item.isCompleted && (
                  <div className="completed-badge" style={{ zIndex: 25 }}>
                    <i className="bi bi-check-lg me-1"></i> Виконано
                  </div>
              )}

              {/* Бейдж: Заброньовано (Логіка відображення за ТЗ) */}
              {!item.isCompleted && isWishReserved && (
                  <div className="completed-badge reserved" style={{ zIndex: 25 }}>
                    <i className="bi bi-lock-fill me-1"></i> Заброньовано
                  </div>
              )}

              {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-100 h-100 object-fit-cover" />
              ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: '#E5E5E5'}}>
                    <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '6rem' }}></i>
                  </div>
              )}
              <div className="priority-emoji position-absolute bottom-0 start-0 m-3" style={{ zIndex: 5 }}>
                <i className={`bi ${getPriorityIcon(item.priority)}`}></i>
              </div>
            </div>

            {/* Правий блок: Контент картки бажання */}
            <div className="flex-grow-1" style={{ width: '100%', maxWidth: '700px' }}>
              
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h1 className="fw-bold m-0" style={{ fontSize: '2.8rem', color: '#4C4C4C', fontFamily: 'Raleway, sans-serif', paddingRight: '15px' }}>
                  {item.name}
                </h1>
                
                {isOwner && (
                  <div className="position-relative flex-shrink-0" style={{ marginTop: '10px' }}>
                    <button 
                      className="btn border-0 p-1 shadow-none bg-transparent" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        setActiveMenuOpen(!activeMenuOpen);
                      }}
                    >
                      <i className="bi bi-three-dots-vertical text-dark" style={{ fontSize: '1.8rem' }}></i>
                    </button>
                    
                    {activeMenuOpen && (
                       <div className="position-absolute shadow bg-white" style={{ top: '40px', right: '0px', zIndex: 110, borderRadius: '12px', minWidth: '160px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                          <div className="d-flex flex-column text-start">
                            <div className="px-3 py-2 text-dark menu-hover-effect" 
                                 onClick={(e) => { 
                                   e.preventDefault(); 
                                   e.stopPropagation(); 
                                   setIsEditModalOpen(true); 
                                   setActiveMenuOpen(false); 
                                 }} 
                                 style={{ cursor: 'pointer', fontSize: '14px' }}>
                              Редагувати
                            </div>
                            <div style={{ height: '1px', backgroundColor: '#eee', margin: '0 10px' }}></div>
                            <div className="px-3 py-2 text-dark menu-hover-effect" 
                                 onClick={(e) => { 
                                   e.preventDefault(); 
                                   e.stopPropagation(); 
                                   setDeleteModal({ show: true }); 
                                   setActiveMenuOpen(false); 
                                 }} 
                                 style={{ cursor: 'pointer', fontSize: '14px' }}>
                              Видалити
                            </div>
                          </div>
                       </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>Додано {formatDate(item.createdAt)}</p>
              <h2 className="fw-bold mb-4" style={{ fontSize: '2.2rem', color: '#4C4C4C' }}>{Number(item.price || 0).toFixed(2)} ₴</h2>

              {/* Опис бажання */}
              {item.description && item.description.trim() !== "" && (
                <div className="mb-5">
                  <p style={{ fontSize: '1.2rem', color: '#4C4C4C', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.description}
                  </p>
                </div>
              )}

              {/* Форма посилання */}
              {item.storeLink && (
                  <div className="mt-4 mb-4">
                    <h6 className="fw-bold mb-2" style={{ color: '#4C4C4C' }}>Посилання</h6>
                    <div 
                      className="bg-white border p-2 px-3 w-100" 
                      style={{ 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }} 
                      onClick={() => window.open(item.storeLink, '_blank')}
                    >
                      <span className="text-muted text-break" style={{ display: 'block' }}>
                        {item.storeLink}
                      </span>
                    </div>
                  </div>
              )}

              {isOwner && (
                  <button
                    className={`btn mt-2 w-100 d-flex align-items-center justify-content-center transition-all ${item.isCompleted ? 'btn-wish-completed' : 'btn-wish-action'}`}
                    style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none' }}
                    onClick={toggleStatus}
                  >
                    {item.isCompleted ? 'Зробити активним' : 'Виконати'}
                  </button>
              )}

              {/* Логіка відображення кнопки «Забронювати» для сторонніх користувачів за ТЗ */}
              {!isOwner && !item.isCompleted && !isWishReserved && (
                  <button
                    className="btn mt-2 w-100 d-flex align-items-center justify-content-center text-white"
                    style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none', backgroundColor: '#8A60C2' }}
                    onClick={handleReserveClick}
                  >
                    Забронювати
                  </button>
              )}
            </div>

          </div>
        </div>

        {/* МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ БРОНЮВАННЯ ДЛЯ ГОСТЯ */}
        {showReserveModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
               style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}
               onClick={() => !isReserving && setShowReserveModal(false)}>
            <div className="bg-white position-relative shadow d-flex flex-column align-items-center justify-content-between p-4" 
                 style={{ width: '576px', height: '209px', borderRadius: '16px' }}
                 onClick={(e) => e.stopPropagation()}>
              
              <button className="btn border-0 position-absolute p-1 bg-transparent" 
                      style={{ right: '20px', top: '16px' }}
                      disabled={isReserving}
                      onClick={() => setShowReserveModal(false)}>
                <i className="bi bi-x-lg text-muted" style={{ fontSize: '1.1rem' }}></i>
              </button>

              <div className="w-100 text-center mt-2">
                <h4 className="fw-bold mb-2" style={{ color: '#4C4C4C', fontSize: '24px', lineHeight: '29px' }}>
                  Бронювання бажання
                </h4>
                <p className="mb-0 mx-auto" style={{ color: '#000000', fontSize: '14px', lineHeight: '22px', maxWidth: '480px' }}>
                  Ви впевнені, що хочете забронювати це бажання? Інші користувачі більше не зможуть його обрати.
                </p>
              </div>

              <div className="d-flex justify-content-between" style={{ width: '528px', height: '40px' }}>
                <button className="btn border-0 d-flex align-items-center justify-content-center" 
                        style={{ width: '250px', height: '40px', backgroundColor: '#E6E6E6', color: '#757575', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
                        disabled={isReserving}
                        onClick={() => setShowReserveModal(false)}>
                  Скасувати
                </button>
                <button className="btn d-flex align-items-center justify-content-center border-0" 
                        style={{ width: '250px', height: '40px', backgroundColor: '#8A60C2', color: '#F5F5F5', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
                        disabled={isReserving}
                        onClick={handleConfirmReservation}>
                  {isReserving ? (
                    <div className="spinner-border spinner-border-sm text-light"></div>
                  ) : (
                    'Підтвердити'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
            <>
              <EditWishItemModal
                  show={isEditModalOpen}
                  wishData={item}
                  onClose={() => setIsEditModalOpen(false)}
                  onUpdate={(updatedData) => setItem(updatedData)}
              />
             <DeleteWishModal
                  show={deleteModal.show}
                  onClose={() => !isDeleting && setDeleteModal({show: false})}
                  onConfirm={handleDeleteConfirm} 
              />
            </>
        )}
      </main>
  );
};