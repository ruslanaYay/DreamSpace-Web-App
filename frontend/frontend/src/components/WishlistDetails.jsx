import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishlistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Стан для обробки помилок

  useEffect(() => {
    const fetchWishlistData = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        setLoading(true);
        
        // Виконуємо два запити паралельно
        const [wishlistResponse, wishesResponse] = await Promise.all([
          fetch(`http://localhost:8085/api/wishlists/${id}`, { method: 'GET', headers }),
          fetch(`http://localhost:8085/api/wishlists/${id}/wishes`, { method: 'GET', headers })
        ]);

        // Обробка помилок для вішліста (401, 403, 404, 500)
        if (!wishlistResponse.ok) {
          const errorData = await wishlistResponse.json();
          if (wishlistResponse.status === 401) alert("Увійдіть в обліковий запис");
          if (wishlistResponse.status === 403) alert("Доступ заборонено");
          if (wishlistResponse.status === 404) alert("Вказаний вішліст не знайдено");
          throw new Error(errorData.message || 'Помилка сервера');
        }

        const wishlistData = await wishlistResponse.json();
        const wishesData = await wishesResponse.json();

        setWishlist(wishlistData);
        // Ігноруємо wishlistData.wishes і записуємо дані з окремого ендпоінту
        setWishes(Array.isArray(wishesData) ? wishesData : []);
        
      } catch (err) {
        console.error("Помилка завантаження:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, [id]);

  // Функція для отримання іконки пріоритету
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-exclamation-circle-fill text-danger';
      case 'MEDIUM': return 'bi-dash-circle-fill text-warning';
      case 'LOW': return 'bi-arrow-down-circle-fill text-success';
      default: return '';
    }
  };

  if (loading) return <div className="spinner-border"></div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Заголовок */}
      <div className="d-flex align-items-start mb-4">
          <button onClick={() => navigate('/wishlists')} className="btn btn-link text-dark p-0 me-3 mt-1 shadow-none">
            <i className="bi bi-arrow-left fs-3"></i>
          </button>
          <div>
            <h2 className="fw-bold mb-1">{wishlist?.name}</h2>
            <p className="text-muted mb-0">{wishlist?.description}</p>
          </div>
      </div>

      <div className="d-flex flex-wrap gap-4 mt-4">
        {/* Кнопка додавання */}
        <div className="card shadow-sm border-0 item-card-container" onClick={() => navigate(`/wishlists/${id}/add-item`)} style={{ cursor: 'pointer', borderRadius: '12px' }}>
          <div className="item-image-area">
            <div className="item-plus-circle"><i className="bi bi-plus-lg text-white"></i></div>
          </div>
          <div className="card-body p-0"></div>
        </div>

        {/* Рендеринг справжніх бажань з нового API */}
        {wishes.map((wish) => (
          <div key={wish.id} className="card shadow-sm border-0 item-card-container" style={{ borderRadius: '12px' }}>
            <div className="item-image-area position-relative">
              {wish.imageUrl ? (
                <img src={wish.imageUrl} alt={wish.name} className="w-100 h-100 object-fit-cover rounded" />
              ) : (
                <i className="bi bi-image text-light fs-1"></i>
              )}
              
              <div className="position-absolute bottom-0 start-0 m-2">
                <i className={`bi ${getPriorityIcon(wish.priority)}`}></i>
              </div>
            </div>
            
            <div className="card-body px-3 py-2">
              <h6 className="fw-bold mb-1 text-truncate">{wish.name}</h6>
              <p className="text-primary fw-bold mb-0">
                {(wish.price || 0).toFixed(2)} грн
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};