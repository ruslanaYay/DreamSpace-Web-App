import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditWishItemModal } from '../components/EditWishItemModal';
import { DeleteWishModal } from './DeleteWishModal';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const WishItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Початкове значення беремо з пам'яті, але далі ми його перевіримо через API
  const [isOwner, setIsOwner] = useState(() => {
    return localStorage.getItem('currentWishlistIsOwner') === 'true';
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuOpen, setActiveMenuOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bi-emoji-smile text-warning'; 
      case 'MEDIUM': return 'bi-emoji-neutral text-muted';
      case 'LOW': return 'bi-emoji-frown text-dark'; 
      default: return '';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('uk-UA');
  };

  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem('token');
      const shareToken = localStorage.getItem('currentShareToken');
      
      try {
        setLoading(true);

        // 1. ПЕРША СПРОБА: Запит як власник (якщо є токен авторизації)
        if (authToken) {
          const ownerRes = await fetch(`http://localhost:8085/api/wishes/${itemId}`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}` 
            }
          });

          if (ownerRes.ok) {
            const data = await ownerRes.json();
            setItem(data);
            setIsOwner(true); // API підтвердило, що ми власник
            setLoading(false);
            return; // Виходимо, бо дані вже є
          }
        }

        // 2. ДРУГА СПРОБА: Якщо не власник або немає authToken, йдемо через shareToken
        if (shareToken) {
          const guestRes = await fetch(`http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${itemId}`);
          if (guestRes.ok) {
            setIsOwner(false); // Ми точно гість
          } else {
            setErrorMessage("Доступ заборонено");
          }
        } else {
          setErrorMessage("Необхідна авторизація або посилання для доступу");
        }
      } catch (err) {
        setErrorMessage("Помилка мережі");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const toggleStatus = async () => {
    if (!isOwner) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8085/api/wishes/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const updatedWish = await response.json();
        const completedStatus = updatedWish.isCompleted !== undefined ? updatedWish.isCompleted : updatedWish[" isCompleted "];
        setItem(prev => ({ ...prev, isCompleted: completedStatus }));
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (errorMessage) return (
    <div className="error-page-wrapper d-flex flex-column align-items-center mt-5">
      <p className="access-denied-text">{errorMessage}</p>
      <button className="btn btn-outline-primary mt-3" onClick={() => navigate(-1)}>Повернутися</button>
    </div>
  );
  if (!item) return null;

  return (
    <main className="flex-grow-1 position-relative" style={{ backgroundColor: '#F3F8FE', minHeight: 'calc(100vh - 82px)' }}>
      <button onClick={() => navigate(-1)} className="btn border-0 p-0 shadow-none position-absolute" style={{ left: '20px', top: '20px', zIndex: 10 }}>
        <i className="bi bi-arrow-left" style={{ fontSize: '2rem', color: '#333' }}></i>
      </button>

      {/* МЕНЮ З'ЯВИТЬСЯ ЯК ТІЛЬКИ API ПІДТВЕРДИТЬ ОВНЕРСТВО */}
      {isOwner && (
        <div className="position-absolute" style={{ right: '40px', top: '20px', zIndex: 20 }}>
          <button className="btn border-0 p-1 shadow-none bg-transparent" onClick={() => setActiveMenuOpen(!activeMenuOpen)}>
            <i className="bi bi-three-dots-vertical text-dark" style={{ fontSize: '1.8rem' }}></i>
          </button>
          {activeMenuOpen && (
            <div className="position-absolute shadow bg-white py-2" style={{ right: 0, top: '50px', borderRadius: '12px', minWidth: '160px', border: '1px solid #eee' }}>
              <button className="dropdown-item py-2 px-3" onClick={() => { setIsEditModalOpen(true); setActiveMenuOpen(false); }}>Редагувати</button>
              <div className="dropdown-divider mx-2"></div>
              <button className="dropdown-item py-2 px-3 text-danger" onClick={() => { setDeleteModal({show: true}); setActiveMenuOpen(false); }}>Видалити</button>
            </div>
          )}
        </div>
      )}

      <div className="container-fluid" style={{ paddingLeft: '80px', paddingTop: '60px' }}>
        <div className="d-flex flex-column flex-md-row gap-5 align-items-start">
          <div className="position-relative shadow-sm bg-white" style={{ width: '436px', height: '470px', flexShrink: 0, overflow: 'hidden', borderRadius: '12px' }}>
            {item.isCompleted && (
              <div className="completed-badge" style={{ zIndex: 5 }}>
                <i className="bi bi-check-lg me-1"></i> Виконано
              </div>
            )}
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: '#E5E5E5'}}>
                <i className="bi bi-image text-muted opacity-25" style={{ fontSize: '6rem' }}></i>
              </div>
            )}
            <div className="position-absolute bottom-0 start-0 m-3"><i className={`bi ${getPriorityIcon(item.priority)} fs-2 text-dark`}></i></div>
          </div>

          <div className="flex-grow-1">
            <h1 className="fw-bold mb-1" style={{ fontSize: '2.8rem', color: '#4C4C4C', fontFamily: 'Raleway, sans-serif' }}>{item.name}</h1>
            <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>Додано {formatDate(item.createdAt)}</p>
            <h2 className="fw-bold mb-4" style={{ fontSize: '2.2rem', color: '#4C4C4C' }}>{Number(item.price || 0).toFixed(2)} ₴</h2>
            
            <div className="mb-5" style={{ maxWidth: '700px' }}>
              <p style={{ fontSize: '1.2rem', color: '#4C4C4C', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.description || " "}</p>
            </div>

            {item.storeLink && (
              <div className="mt-4 mb-4">
                <h6 className="fw-bold mb-2" style={{ color: '#4C4C4C' }}>Посилання</h6>
                <div className="bg-white border d-inline-block p-2 px-3" style={{ borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(item.storeLink, '_blank')}>
                  <span className="text-muted text-break">{item.storeLink}</span>
                </div>
              </div>
            )}

            {isOwner && (
              <button 
                className={`btn mt-2 w-100 d-flex align-items-center justify-content-center transition-all ${item.isCompleted ? 'btn-wish-completed' : 'btn-wish-action'}`}
                style={{ height: '40px', borderRadius: '8px', fontWeight: '600', border: 'none' }}
                onClick={toggleStatus}
              >
                {item.isCompleted ? 'Зробити активним' : 'Виконати'}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <>
          <EditWishItemModal 
            show={isEditModalOpen} 
            wishData={item} 
            onClose={() => setIsEditModalOpen(false)} 
            onUpdate={(updatedData) => setItem(updatedData)}
          />
          <DeleteWishModal 
            show={deleteModal.show} 
            onClose={() => setDeleteModal({show: false})} 
            onConfirm={() => navigate(-1)} 
          />
        </>
      )}
    </main>
  );
};