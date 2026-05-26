import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';
import "../App.css";

export const WishlistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Стан для модального вікна
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

        if (!wishlistResponse.ok) throw new Error('Помилка сервера');

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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#F3F8FE' }}>
      
      {/* Заголовок з олівцем */}
      <div className="d-flex align-items-center mb-1">
        <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 shadow-none">
          <i className="bi bi-arrow-left fs-3"></i>
        </button>
        
        <div className="d-flex align-items-center">
          <h2 className="fw-bold mb-0 me-2 text-dark" style={{ fontFamily: 'Raleway, sans-serif' }}>
            {wishlist?.name}
          </h2>
          {/* Кнопка олівця */}
          <button 
            className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
            onClick={() => setIsEditModalOpen(true)}
            style={{ width: '32px', height: '32px', backgroundColor: '#F0F0F0', borderRadius: '8px' }}
          >
            <i className="bi bi-pencil-fill text-muted" style={{ fontSize: '14px' }}></i>
          </button>
        </div>
      </div>
      
      <p className="text-muted mb-5 header-description ms-5">{wishlist?.description}</p>

      {/* Сітка бажань */}
      <div className="wishes-grid">
        <div className="wish-item-card add-new-card" onClick={() => navigate(`/wishlists/${id}/add-item`)}>
          <div className="wish-image-container d-flex align-items-center justify-content-center">
            <div className="plus-circle">
              <i className="bi bi-plus-lg text-white fs-4"></i>
            </div>
          </div>
        </div>

        {wishes.map((wish) => (
          <Link key={wish.id} to={`/wish-items/${wish.id}`} className="text-decoration-none text-dark">
            <div className="wish-item-card">
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
                {/* Ціна з 0.00 за замовчуванням */}
                <p className="wish-price mb-0">₴{wish.price ? wish.price.toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Модальне вікно редагування */}
      {isEditModalOpen && (
        <EditWishlistModal 
          show={isEditModalOpen}
          wishlistData={wishlist}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updated) => setWishlist(updated)}
        />
      )}
    </div>
  );
};