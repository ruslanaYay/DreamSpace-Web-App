import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";

export const WishlistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        if (!wishlistResponse.ok) {
          const errorData = await wishlistResponse.json();
          throw new Error(errorData.message || 'Помилка сервера');
        }

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


  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  // Іконки пріоритету згідно з макетом (смайлики)
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#F8F9FD' }}>
      {/* Заголовок */}
      <div className="d-flex align-items-center mb-1">
        <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 shadow-none">
          <i className="bi bi-arrow-left fs-3"></i>
        </button>
        <h2 className="fw-bold mb-0 me-3">{wishlist?.name}</h2>
        <button className="btn btn-edit-wishlist">
          <i className="bi bi-pencil small"></i>
        </button>
      </div>
      <p className="text-muted mb-5 header-description">{wishlist?.description}</p>

      {/* Сітка карток з відступом від краю */}
      <div className="wishes-grid">
        {/* Кнопка додавання */}
        <div className="wish-item-card add-new-card" onClick={() => navigate(`/wishlists/${id}/add-item`)}>
          <div className="wish-image-container d-flex align-items-center justify-content-center">
            <div className="plus-circle">
              <i className="bi bi-plus-lg text-white fs-4"></i>
            </div>
          </div>
          <div className="wish-card-footer"></div>
        </div>

        {/* Список бажань */}
        {wishes.map((wish) => (
          <div key={wish.id} className="wish-item-card">
            <div className="wish-image-container">
              {wish.imageUrl ? (
                <img src={wish.imageUrl} alt={wish.name} className="wish-main-img" />
              ) : (
                <div className="image-placeholder">
                  <i className="bi bi-image fs-1 opacity-25"></i>
                </div>
              )}
              <div className="priority-emoji">
                <i className={`bi ${getPriorityIcon(wish.priority)}`}></i>
              </div>
            </div>
            
            <div className="wish-card-footer">
              <h6 className="wish-name text-truncate">{wish.name}</h6>
              <p className="wish-price mb-0">
                ₴{wish.price ? wish.price.toLocaleString('uk-UA', { minimumFractionDigits: 2 }) : '0,00'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};