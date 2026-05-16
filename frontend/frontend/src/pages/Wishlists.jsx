import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const Wishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlists = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Увійдіть в обліковий запис");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Зверніть увагу на порт (8085 або 8080 - поставте свій актуальний)
        const response = await fetch('http://localhost:8085/api/wishlists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.status === 401) {
          // Тут спрацьовує ваш JwtAuthenticationEntryPoint (body.put("message", ...))
          throw new Error(data.message || "Сесія вичерпана");
        }

        if (!response.ok) {
          // Обробка 500 та інших помилок
          throw new Error(data.message || "Сталася неочікувана помилка");
        }

        // Якщо все ОК, записуємо список DTO
        setWishlists(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, []);

  const filteredWishlists = wishlists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-4">Вішлісти</h2>
          
          <div className="search-container position-relative mb-5" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control search-input ps-3 pe-5 py-2 shadow-sm"
              placeholder="Пошук за вішлістами"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '25px' }}
            />
            {/* центрування лупи */}
            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y text-muted me-3"></i>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-octagon me-2"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-4">
        {/* Кнопка створення завжди перша */}
        <Link to="/wishlists/create" className="text-decoration-none">
          <div className="wishlist-card add-card d-flex align-items-center justify-content-center shadow-sm">
            <div className="plus-icon d-flex align-items-center justify-content-center">
              <i className="bi bi-plus-lg fs-2 text-white"></i>
            </div>
          </div>
        </Link>

        {/* Списки з БД */}
        {!error && filteredWishlists.map((list) => (
          <div key={list.id} className="wishlist-item">
            <div className="wishlist-card shadow-sm position-relative mb-2">
              <div className="status-icon position-absolute top-0 start-0 m-3">
                <i className={`bi ${
                  list.privacyStatus === 'PRIVATE' ? 'bi-eye-slash' : 
                  list.privacyStatus === 'PUBLIC' ? 'bi-eye' : 
                  'bi-link-45deg'
                }`}></i>
              </div>

              {/* <div className="menu-icon position-absolute top-0 end-0 m-2">
                <button className="btn btn-link text-muted p-1 border-0 shadow-none">
                  <i className="bi bi-three-dots"></i>
                </button>
              </div>*/}
              
              <div className="card-image-placeholder d-flex align-items-center justify-content-center overflow-hidden bg-white h-100">
                {list.coverImageUrl ? (
                  <img src={list.coverImageUrl} alt={list.name} className="w-100 h-100 object-fit-cover" />
                ) : (
                  <i className="bi bi-image text-light fs-1"></i>
                )}
              </div>
            </div>

            <div className="card-info ps-1">
              <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '100%' }}>{list.name}</h6>
              <small className="text-muted">{list.itemCount} бажань</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};