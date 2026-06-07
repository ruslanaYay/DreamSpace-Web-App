import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';
import { EditWishItemModal } from '../components/EditWishItemModal'; 
import { DeleteWishModal } from '../components/DeleteWishModal';
import { Pagination } from '../components/Pagination'; 
import { ReserveWishModal } from '../components/ReserveWishlistModal';
import { CancelReservationModal } from '../components/CancelReservationModal';
import "../App.css";

export const WishlistDetails = () => {
  const { id, shareToken } = useParams();
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false); 

  // --- СТАН ДЛЯ ПАГІНАЦІЇ БАЖАНЬ ---
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isEditWishModalOpen, setIsEditWishModalOpen] = useState(false); // Виправлено назву відповідно до виклику
  const [selectedWish, setSelectedWish] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, wishId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- СТАН ДЛЯ СКАСУВАННЯ УЧАСТІ В БРОНЮВАННІ ---
  const [cancelModal, setCancelModal] = useState({ show: false, wishId: null, reservationId: null, reservationType: null });
  const [isCanceling, setIsCanceling] = useState(false);

  const itemsPerPage = 15;

  // --- СТАН КЕРУВАННЯ МОДАЛКОЮ БРОНЮВАННЯ ---
  const [reserveModalConfig, setReserveModalConfig] = useState({
    show: false,
    mode: null, 
    wishId: null,
    wishData: null
  });

  // 1. Завантаження даних вішліста та його бажань з пагінацією
  const fetchWishlistData = async (page = 0) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
      setLoading(true);
      let wishlistUrl, wishesUrl;
      const currentSize = 15; // Ваша правильна константа

      if (shareToken) {
        wishlistUrl = `http://localhost:8085/api/wishlists/share/${shareToken}`;
        // ВИПРАВЛЕНО: замінено initialSize на currentSize
        wishesUrl = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes?page=${page}&size=${currentSize}`;
      } else {
        wishlistUrl = `http://localhost:8085/api/wishlists/${id}`;
        // ВИПРАВЛЕНО: замінено initialSize на currentSize
        wishesUrl = `http://localhost:8085/api/wishlists/${id}/wishes?page=${page}&size=${currentSize}&sort=id,desc`;
      }

      const [wishlistResponse, wishesResponse] = await Promise.all([
        fetch(wishlistUrl, { method: 'GET', headers }),
        fetch(wishesUrl, { method: 'GET', headers })
      ]);

      if (!wishlistResponse.ok) throw new Error('Вішліст не знайдено');
      
      const resData = await wishlistResponse.json();
      let wishesPageData = await wishesResponse.json();

      let calculatedIsOwner = false;
      if (shareToken) {
        const actualWishlist = resData.wishlist || resData;
        setWishlist(actualWishlist);
        calculatedIsOwner = resData.isOwner === true;
        setIsOwner(calculatedIsOwner);
      } else {
        setWishlist(resData);
        calculatedIsOwner = true;
        setIsOwner(true);
      }
      
      // ВИПРАВЛЕНО: Перевірка умови також переведена на currentSize замість initialSize
      if (page === 0 && calculatedIsOwner && currentSize === 15 && shareToken) {
        const correctWishesUrl = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes?page=${page}&size=15`;
        const correctWishesRes = await fetch(correctWishesUrl, { method: 'GET', headers });
        if (correctWishesRes.ok) {
          wishesPageData = await correctWishesRes.json();
        }
      }

      setWishes(wishesPageData.content || []);
      setTotalPages(wishesPageData.totalPages || 0);
      setTotalElements(wishesPageData.totalElements || 0);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Функція поширення
  const handleShare = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Увійдіть в обліковий запис");
      return;
    }

    const currentId = id || wishlist?.id;
    if (!currentId) return;

    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/${currentId}/share-link`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.shareLink);
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Помилка при отриманні посилання");
      }
    } catch (err) {
      console.error("Помилка копіювання:", err);
    }
  };

  useEffect(() => {
    fetchWishlistData(currentPage);
  }, [id, shareToken, currentPage]);

  const openDeleteModal = (wishId) => {
    setDeleteModal({ show: true, wishId: wishId });
    setActiveMenuId(null); 
  };

  const closeDeleteModal = () => {
    if (!isDeleting) setDeleteModal({ show: false, wishId: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.wishId) return;
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishes/${deleteModal.wishId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 204 || response.ok) {
        setDeleteModal({ show: false, wishId: null });
        fetchWishlistData(currentPage);
      }
    } catch (err) {
      console.error("Помилка:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleWishStatus = async (e, wishId) => {
    e.preventDefault(); e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishes/${wishId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchWishlistData(currentPage);
      }
    } catch (err) { console.error(err); }
  };

  const handleReserveClick = (e, wish) => {
    e.preventDefault(); e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setReserveModalConfig({
      show: true,
      mode: 'RESERVE',
      wishId: wish.id,
      wishData: wish
    });
  };

  const handleJoinClick = (e, wish) => {
    e.preventDefault(); e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setReserveModalConfig({
      show: true,
      mode: 'JOIN',
      wishId: wish.id,
      wishData: wish
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  const handleCancelClick = (e, wish) => {
  if (e) {
    e.preventDefault(); 
    e.stopPropagation();
  }

  // Виведемо об'єкт у консоль, щоб точно знати, де лежить ID
  console.log("Клікнули на скасування бажання (WISH):", wish);
  
  // Безпечно витягуємо ID та ТИП
  const rId = wish.reservationId || wish.reservation?.id || wish.reservation?.reservationId;
  const rType = wish.reservationType || wish.reservation?.type;
  
  setCancelModal({ 
    show: true, 
    wishId: wish.id, 
    reservationId: rId, 
    reservationType: rType
  });
};

  const handleCancelReservationConfirm = async () => {
    // Валідація на фронтенді (не пускаємо запит, якщо ID кривий)
    if (!cancelModal.reservationId || cancelModal.reservationId === "undefined" || cancelModal.reservationId === "null") {
      alert(`Критична помилка фронтенду:\nНе вдалося отримати ID бронювання з об'єкта бажання.\nID в стейті: ${cancelModal.reservationId}\nТип: ${cancelModal.reservationType}\n\nБудь ласка, перевірте вкладку Console (F12), що саме приходить з сервера.`);
      return;
    }
    
    setIsCanceling(true);
    const token = localStorage.getItem('token');
    const isGroup = cancelModal.reservationType === "GROUP";

    const url = isGroup 
      ? `http://localhost:8085/api/reservations/${cancelModal.reservationId}/leave`
      : `http://localhost:8085/api/reservations/${cancelModal.reservationId}`;

    try {
      console.log("=== ТЕСТ СКАСУВАННЯ ===");
      console.log("ID Бронювання:", cancelModal.reservationId);
      console.log("Тип:", cancelModal.reservationType);
      console.log("URL запиту:", url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Статус відповіді сервера:", response.status);

      // --- 1. ОБРОБКА ПОМИЛОК АВТОРИЗАЦІЇ ТА ДОСТУПУ ---
      if (response.status === 401) {
        alert("Увійдіть в обліковий запис для виконання цієї дії.");
        navigate('/login');
        return;
      }

      if (response.status === 403) {
        // Навіть у разі помилки 403 сервер може віддати порожній текст або JSON
        const errData = await response.json().catch(() => ({}));
        alert(`Помилка 403 Forbidden!\nПовідомлення сервера: ${errData.message || "Доступ заборонено (Ви не є ініціатором цього бронювання)"}`);
        setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null });
        return;
      }

      if (response.status === 404) {
        alert("Помилка 404 Not Found!\nБронювання не знайдено на сервері або вже скасовано.");
        setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null });
        return;
      }

      // --- 2. УСПІШНЕ ІНДИВІДУАЛЬНЕ СКАСУВАННЯ (БЕЗ СПРОБ ЧИТАТИ ПУСТОТУ) ---
      if (!isGroup && (response.status === 204 || response.status === 200)) {
        // Оновлюємо інтерфейс локально, оскільки індивідуальне бронювання просто видаляється
        setWishes(prevWishes => 
          prevWishes.map(wish => {
            if (wish.id === cancelModal.wishId) {
              return {
                ...wish,
                isReserved: false,
                reservationId: null,
                reservationType: null,
                maxParticipants: null,
                currentParticipants: null,
                isCurrentUserParticipant: false,
                participantEmails: []
              };
            }
            return wish;
          })
        );
        setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null });
        return;
      }

      // --- 3. УСПІШНЕ СПІЛЬНЕ СКАСУВАННЯ (ЛОГІКА ЗАЛИШИЛАСЬ НЕДОТОРКАНОЮ) ---
      if (isGroup && response.status === 200) {
        // Зберігаємо оригінальну поведінку зчитування JSON через проміжний текст
        let serverMessage = "";
        try {
          const errData = await response.json();
          serverMessage = errData.message || JSON.stringify(errData);
        } catch (e) {
          serverMessage = response.statusText;
        }

        try {
          const resData = JSON.parse(serverMessage);
          setWishes(prevWishes => 
            prevWishes.map(wish => {
              if (wish.id === cancelModal.wishId) {
                if (resData.reservationId === null || !resData.reservationId) {
                  return {
                    ...wish,
                    isReserved: false,
                    reservationId: null,
                    reservationType: null,
                    maxParticipants: null,
                    currentParticipants: null,
                    isCurrentUserParticipant: false,
                    participantEmails: []
                  };
                } 
                return {
                  ...wish,
                  reservationId: resData.reservationId,
                  reservationType: resData.reservationType,
                  maxParticipants: resData.maxParticipants,
                  currentParticipants: resData.currentParticipants,
                  isCurrentUserParticipant: false,
                  participantEmails: wish.participantEmails 
                    ? wish.participantEmails.filter(email => email !== localStorage.getItem('userEmail')) 
                    : []
                };
              }
              return wish;
            })
          );
        } catch (e) {
          console.error("Помилка парсингу JSON спільного скасування", e);
        }
        setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null });
        return;
      }

      // Якщо статус якийсь інший (наприклад, 400 або 500 з боку Spring)
      const errBody = await response.json().catch(() => ({}));
      alert(`Помилка сервера!\nСтатус: ${response.status}\nТекст: ${errBody.message || "Неочікувана помилка"}`);
      setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null });

    } catch (err) {
      console.error("Критична помилка на фронтенді:", err);
      alert("Не вдалося зв'язатися з сервером. Перевірте з'єднання.");
    } finally {
      setIsCanceling(false);
    }
  };
  
  if (loading && !wishlist) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error === 'Вішліст не знайдено або доступ заборонено' || error === 'Вішліст не знайдено') {
    return (
      <div className="error-page-wrapper">
        <div className="access-denied-container">
          <svg className="ban-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <p className="access-denied-text">Ви не можете переглядати цей вішліст</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#F3F8FE' }}>
      
      {/* Шапка */}
      <div className={`d-flex align-items-center mb-1 ${shareToken ? 'ps-5' : ''}`}>
        {!shareToken && (
          <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 shadow-none">
            <i className="bi bi-arrow-left fs-3"></i>
          </button>
        )}
        
        <div className="d-flex align-items-center">
          <h2 className="fw-bold mb-0 me-2 text-dark" style={{ fontFamily: 'Raleway, sans-serif' }}>
            {wishlist?.name}
          </h2>
          
          {isOwner && (
            <div className="d-flex align-items-center gap-2">
              <button className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
                onClick={() => setIsEditListModalOpen(true)}
                style={{ width: '32px', height: '32px', backgroundColor: '#F0F0F0', borderRadius: '8px' }}>
                <i className="bi bi-pencil-fill text-muted" style={{ fontSize: '14px' }}></i>
              </button>
              <button className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
                onClick={handleShare}
                style={{ width: '32px', height: '32px', backgroundColor: '#F0F0F0', borderRadius: '8px' }}>
                <i className="bi bi-share-fill text-muted" style={{ fontSize: '14px' }}></i>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-muted mb-5 header-description ms-5">
        {wishlist?.description}
      </p>

      {/* Сітка бажань */}
      <div className="wishes-grid mb-5">
        {isOwner && currentPage === 0 && (
          <div className="wish-item-card add-new-card" onClick={() => navigate(`/wishlists/${id}/add-item`)}>
            <div className="wish-image-container d-flex align-items-center justify-content-center">
              <div className="plus-circle">
                <i className="bi bi-plus-lg text-white fs-4"></i>
              </div>
            </div>
          </div>
        )}

        {wishes.map((wish) => {
          const hasIndividualReservation = wish.isReserved === true && wish.reservationType === "INDIVIDUAL";
          const hasGroupReservation = wish.isReserved === true && wish.reservationType === "GROUP";
          const currentParticipants = wish.currentParticipants || 0;
          const maxParticipants = wish.maxParticipants || 1;
          const isGroupFilled = currentParticipants >= maxParticipants;
          const isWishReserved = wish.isReserved === true;

          return (
            <div key={wish.id} className="wish-item-wrapper">
              <Link to={shareToken
                  ? `/wishlist/share/${shareToken}/wish/${wish.id}`
                  : `/wish-items/${wish.id}`} className="text-decoration-none text-dark h-100">
                <div className="wish-item-card h-100 position-relative">
                  
                  {wish.isCompleted && (
                    <div className="completed-badge" style={{ zIndex: 45 }}>
                      <i className="bi bi-check-lg me-1"></i> Виконано
                    </div>
                  )}

                  {!wish.isCompleted && (
                    <>
                      {hasIndividualReservation && (
                        <div className="completed-badge reserved" style={{ zIndex: 45 }}>
                          <i className="bi bi-lock-fill me-1"></i> Заброньовано
                        </div>
                      )}
                      
                      {hasGroupReservation && (
                        <div className="completed-badge reserved" style={{ zIndex: 45, backgroundColor: '#8A60C2' }}>
                          <i className="bi bi-lock-fill me-1"></i> Заброньовано: {currentParticipants} з {maxParticipants}
                        </div>
                      )}
                    </>
                  )}

                  {isOwner && (
                    <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 50 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === wish.id ? null : wish.id); }}>
                      <button className="btn border-0 p-1 shadow-none bg-transparent">
                        <i className="bi bi-three-dots fs-4 text-dark"></i>
                      </button>
                      {activeMenuId === wish.id && (
                         <div className="position-absolute shadow bg-white" style={{ top: '40px', right: '0px', zIndex: 110, borderRadius: '12px', minWidth: '160px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                            <div className="d-flex flex-column text-start">
                              <div className="px-3 py-2 text-dark menu-hover-effect" 
                                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedWish(wish); setIsEditWishModalOpen(true); setActiveMenuId(null); }} 
                                   style={{ cursor: 'pointer', fontSize: '14px' }}>
                                Редагувати
                              </div>
                              <div style={{ height: '1px', backgroundColor: '#eee', margin: '0 10px' }}></div>
                              <div className="px-3 py-2 text-dark menu-hover-effect" 
                                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteModal(wish.id); setActiveMenuId(null); }} 
                                   style={{ cursor: 'pointer', fontSize: '14px' }}>
                                Видалити
                              </div>
                            </div>
                         </div>
                      )}
                    </div>
                  )}

                  <div className="wish-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
                    {wish.imageUrl ? (
                      <img src={wish.imageUrl} alt={wish.name} className="wish-main-img" />
                    ) : (
                      <div className="image-placeholder"><i className="bi bi-image fs-1 opacity-25"></i></div>
                    )}
                    
                    <div className="priority-emoji">
                      <i className={`bi ${getPriorityIcon(wish.priority)}`}></i>
                    </div>

                    {isOwner ? (
                      <div 
                        className={`icon-button-instance ${wish.isCompleted ? 'is-completed' : ''}`}
                        onClick={(e) => toggleWishStatus(e, wish.id)} 
                        style={{ zIndex: 40 }}
                      >
                        {wish.isCompleted ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A60C2" strokeWidth="2.8" strokeLinecap="round" className="completed-flower" style={{ display: 'flex', alignItems: 'center', justifyCONtent: 'center' }}>
                            <line x1="12" y1="5" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="19" /><line x1="5" y1="12" x2="2" y2="12" /><line x1="22" y1="12" x2="19" y2="12" /><line x1="17" y1="17" x2="19.1" y2="19.1" /><line x1="4.9" y1="4.9" x2="7" y2="7" /><line x1="17" y1="7" x2="19.1" y2="4.9" /><line x1="4.9" y1="19.1" x2="7" y2="17" />
                          </svg>
                        ) : (
                          <i className="bi bi-check-lg"></i>
                        )}
                        <div className="custom-tooltip">
                          {wish.isCompleted ? "Повернути бажання в активний стан" : "Позначити бажання як виконане"}
                        </div>
                      </div>
                    ) : (
                      !wish.isCompleted && (
                        <>
                          {((wish.isCurrentUserParticipant && hasGroupReservation) || (wish.isCurrentUserParticipant && hasIndividualReservation)) ? (
                            <button
                              className="btn d-flex align-items-center justify-content-center"
                              style={{ width: '127px', height: '32px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid rgba(220, 54, 46, 0.8)', backgroundColor: 'rgba(244, 129, 124, 0.48)', color: '#f5f5f5', position: 'absolute', bottom: '12px', right: '12px', zIndex: 10, padding: '0' }}
                              onClick={(e) => handleCancelClick(e, wish)}
                            >
                              Скасувати
                            </button>
                          ) : (
                            <>
                              {!isWishReserved && wish.reservationType !== "GROUP" && (
                                <button
                                  className="btn d-flex align-items-center justify-content-center text-white"
                                  style={{ width: '127px', height: '32px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid #8A60C2', backgroundColor: 'rgba(106, 69, 156, 0.52)', position: 'absolute', bottom: '12px', right: '12px', zIndex: 10, padding: '0' }}
                                  onClick={(e) => handleReserveClick(e, wish)}
                                >
                                  Забронювати
                                </button>
                              )}

                              {hasGroupReservation && !isGroupFilled && (
                                <button
                                  className="btn d-flex align-items-center justify-content-center text-white"
                                  style={{ width: '127px', height: '32px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid #8A60C2', backgroundColor: 'rgba(106, 69, 156, 0.52)', position: 'absolute', bottom: '12px', right: '12px', zIndex: 10, padding: '0' }}
                                  onClick={(e) => handleJoinClick(e, wish)}
                                >
                                  Долучитися
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )
                    )}
                  </div>
                  
                  <div className="wish-card-footer">
                    <h6 className="wish-name text-truncate fw-bold">{wish.name}</h6>
                    <p className="wish-price mb-0">₴{wish.price ? wish.price.toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
        {currentPage === 0 && totalPages > 1 && (
        <div 
          className="d-flex align-items-center justify-content-between px-5 position-relative overflow-hidden shadow-sm animate-fade-in" 
          style={{ 
            background: 'linear-gradient(93.28deg, #E8EEFF 0%, #F3F7FF 100%)', 
            borderRadius: '24px', 
            border: '1px dashed rgba(138, 96, 194, 0.25)',
            width: '1116px',        // Займає рівно 100% ширини за рівнем карток
            height: '320px',      // Зберігаємо пропорційну висоту з вашого макета
            marginBottom: '3rem'
          }}
        >
          {/* Текстовий контент */}
          <div className="d-flex flex-column justify-content-center text-start position-relative" style={{ zIndex: 5, maxWidth: '60%' }}>
            <h3 className="fw-bold mb-2" style={{ color: '#7E53C5', fontFamily: 'Raleway, sans-serif', fontSize: '2.1rem', letterSpacing: '-0.02em' }}>
              Це лише початок...
            </h3>
            <p className="m-0 text-secondary" style={{ fontSize: '1.25rem', fontWeight: '500', opacity: 0.85 }}>
              Зустрінемося на наступній сторінці
            </p>
          </div>

          {/* SVG Комети з автоматичним масштабуванням до правого краю */}
          <div className="position-absolute end-0 top-0 bottom-0 h-100 w-100 pointer-events-none" style={{ zIndex: 1, overflow: 'hidden' }}>
            <svg className="w-100 h-100" viewBox="0 0 831 347" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
              <path d="M690,175 Q420,110 180,220 Q480,200 300,280 Q480,200 690,175 Z" fill="url(#cometGradient)" opacity="0.85"/>
              <path d="M710,175 Q460,70 220,150 Q520,140 360,190 Q520,140 710,175 Z" fill="url(#cometGradient)" opacity="0.6"/>
              
              <g fill="#FFFFFF" opacity="0.9">
                <path d="M 310 190 L 314 194 L 310 198 L 306 194 Z" />
                <path d="M 420 135 L 424 139 L 420 143 L 416 139 Z" />
                <path d="M 550 150 L 554 154 L 550 158 L 546 154 Z" />
                <path d="M 610 210 L 613 213 L 610 216 L 607 213 Z" />
              </g>
              
              <defs>
                <linearGradient id="cometGradient" x1="180" y1="200" x2="700" y2="175" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A682FF" stopOpacity="0"/>
                  <stop offset="55%" stopColor="#966FD6" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#7E53C5" stopOpacity="0.85"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Головна акцентна зірка, чітко притиснута до правого краю банера */}
          <div className="position-absolute end-0 top-50 translate-middle-y me-5 d-flex align-items-center justify-content-center" style={{ zIndex: 3, width: '160px', height: '160px' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0 L54 36 L90 14 L62 42 L100 50 L62 58 L90 86 L54 64 L50 100 L46 64 L10 86 L38 58 L0 50 L38 42 L10 14 L46 36 Z" fill="#7E53C5" />
            </svg>
          </div>
        </div>
      )}
      </div>
      
      {/* Модалки та інші компоненти */}
      <ReserveWishModal 
        show={reserveModalConfig.show}
        initialMode={reserveModalConfig.mode}
        wishId={reserveModalConfig.wishId}
        selectedWish={reserveModalConfig.wishData}
        shareToken={shareToken}
        id={id}
        onClose={() => setReserveModalConfig({ show: false, mode: null, wishId: null, wishData: null })}
        setWishes={setWishes}
        fetchWishlistData={fetchWishlistData}
        currentPage={currentPage}
        navigate={navigate}
      />

      <CancelReservationModal
        show={cancelModal.show}
        isLoading={isCanceling}
        reservationType={cancelModal.reservationType}
        onClose={() => !isCanceling && setCancelModal({ show: false, wishId: null, reservationId: null, reservationType: null })}
        onConfirm={handleCancelReservationConfirm}
      />

      {/* ПАГІНАЦІЯ БАЖАНЬ */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination 
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page - 1)}
          />
        </div>
      )}

      {showToast && (
        <div className="toast-container-fixed">
          <div className="custom-toast-v2 d-flex align-items-center justify-content-center shadow-sm">
            <span className="toast-text">Посилання на вішліст скопійовано!</span>
          </div>
        </div>
      )}

      <EditWishlistModal 
        show={isEditListModalOpen}
        wishlistData={wishlist}
        onClose={() => setIsEditListModalOpen(false)}
        onUpdate={(updated) => setWishlist(updated)}
      />
      <EditWishItemModal 
        show={isEditWishModalOpen} 
        wishData={selectedWish} 
        onClose={() => setIsEditWishModalOpen(false)}
        onUpdate={() => fetchWishlistData(currentPage)}
      />
      <DeleteWishModal 
        show={deleteModal.show}
        isLoading={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};