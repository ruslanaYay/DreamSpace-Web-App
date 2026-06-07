import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { EditWishItemModal } from '../components/EditWishItemModal';
import { DeleteWishModal } from '../components/DeleteWishModal';
import { ReserveWishModal } from '../components/ReserveWishlistModal';
import { CancelReservationModal } from '../components/CancelReservationModal'; 
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

  // Стан для відображення інтегрованого ReserveWishModal
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveModalMode, setReserveModalMode] = useState('RESERVE'); 

  // Стан для скасування спільного/одиночного бронювання
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Визначаємо, чи прийшов користувач зі сторінки /booked
  const isFromBooked = location.state?.fromBooked === true;
  
  // Використовуємо деструктуризований shareToken з useParams
  const effectiveShareToken = shareToken || location.state?.token;

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

      // ВИЗНАЧЕННЯ ЕНДПОІНТУ НА БЕКЕНДІ:
      if (isFromBooked) {
        // Якщо користувач прийшов зі сторінки BookedReservation, робимо запит на API бронювань
        url = `http://localhost:8085/api/reservations/my/wishes/${itemId}`;
      } else if (effectiveShareToken) {
        // Якщо перехід за прямим share-посиланням гостя
        url = `http://localhost:8085/api/wishlists/share/${effectiveShareToken}/wishes/${itemId}`;
      } else {
        // Пряме посилання для власника списку бажань
        url = `http://localhost:8085/api/wishes/${itemId}`;
      }

      const response = await fetch(url, { method: 'GET', headers });
      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        // Деякі ендпоінти загортають об'єкт у .wish, деякі повертають одразу об'єкт бажання
        setItem(resData.wish || resData);
        
        // КОРЕКТНЕ НАЛАШТУВАННЯ ПРАВ ДОСТУПУ:
        if (isFromBooked || effectiveShareToken) {
          // Якщо прийшов з booked або share-лінку — це 100% гість
          setIsOwner(false);
        } else {
          // В іншому випадку це власник бажання
          setIsOwner(true);
        }
      } else {
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
  }, [itemId, shareToken, location.state]);

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
        const completedStatus = updatedWish.isCompleted !== undefined ? updatedWish.isCompleted : updatedWish["isCompleted"];
        setItem(prev => ({ ...prev, isCompleted: completedStatus }));
      }
    } catch (err) { console.error(err); }
  };

  const handleCancelReservation = async () => {
  if (isCanceling || !item || !item.reservationId) return;
  setIsCanceling(true);

  const authToken = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  try {
    const url = item.reservationType === 'GROUP'
        ? `http://localhost:8085/api/reservations/${item.reservationId}/leave`
        : `http://localhost:8085/api/reservations/${item.reservationId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers
    });

    const resData = await response.json().catch(() => ({}));

    if (response.ok) {
      setShowCancelModal(false);

      // ЯКЩО ПРИЙШЛИ ЗІ СТОРІНКИ /booked — ПОВЕРТАЄМОСЬ ТУДИ
      if (isFromBooked) {
        navigate('/booked'); // Або navigate(-1), якщо хочете повернути на попередній екран в історії
      } else {
        // Якщо скасували, перебуваючи на сторінці гостя за share-лінк, просто оновлюємо дані картки
        fetchWishData(); 
      }
    } else {
      alert(resData.message || "Сталася помилка при скасуванні участі");
      setShowCancelModal(false);
    }
  } catch (err) {
    console.error("Помилка при скасуванні участі:", err);
    alert("Не вдалося з'єднатися з сервером");
  } finally {
    setIsCanceling(false);
  }
};

  const handleReserveClick = () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    } else {
      setReserveModalMode('RESERVE');
      setShowReserveModal(true);
    }
  };

  const handleJoinClick = () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    } else {
      setReserveModalMode('JOIN');
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

  const isWishReserved = item.isReserved === true;
  const hasIndividualReservation = isWishReserved && item.reservationType === "INDIVIDUAL";
  const hasGroupReservation = isWishReserved && item.reservationType === "GROUP";

  const currentParticipants = item.currentParticipants || 0;
  const maxParticipants = item.maxParticipants || 1;
  const isGroupFilled = currentParticipants === maxParticipants;

  return (
      <main className="flex-grow-1 position-relative" style={{ backgroundColor: '#F3F8FE', minHeight: 'calc(100vh - 82px)' }}>
        <button onClick={() => navigate(-1)} className="btn border-0 p-0 shadow-none position-absolute" style={{ left: '20px', top: '20px', zIndex: 10 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: '2rem', color: '#333' }}></i>
        </button>

        <div className="container-fluid" style={{ paddingLeft: '80px', paddingTop: '60px' }}>
          <div className="d-flex flex-column flex-md-row gap-5 align-items-start">
            
            {/* Лівий блок: Зображення */}
            <div className="position-relative shadow-sm bg-white" style={{ width: '436px', height: '470px', flexShrink: 0, overflow: 'hidden', borderRadius: '12px' }}>
              
              {item.isCompleted && (
                  <div className="completed-badge" style={{ zIndex: 25 }}>
                    <i className="bi bi-check-lg me-1"></i> Виконано
                  </div>
              )}

              {!item.isCompleted && isWishReserved && (
                <>
                  {hasIndividualReservation && (
                    <div className="completed-badge reserved" style={{ zIndex: 25 }}>
                      <i className="bi bi-lock-fill me-1"></i> Заброньовано
                    </div>
                  )}
                  {hasGroupReservation && (
                    <div className="completed-badge reserved" style={{ zIndex: 25, backgroundColor: '#8A60C2' }}>
                      <i className="bi bi-lock-fill me-1"></i> Заброньовано: {currentParticipants} з {maxParticipants}
                    </div>
                  )}
                </>
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
                
                {/* Меню редагування показується виключно власнику */}
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

              {item.description && item.description.trim() !== "" && (
                <div className="mb-5">
                  <p style={{ fontSize: '1.2rem', color: '#4C4C4C', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.description}
                  </p>
                </div>
              )}

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

              {/* Кнопка «Виконати» показується ТІЛЬКИ власнику */}
              {isOwner && (
                  <button
                    className={`btn mt-2 w-100 d-flex align-items-center justify-content-center transition-all ${item.isCompleted ? 'btn-wish-completed' : 'btn-wish-action'}`}
                    style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none' }}
                    onClick={toggleStatus}
                  >
                    {item.isCompleted ? 'Зробити active' : 'Виконати'}
                  </button>
              )}

              {/* Блок інтерфейсу та кнопок для ГОСТЯ */}
              {!isOwner && !item.isCompleted && (
                <>
                  {!isWishReserved && (
                    <button
                      className="btn mt-2 w-100 d-flex align-items-center justify-content-center text-white"
                      style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none', backgroundColor: '#8A60C2' }}
                      onClick={handleReserveClick}
                    >
                      Забронювати
                    </button>
                  )}

                  {hasGroupReservation && item.participantEmails && item.participantEmails.length > 0 && (
                    <div className="mt-4 mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: '#4C4C4C' }}>Учасники спільного бронювання</h6>
                      <div className="bg-white border p-2 px-3 w-100" style={{ borderRadius: '8px', boxSizing: 'border-box' }}>
                        <div className="d-flex flex-column gap-2">
                          {item.participantEmails.map((email, index) => (
                            <span key={index} className="text-muted text-break" style={{ display: 'block', fontSize: '14px' }}>
                              {email}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {hasGroupReservation && !isGroupFilled && !item.isCurrentUserParticipant && (
                    <button
                      className="btn mt-2 w-100 d-flex align-items-center justify-content-center text-white"
                      style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none', backgroundColor: '#8A60C2' }}
                      onClick={handleJoinClick}
                    >
                      Долучитися
                    </button>
                  )}

                  {/* Кнопка скасування бронювання (або виходу з групи) для поточного користувача */}
                  {((hasGroupReservation && item.isCurrentUserParticipant) || (hasIndividualReservation && item.isCurrentUserParticipant) || isFromBooked) && (
                    <button
                      className="btn mt-2 w-100 d-flex align-items-center justify-content-center border-0"
                      style={{ 
                        height: '40px', 
                        borderRadius: '8px', 
                        fontWeight: '600', 
                        backgroundColor: '#E6DAF6', 
                        color: '#8A60C2',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setShowCancelModal(true)}
                    >
                      Скасувати бронювання
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>

        {/* Модальні вікна бронювання */}
        <ReserveWishModal
          show={showReserveModal}
          initialMode={reserveModalMode}
          wishId={itemId}
          shareToken={effectiveShareToken} 
          selectedWish={item}
          onClose={() => setShowReserveModal(false)}
          onSuccess={() => {
            setShowReserveModal(false);
            fetchWishData(); 
          }}
        />

        <CancelReservationModal
          show={showCancelModal}
          reservationType={item.reservationType || 'INDIVIDUAL'} 
          isLoading={isCanceling}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelReservation}
        />

        {/* Модалки редагування/видалення доступні ТІЛЬКИ власнику */}
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