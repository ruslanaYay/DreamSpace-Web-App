import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';
import { EditWishItemModal } from '../components/EditWishItemModal'; 
import { DeleteWishModal } from './DeleteWishModal';
import { Pagination } from '../components/Pagination'; // Імпортуємо пагінацію
import "../App.css";

export const WishlistDetails = () => {
  const { id, shareToken } = useParams();
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // Додаємо стейт для перевірки прав

  // --- СТАН ДЛЯ ПАГІНАЦІЇ БАЖАНЬ ---
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isEditWishModalOpen, setIsEditWishModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, wishId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Нові стани для модального вікна бронювання
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveWishId, setReserveWishId] = useState(null);
  const [isReserving, setIsReserving] = useState(false); // Стан loading для кнопки «Підтвердити»

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
      
      const initialSize = (page === 0 && !shareToken) ? 14 : 15;

      if (shareToken) {
        wishlistUrl = `http://localhost:8085/api/wishlists/share/${shareToken}`;
        wishesUrl = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes?page=${page}&size=${initialSize}`;
      } else {
        wishlistUrl = `http://localhost:8085/api/wishlists/${id}`;
        wishesUrl = `http://localhost:8085/api/wishlists/${id}/wishes?page=${page}&size=${initialSize}&sort=id,desc`;
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
      
      if (page === 0 && calculatedIsOwner && initialSize === 15 && shareToken) {
        const correctWishesUrl = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes?page=${page}&size=14`;
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

  // 2. Функція поширення (БЕЗ ДУБЛЮВАННЯ НАЗВИ)
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  const handleReserveClick = (e, wishId) => {
    e.preventDefault();
    e.stopPropagation();

    // Перевірка авторизації користувача
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setReserveWishId(wishId);
    setShowReserveModal(true);
  };

  const handleConfirmReservation = async () => {
    if (!reserveWishId || isReserving) return;
    
    setIsReserving(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${reserveWishId}/reserve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservationType: "INDIVIDUAL",
          maxParticipants: 1,
          email: null
        })
      });

      const resData = await response.json();

      if (response.ok) {
        // Оновлюємо стан обраного бажання локально на основі отриманої відповіді від бекенду
        setWishes(prevWishes => 
          prevWishes.map(wish => 
            wish.id === reserveWishId ? { ...wish, isReserved: true, reservationType: "INDIVIDUAL" } : wish
          )
        );
        setShowReserveModal(false);
        setReserveWishId(null);
      } else {
        // Обробка помилок відповідно до специфікації API
        alert(resData.message || "Помилка при бронюванні бажання");
        if (response.status === 410 || response.status === 404 || response.status === 400) {
          fetchWishlistData(currentPage); // Перезавантажуємо актуальний стан позицій
        }
        setShowReserveModal(false);
        setReserveWishId(null);
      }
    } catch (err) {
      console.error("Помилка при бронюванні бажання:", err);
      alert("Не вдалося з'єднатися з сервером");
    } finally {
      setIsReserving(false);
    }
  };

  if (loading && !wishlist) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error === 'Вішліст не знайдено або доступ заборонено' || error === 'Вішліст не знайдено') {
    return (
      <div className="error-page-wrapper">
        <div className="access-denied-container">
          <svg 
            className="ban-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <p className="access-denied-text">
            Ви не можете переглядати цей вішліст
          </p>
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
      <div className="wishes-grid">
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
          // Якщо бекенд не дає isReserved на роуті власника, 
          // перевіряємо наявність заповненого reservationType або reservationId
          const isWishReserved = wish.isReserved === true || !!wish.reservationType || !!wish.reservationId;

          return (
            <div key={wish.id} className="wish-item-wrapper">
              <Link to={shareToken
                    ? `/wishlist/share/${shareToken}/wish/${wish.id}`
                    : `/wish-items/${wish.id}`} className="text-decoration-none text-dark h-100">
                <div className="wish-item-card h-100 position-relative">
                  
                  {/* Бейдж: Виконано */}
                  {wish.isCompleted && (
                    <div className="completed-badge" style={{ zIndex: 45 }}>
                      <i className="bi bi-check-lg me-1"></i> Виконано
                    </div>
                  )}

                  {/* Відображення бейджа «Заброньовано» на основі комбінованої перевірки */}
                  {!wish.isCompleted && isWishReserved && (
                    <div className="completed-badge reserved" style={{ zIndex: 45 }}>
                      <i className="bi bi-lock-fill me-1"></i> Заброньовано
                    </div>
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
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="#8A60C2" 
                            strokeWidth="2.8" 
                            strokeLinecap="round"
                            className="completed-flower"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <line x1="12" y1="5" x2="12" y2="2" />
                            <line x1="12" y1="22" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="2" y2="12" />
                            <line x1="22" y1="12" x2="19" y2="12" />
                            <line x1="17" y1="17" x2="19.1" y2="19.1" />
                            <line x1="4.9" y1="4.9" x2="7" y2="7" />
                            <line x1="17" y1="7" x2="19.1" y2="4.9" />
                            <line x1="4.9" y1="19.1" x2="7" y2="17" />
                          </svg>
                        ) : (
                          <i className="bi bi-check-lg"></i>
                        )}

                        <div className="custom-tooltip">
                          {wish.isCompleted ? "Повернути бажання в активний стан" : "Позначити бажання як виконане"}
                        </div>
                      </div>
                    ) : (
                      /* Для гостей: Показувати кнопку тільки якщо не заброньовано і не виконано */
                      !wish.isCompleted && !isWishReserved && (
                        <button
                          className="btn d-flex align-items-center justify-content-center text-white"
                          style={{ 
                            width: '127px', 
                            height: '32px', 
                            borderRadius: '8px', 
                            fontWeight: '500', 
                            fontSize: '14px',
                            border: '1px solid #8A60C2', 
                            backgroundColor: 'rgba(106, 69, 156, 0.52)', 
                            position: 'absolute', 
                            bottom: '12px', 
                            right: '12px', 
                            zIndex: 10,
                            padding: '0'
                        }}
                          onClick={(e) => handleReserveClick(e, wish.id)}
                        >
                          Забронювати
                        </button>
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
      </div>

      {/* МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ */}
      {showReserveModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}
             onClick={() => setShowReserveModal(false)}>
          <div className="bg-white position-relative shadow d-flex flex-column align-items-center justify-content-between p-4" 
               style={{ width: '576px', height: '209px', borderRadius: '16px' }}
               onClick={(e) => e.stopPropagation()}>
            
            <button className="btn border-0 position-absolute p-1 bg-transparent" 
                    style={{ right: '20px', top: '16px' }}
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
                      onClick={() => setShowReserveModal(false)}
                      disabled={isReserving}>
                Скасувати
              </button>
              <button className="btn d-flex align-items-center justify-content-center border-0" 
                      style={{ width: '250px', height: '40px', backgroundColor: '#8A60C2', color: '#F5F5F5', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}
                      onClick={handleConfirmReservation}
                      disabled={isReserving}>
                {isReserving ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  "Підтвердити"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* --- ДОДАНИЙ БЛОК ПОВІДОМЛЕННЯ --- */}
      {showToast && (
        <div className="toast-container-fixed">
          <div className="custom-toast-v2 d-flex align-items-center justify-content-center shadow-sm">
            <span className="toast-text">Посилання на вішліст скопійовано!</span>
          </div>
        </div>
      )}

      {/* Модалки */}
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