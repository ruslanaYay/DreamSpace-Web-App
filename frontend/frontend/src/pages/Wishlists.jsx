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
  const [currentPage, setCurrentPage] = useState(0); // 0-індекс для API
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // Динамічний розрахунок ліміту елементів для UI відображення пагінації
  const itemsPerPage = (currentPage === 0 && searchTerm === "") ? 11 : 12;

  // Функція запиту до API з підтримкою пагінації та пошуку
  const fetchWishlists = async (query = "", page = 0) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    // ЛОГІКА СІТКИ: якщо перша сторінка і немає пошуку (є плюс) -> беремо 11, інакше -> 12
    const currentSize = (page === 0 && query.trim() === "") ? 11 : 12;

    try {
      // Формуємо URL з обов'язковими параметрами
      let url = `http://localhost:8085/api/wishlists?page=${page}&size=${currentSize}`;
      
      if (query.trim() !== "") {
        url += `&query=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Отримуємо дані з поля content
        setWishlists(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      console.error("Помилка завантаження:", err);
    } finally {
      setLoading(false);
    }
  };

  // Слідкуємо за зміною сторінки
  useEffect(() => {
    fetchWishlists(searchTerm, currentPage);
  }, [currentPage]);

  // Скидання на 0 сторінку при зміні пошукового запиту
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setCurrentPage(0);
      fetchWishlists("", 0);
    }
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(0);
      fetchWishlists(searchTerm, 0);
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(0);
    fetchWishlists(searchTerm, 0);
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
        fetchWishlists(searchTerm, currentPage);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Помилка при видаленні:", err);
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" style={{ color: '#8A60C2' }}></div>
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
        {/* КАРТКА СТВОРЕННЯ (Залишається без змін, відображається завжди без пошуку) */}
        {searchTerm === "" && currentPage === 0 && (
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

        {/* СПИСОК ВІШЛІСТІВ */}
        {wishlists.length > 0 ? (
          wishlists.map((list) => (
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
              <h3 className="fw-medium text-dark" style={{ fontSize: '1.8rem', opacity: 0.8 }}>
                Вішлістів із такою назвою не знайдено
              </h3>
            </div>
          )
        )}
      </div>

      {/* ПАГІНАЦІЯ (Показуємо, якщо загальна кількість сторінок більша за 1) */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination 
            currentPage={currentPage + 1} // Для UI
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page - 1)} // Для API
          />
        </div>
      )}
      {/* МОДАЛКИ */}
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