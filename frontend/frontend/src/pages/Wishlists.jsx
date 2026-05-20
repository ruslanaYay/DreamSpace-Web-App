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
        const response = await fetch('http://localhost:8085/api/wishlists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Помилка завантаження");

        setWishlists(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, []);

  const filteredWishlists = wishlists.filter(list =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
      <div className="container-fluid p-5 min-vh-100" style={{ backgroundColor: '#F8F9FD' }}>
        <h2 className="fw-bold mb-4 ms-2" style={{ fontSize: '2rem', color: '#333' }}>Вішлісти</h2>

        {/* Пошук */}
        <div className="search-container position-relative mb-5 ms-2" style={{ maxWidth: '450px' }}>
          <input
              type="text"
              className="form-control border-0 shadow-sm py-2 ps-3 pe-5"
              placeholder="Пошук за вішлістами"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '15px', height: '45px' }}
          />
          <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
        </div>

        {/* Сітка карток з відступами gap-5 */}
        <div className="d-flex flex-wrap gap-5 ms-2">

          {/* Картка створення */}
          <Link to="/wishlists/create" className="wishlist-item-wrapper">
            <div className="wishlist-card add-card d-flex align-items-center justify-content-center shadow-sm">
              <div className="plus-icon">
                <i className="bi bi-plus-lg text-white fs-3"></i>
              </div>
            </div>
            <div className="card-info">
            </div>
          </Link>

          {/* Списки з БД */}
          {filteredWishlists.map((list) => (
              <Link to={`/wishlists/${list.id}`} key={list.id} className="wishlist-item-wrapper">
                <div className="wishlist-card shadow-sm">

                  {/* Іконка статусу */}
                  {/* Неклікабельна іконка статусу приватності */}

                  <div className="status-icon position-absolute top-0 start-0 m-3" style={{ pointerEvents: 'none' }}>

                    <i className={`bi ${

                        list.privacyStatus === 'PRIVATE' ? 'bi-lock-fill' : // Замок для приватного

                            list.privacyStatus === 'PUBLIC' ? 'bi-eye' :        // Око для публічного

                                'bi-link-45deg'                                    // Ланцюжок для доступу за посиланням

                    }`}></i>

                  </div>

                  <div className="card-image-placeholder">
                    {list.coverImageUrl ? (
                        <img src={list.coverImageUrl} alt="" className="w-100 h-100 object-fit-cover" />
                    ) : (
                        <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '3.5rem' }}></i>
                    )}
                  </div>
                </div>

                <div className="card-info">
                  <h6 className="text-truncate">{list.name}</h6>
                  <small>{list.itemCount || 0} бажань</small>
                </div>
              </Link>
          ))}
        </div>
      </div>
  );
};
