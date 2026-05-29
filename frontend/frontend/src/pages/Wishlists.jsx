import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { EditWishlistModal } from '../components/EditWishlistModal';
import { Pagination } from '../components/Pagination';

export const Wishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  // --- СТАН ДЛЯ ПАГІНАЦІЇ ---
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 11;

  const fetchWishlists = async (query = "") => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = query 
        ? `http://localhost:8085/api/wishlists?query=${encodeURIComponent(query)}`
        : 'http://localhost:8085/api/wishlists';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setWishlists(data);
        setCurrentPage(1); // Скидаємо на першу сторінку при новому запиті/пошуку
      }
    } catch (err) {
      console.error("Помилка завантаження:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchWishlists();
    }
  }, [searchTerm]);

  // --- ЛОГІКА РОЗРАХУНКУ ПАГІНАЦІЇ ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlists.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(wishlists.length / itemsPerPage);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchWishlists(searchTerm);
    }
  };

  const handleSearchClick = () => {
    fetchWishlists(searchTerm);
  };

  const toggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleEditTrigger = (list) => {
    setSelectedWishlist(list);
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteTrigger = (list) => {
    setSelectedWishlist(list);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (!selectedWishlist) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/${selectedWishlist.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 204) {
        setWishlists(prev => prev.filter(l => l.id !== selectedWishlist.id));
        setIsDeleteModalOpen(false);
        setSelectedWishlist(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Сталася помилка при видаленні");
      }
    } catch (err) {
      console.error("Помилка при видаленні:", err);
      alert("Не вдалося з'єднатися з сервером");
    }
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
          onKeyDown={handleKeyDown}
        />
        <i 
          className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
          style={{ cursor: 'pointer' }}
          onClick={handleSearchClick}
        ></i>
      </div>

      <div className="d-flex flex-wrap gap-5">
        {/* КАРТКА СТВОРЕННЯ (тільки на 1-й сторінці і без пошуку) */}
{searchTerm === "" && (
    <div className="wishlist-item-wrapper">
      <Link to="/wishlists/create" className="text-decoration-none">
        <div className="wishlist-card add-card d-flex align-items-center justify-content-center shadow-sm">
          <div className="plus-icon">
            <i className="bi bi-plus-lg text-white fs-2"></i>
          </div>
        </div>
      </Link>
    </div>
  )}

        {/* СПИСОК ВІШЛІСТІВ (відфільтрованих пагінацією) */}
        {currentItems.length > 0 ? (
          currentItems.map((list) => (
            <div key={list.id} className="wishlist-item-wrapper position-relative">
              <Link to={`/wishlists/${list.id}`} className="text-decoration-none">
                <div className="wishlist-card shadow-sm position-relative">
                  <div 
                    className="position-absolute top-0 end-0 m-3" 
                    style={{ zIndex: 100, cursor: 'pointer', padding: '5px' }}
                    onClick={(e) => toggleMenu(e, list.id)}
                  >
                    <i className="bi bi-three-dots fs-4 text-muted"></i>
                    {activeMenuId === list.id && (
                       <div className="position-absolute shadow bg-white" style={{ top: '40px', right: '0px', zIndex: 110, borderRadius: '12px', minWidth: '160px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                          <div className="d-flex flex-column text-start">
                            <div className="px-3 py-2 text-dark menu-hover-effect" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTrigger(list); }} style={{ cursor: 'pointer', fontSize: '14px' }}>Редагувати</div>
                            <div style={{ height: '1px', backgroundColor: '#eee', margin: '0 10px' }}></div>
                            <div className="px-3 py-2 text-dark menu-hover-effect" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTrigger(list); }} style={{ cursor: 'pointer', fontSize: '14px' }}>Видалити</div>
                          </div>
                       </div>
                    )}
                  </div>
                  <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 10 }}>
                    <i className={`bi ${list.privacyStatus === 'PRIVATE' ? 'bi-lock-fill' : list.privacyStatus === 'PUBLIC' ? 'bi-eye' : 'bi-link-45deg'} status-icon`}></i>
                  </div>
                  <div className="card-image-placeholder">
                    {list.coverImageUrl ? (
                      <img src={list.coverImageUrl} alt={list.name} className="w-100 h-100 object-fit-cover rounded-card-img" />
                    ) : (
                      <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '3.5rem' }}></i>
                    )}
                  </div>
                </div>
                <div className="card-info mt-2">
                  <h6 className="text-truncate fw-bold text-dark mb-0">{list.name}</h6>
                  <small className="text-muted">{list.itemCount || 0} бажань</small>
                </div>
              </Link>
            </div>
          ))
        ) : (
          searchTerm !== "" && (
            <div className="w-100 mt-4">
              <h3 className="fw-medium text-dark" style={{ fontSize: '1.8rem', opacity: 0.8, color: '#4C4C4C' }}>
                Вішлістів із такою назвою не знайдено
              </h3>
            </div>
          )
        )}
      </div>

      {/* --- ВІДОБРАЖЕННЯ ПАГІНАЦІЇ --- */}
      {/* Показуємо тільки якщо елементів більше 11 */}
      {wishlists.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* МОДАЛКИ (БЕЗ ЗМІН) */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1050 }}>
          <div className="bg-white p-4 shadow-lg text-center" style={{ width: '420px', borderRadius: '24px', position: 'relative' }}>
            <button className="btn-close position-absolute top-0 end-0 m-3 shadow-none" onClick={() => setIsDeleteModalOpen(false)}></button>
            <h5 className="fw-bold mt-3 mb-2" style={{ color: '#333' }}>Видалити вішліст?</h5>
            <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Також будуть видалені усі бажання в ньому</p>
            <div className="d-flex gap-3 justify-content-center">
              <button className="btn py-2 px-4 fw-medium" onClick={() => setIsDeleteModalOpen(false)} style={{ borderRadius: '12px', backgroundColor: '#EBEBEB', color: '#333', border: 'none', minWidth: '140px' }}>Скасувати</button>
              <button className="btn py-2 px-4 fw-medium text-white" onClick={confirmDelete} style={{ borderRadius: '12px', backgroundColor: '#E74C3C', border: 'none', minWidth: '140px' }}>Видалити</button>
            </div>
          </div>
        </div>
      )}

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