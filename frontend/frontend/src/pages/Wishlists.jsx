import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';

export const Wishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  useEffect(() => {
    const fetchWishlists = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8085/api/wishlists', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setWishlists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, []);

  const toggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleEditClick = (e, list) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWishlist(list);
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="content-area">
      <h2 className="fw-bold text-dark mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Вішлісти</h2>

      <div className="search-container position-relative mb-5" style={{ maxWidth: '450px' }}>
        <input
          type="text"
          className="form-control search-input py-2 shadow-sm"
          placeholder="Пошук за вішлістами"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
      </div>

      <div className="d-flex flex-wrap gap-5">
        {/* Картка створення */}
        <div className="wishlist-item-wrapper">
          <Link to="/wishlists/create" className="text-decoration-none">
            <div className="wishlist-card add-card d-flex align-items-center justify-content-center shadow-sm">
              <div className="plus-icon">
                <i className="bi bi-plus-lg text-white fs-2"></i>
              </div>
            </div>
          </Link>
        </div>

       {/* Список вішлістів */}
{wishlists
  .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
  .map((list) => (
    <div key={list.id} className="wishlist-item-wrapper">
      
      <Link to={`/wishlists/${list.id}`} className="text-decoration-none">
        <div className="wishlist-card shadow-sm position-relative">
          
          {/* --- КНОПКА ТЕПЕР ТУТ (Всередині картки) --- */}
          <div 
            className="position-absolute top-0 end-0 m-2" 
            style={{ zIndex: 30, cursor: 'pointer', padding: '5px' }}
            onClick={(e) => toggleMenu(e, list.id)}
          >
            <i className="bi bi-three-dots fs-4 text-muted"></i>
            
            {activeMenuId === list.id && (
              <div 
                className="position-absolute shadow bg-white py-2 px-3" 
                style={{ top: '35px', right: '0px', zIndex: 100, borderRadius: '10px', minWidth: '130px' }}
                onClick={(e) => handleEditClick(e, list)}
              >
                <span className="text-dark" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                  Редагувати
                </span>
              </div>
            )}
          </div>

          {/* Іконка приватності */}
          <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 10 }}>
            <i className={`bi ${list.privacyStatus === 'PRIVATE' ? 'bi-lock-fill' : list.privacyStatus === 'PUBLIC' ? 'bi-eye' : 'bi-link-45deg'} status-icon`}></i>
          </div>
          
          <div className="card-image-placeholder">
            {list.coverImageUrl ? (
              <img src={list.coverImageUrl} alt={list.name} className="w-100 h-100 object-fit-cover" />
            ) : (
              <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '3.5rem' }}></i>
            )}
          </div>
        </div>

        <div className="card-info">
          <h6 className="text-truncate fw-bold text-dark">{list.name}</h6>
          <small className="text-muted">{list.itemCount || 0} бажань</small>
        </div>
      </Link>
    </div>
  ))}
      </div>

      {isEditModalOpen && (
        <EditWishlistModal 
          show={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          wishlistData={selectedWishlist}
          onUpdate={(updated) => setWishlists(prev => prev.map(l => l.id === updated.id ? updated : l))}
        />
      )}
    </div>
  );
};