import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';
import { EditWishItemModal } from '../components/EditWishItemModal'; 
import { DeleteWishModal } from './DeleteWishModal';
import "../App.css";

export const WishlistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Дані вішліста та бажань
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Стани для модальних вікон редагування
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isEditWishModalOpen, setIsEditWishModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);

  // Стан для випадаючого меню (три крапки)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Стан для видалення (прив'язка до ID конкретного бажання)
  const [deleteModal, setDeleteModal] = useState({ show: false, wishId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Відкриття модалки видалення
  const openDeleteModal = (wishId) => {
    setDeleteModal({ show: true, wishId: wishId });
    setActiveMenuId(null); 
  };

  // 2. Закриття вікна без виконання запиту
  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ show: false, wishId: null });
    }
  };

  // 3. Асинхронний запит на видалення
const handleDeleteConfirm = async () => {
  if (!deleteModal.wishId) return;

  setIsDeleting(true);
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:8085/api/wishes/${deleteModal.wishId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });

    // Успішне видалення
    if (response.status === 204 || response.ok) {
      setDeleteModal({ show: false, wishId: null });
      
      // Якщо ми на сторінці списку (WishlistDetails), просто оновлюємо стейт
      setWishes(prev => prev.filter(wish => wish.id !== deleteModal.wishId));
      
      // Якщо цей код використовується на сторінці деталей одного бажання:
      // navigate(`/wishlists/${id}`, { replace: true }); 
      
      return; 
    }

    // Якщо ми тут — значить сталася помилка сервера (4xx або 5xx)
    const data = await response.json(); 
    alert(data.message || "Помилка при видаленні");

  } catch (err) {
    // Якщо сервер повернув 204 і ми випадково викликали .json() десь поза IF, 
    // JS викине помилку SyntaxError. Ми її ігноруємо, якщо видалення пройшло успішно.
    console.error("Помилка:", err);
    alert("Не вдалося з'єднатися з сервером");
  } finally {
    setIsDeleting(false);
  }
};

  // Завантаження даних при вході на сторінку
  useEffect(() => {
    const fetchWishlistData = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        setLoading(true);
        const [wishlistResponse, wishesResponse] = await Promise.all([
          fetch(`http://localhost:8085/api/wishlists/${id}`, { method: 'GET', headers }),
          fetch(`http://localhost:8085/api/wishlists/${id}/wishes`, { method: 'GET', headers })
        ]);

        if (!wishlistResponse.ok) throw new Error('Не вдалося завантажити дані вішліста');

        const wishlistData = await wishlistResponse.json();
        const wishesData = await wishesResponse.json();

        setWishlist(wishlistData);
        setWishes(Array.isArray(wishesData) ? wishesData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, [id]);

  // Закриття меню при кліку в будь-якому місці
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#F3F8FE' }}>
      
      {/* Шапка */}
      <div className="d-flex align-items-center mb-1">
        <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 shadow-none">
          <i className="bi bi-arrow-left fs-3"></i>
        </button>
        
        <div className="d-flex align-items-center">
          <h2 className="fw-bold mb-0 me-2 text-dark" style={{ fontFamily: 'Raleway, sans-serif' }}>
            {wishlist?.name}
          </h2>
          <button 
            className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
            onClick={() => setIsEditListModalOpen(true)}
            style={{ width: '32px', height: '32px', backgroundColor: '#F0F0F0', borderRadius: '8px' }}
          >
            <i className="bi bi-pencil-fill text-muted" style={{ fontSize: '14px' }}></i>
          </button>
        </div>
      </div>
      
      <p className="text-muted mb-5 header-description ms-5">{wishlist?.description}</p>

      {/* Сітка бажань */}
      <div className="wishes-grid">
        {/* Картка створення */}
        <div className="wish-item-card add-new-card" onClick={() => navigate(`/wishlists/${id}/add-item`)}>
          <div className="wish-image-container d-flex align-items-center justify-content-center">
            <div className="plus-circle">
              <i className="bi bi-plus-lg text-white fs-4"></i>
            </div>
          </div>
        </div>

        {wishes.map((wish) => (
          <div key={wish.id} className="wish-item-wrapper position-relative">
            {/* Кнопка "Три крапки" */}
            <div 
              className="position-absolute top-0 end-0 m-2" 
              style={{ zIndex: 20 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveMenuId(activeMenuId === wish.id ? null : wish.id);
              }}
            >
              <button className="btn border-0 p-1 shadow-none bg-transparent">
                <i className="bi bi-three-dots fs-4 text-dark"></i>
              </button>

              {activeMenuId === wish.id && (
                <div 
                  className="position-absolute shadow bg-white py-1" 
                  style={{ top: '35px', right: '0', zIndex: 100, borderRadius: '10px', minWidth: '140px', border: '1px solid #eee' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="dropdown-item py-2 px-3 small" 
                    onClick={() => { setSelectedWish(wish); setIsEditWishModalOpen(true); }}
                  >
                    Редагувати
                  </button>
                  <button 
                    className="dropdown-item py-2 px-3 small text-danger" 
                    onClick={() => openDeleteModal(wish.id)}
                  >
                    Видалити
                  </button>
                </div>
              )}
            </div>

            {/* Картка бажання */}
            <Link to={`/wish-items/${wish.id}`} className="text-decoration-none text-dark h-100">
              <div className="wish-item-card h-100">
                <div className="wish-image-container">
                  {wish.imageUrl ? (
                    <img src={wish.imageUrl} alt={wish.name} className="wish-main-img" />
                  ) : (
                    <div className="image-placeholder"><i className="bi bi-image fs-1 opacity-25"></i></div>
                  )}
                  <div className="priority-emoji">
                    <i className={`bi ${getPriorityIcon(wish.priority)}`}></i>
                  </div>
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

      {/* Модалки редагування */}
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
        onUpdate={(updated) => {
          setWishes(prev => prev.map(w => w.id === updated.id ? updated : w));
        }}
      />

      {/* Модалка видалення */}
      <DeleteWishModal 
        show={deleteModal.show}
        isLoading={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};