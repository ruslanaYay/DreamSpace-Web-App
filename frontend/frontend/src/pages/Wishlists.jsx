import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const Wishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
            />
            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-x text-muted me-2"></i>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-4">
        {/* Кнопка Додати новий вішліст */}
        <Link to="/wishlists/create" className="text-decoration-none">
          <div className="wishlist-card add-card d-flex align-items-center justify-content-center shadow-sm">
            <div className="plus-icon d-flex align-items-center justify-content-center">
              <i className="bi bi-plus-lg fs-2 text-white"></i>
            </div>
          </div>
        </Link>

        {/* Рендеринг реальних карток */}
        {wishlists.map((list) => (
          <div key={list.id} className="wishlist-item">
            <div className="wishlist-card shadow-sm position-relative mb-2">
              
              {/* 1. Оновлено іконки під ваш PrivacyStatus Enum */}
              <div className="status-icon position-absolute top-0 start-0 m-3">
                <i className={`bi ${
                  list.privacyStatus === 'PRIVATE' ? 'bi-eye-slash' : 
                  list.privacyStatus === 'PUBLIC' ? 'bi-eye' : 
                  'bi-link-45deg' /* Для статусу LINK */
                }`}></i>
              </div>

              <div className="menu-icon position-absolute top-0 end-0 m-2">
                <button className="btn btn-link text-muted p-1">
                  <i className="bi bi-three-dots"></i>
                </button>
              </div>
              
              <div className="card-image-placeholder d-flex align-items-center justify-content-center">
                <i className="bi bi-image text-light fs-1"></i>
              </div>
            </div>

            <div className="card-info ps-1">
              {/* 2. Використовуємо list.name (як у Entity)*/}
              <h6 className="mb-0 fw-bold">{list.name}</h6>
              {/* 3. Кількість бажань (поки що за замовчуванням, якщо немає в Entity) */}
              <small className="text-muted">{list.itemsCount || 0} бажань</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};