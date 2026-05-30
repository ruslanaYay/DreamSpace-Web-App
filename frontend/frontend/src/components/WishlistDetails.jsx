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
  const itemsPerPage = 11;

  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isEditWishModalOpen, setIsEditWishModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, wishId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 1. Завантаження даних вішліста та його бажань з пагінацією
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
      
      if (shareToken) {
        wishlistUrl = `http://localhost:8085/api/wishlists/share/${shareToken}`;
        wishesUrl = `http://localhost:8085/api/wishlists/share/${shareToken}/wishes?page=${page}&size=${itemsPerPage}`;
      } else {
        wishlistUrl = `http://localhost:8085/api/wishlists/${id}`;
        wishesUrl = `http://localhost:8085/api/wishlists/${id}/wishes?page=${page}&size=${itemsPerPage}&sort=id,desc`;
      }

      const [wishlistResponse, wishesResponse] = await Promise.all([
        fetch(wishlistUrl, { method: 'GET', headers }),
        fetch(wishesUrl, { method: 'GET', headers })
      ]);

      if (!wishlistResponse.ok) throw new Error('Вішліст не знайдено');
      
      const resData = await wishlistResponse.json();
      const wishesPageData = await wishesResponse.json();

      if (shareToken) {
        const actualWishlist = resData.wishlist || resData;
        setWishlist(actualWishlist);
        setIsOwner(resData.isOwner === true);
      } else {
        setWishlist(resData);
        setIsOwner(true);
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
        
        // Показуємо тост
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

  // Функції керування (видалення, статус тощо)
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
        fetchWishlistData(currentPage); // Оновлюємо сторінку
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

  if (loading && !wishlist) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error === 'Вішліст не знайдено або доступ заборонено' || error === 'Вішліст не знайдено') {
  return (
    <div className="error-page-wrapper">
      <div className="access-denied-container">
        {/* Використовуємо SVG для точного відображення іконки ban */}
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
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /> {/* Лінія з верхнього лівого в нижній правий */}
        </svg>
        
        <p className="access-denied-text">
          Ви не можете переглядати цей вішліст
        </p>
      </div>
    </div>
  );
}
  console.log("Token from URL:", shareToken);

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#F3F8FE' }}>
      
{/* Шапка */}
    <div className={`d-flex align-items-center mb-1 ${shareToken ? 'ps-5' : ''}`}>
      {/* Кнопка назад: рендериться ТІЛЬКИ якщо немає токена */}
      {!shareToken && (
        <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 shadow-none">
          <i className="bi bi-arrow-left fs-3"></i>
        </button>
      )}
      
      <div className="d-flex align-items-center">
        <h2 className="fw-bold mb-0 me-2 text-dark" style={{ fontFamily: 'Raleway, sans-serif' }}>
          {wishlist?.name}
        </h2>
        
        {/* Кнопки керування (якщо власник) */}
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
    
    {/* Опис: завжди ms-5, щоб збігатися з назвою */}
    <p className="text-muted mb-5 header-description ms-5">
      {wishlist?.description}
    </p>

      {/* Сітка бажань */}
      <div className="wishes-grid">
        {isOwner && (
          /* Умовний рендеринг: Картка створення відображається тільки власнику */
          <div className="wish-item-card add-new-card" onClick={() => navigate(`/wishlists/${id}/add-item`)}>
            <div className="wish-image-container d-flex align-items-center justify-content-center">
              <div className="plus-circle">
                <i className="bi bi-plus-lg text-white fs-4"></i>
              </div>
            </div>
          </div>
        )}

        {wishes.map((wish) => (
  <div key={wish.id} className="wish-item-wrapper">
    <Link to={shareToken
          ? `/wishlist/share/${shareToken}/wish/${wish.id}`
          : `/wish-items/${wish.id}`} className="text-decoration-none text-dark h-100">
      <div className="wish-item-card h-100 position-relative">
        
        {/* Показуємо зелений бейдж "Виконано" зверху тільки якщо бажання виконане */}
        {wish.isCompleted && (
          <div className="completed-badge">
            <i className="bi bi-check-lg me-1"></i> Виконано
          </div>
        )}

        {/* Три крапки (меню) тільки для власника */}
        {isOwner && (
          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 40 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === wish.id ? null : wish.id); }}>
            <button className="btn border-0 p-1 shadow-none bg-transparent">
              <i className="bi bi-three-dots fs-4 text-dark"></i>
            </button>
            {activeMenuId === wish.id && (
              <div className="dropdown-menu-custom">
                <button className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedWish(wish); setIsEditWishModalOpen(true); setActiveMenuId(null); }}>
                  Редагувати
                </button>
                <button className="dropdown-item text-danger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteModal(wish.id); setActiveMenuId(null); }}>
                  Видалити
                </button>
              </div>
            )}
          </div>
        )}

        {/* Контейнер зображення */}
        <div className="wish-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
          {wish.imageUrl ? (
            <img src={wish.imageUrl} alt={wish.name} className="wish-main-img" />
          ) : (
            <div className="image-placeholder"><i className="bi bi-image fs-1 opacity-25"></i></div>
          )}
          
          <div className="priority-emoji">
            <i className={`bi ${getPriorityIcon(wish.priority)}`}></i>
          </div>

          {/* ЛОГІКА ГАЛОЧОК: */}
          {isOwner && (
            /* Власник бачить кнопку перемикання статусу (на фото) */
            <div className="icon-button-instance" onClick={(e) => toggleWishStatus(e, wish.id)}>
              {wish.isCompleted ? <i className="bi bi-flower1"></i> : <i className="bi bi-check-lg"></i>}
            </div>
          )}
          
          {/* Гість НЕ бачить ніяких додаткових галочок поверх фото, 
              бо статус "Виконано" вже відображається зеленим бейджем зверху картки */}
        </div>
        
        <div className="wish-card-footer">
          <h6 className="wish-name text-truncate fw-bold">{wish.name}</h6>
          <p className="wish-price mb-0">₴{wish.price ? wish.price.toFixed(2) : '0.00'}</p>
        </div>
      </div>
    </Link>
  </div>
))}
      </div>

      {/* ПАГІНАЦІЯ БАЖАНЬ */}
      {totalElements > itemsPerPage && (
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