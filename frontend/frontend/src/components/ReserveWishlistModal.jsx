import React, { useState, useEffect } from 'react';

export const ReserveWishModal = ({ 
  show, 
  onClose, 
  wishId, 
  shareToken, 
  id, 
  onSuccess,
  setWishes,
  fetchWishlistData,
  currentPage,
  selectedWish,
  navigate,
  initialMode // 'RESERVE' або 'JOIN'
}) => {
  const [isReserving, setIsReserving] = useState(false); 

  // --- СТАНИ ДЛЯ СТВОРЕННЯ БРОНЮВАННЯ ---
  const [isGroupReservation, setIsGroupReservation] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [reserveEmail, setReserveEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [participantsError, setParticipantsError] = useState("");

  // --- СТАНИ ДЛЯ ДОЛУЧЕННЯ ДО БРОНЮВАННЯ ---
  const [joinEmail, setJoinEmail] = useState("");
  const [joinEmailError, setJoinEmailError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Скидання помилок та полів при відкритті модалки
  useEffect(() => {
    if (show) {
      setEmailError("");
      setParticipantsError("");
      setJoinEmailError("");
      setReserveEmail("");
      setJoinEmail("");
      setIsGroupReservation(false);
      setMaxParticipants(2);
    }
  }, [show, initialMode]);

  if (!show) return null;

  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ==========================================
  // 1. СТВОРЕННЯ ОБРАНОГО БРОНЮВАННЯ (ОДИН/ГРУПА)
  // ==========================================
  const handleConfirmReservation = async () => {
    if (!wishId || isReserving) return;
    
    setEmailError("");
    setParticipantsError("");
    let hasError = false;

    if (isGroupReservation) {
      if (!reserveEmail.trim()) {
        setEmailError("Це поле обов’язкове");
        hasError = true;
      } else if (!validateEmailFormat(reserveEmail)) {
        setEmailError("Некоректний формат email");
        hasError = true;
      }

      const pCount = parseInt(maxParticipants, 10);
      if (!maxParticipants || isNaN(pCount)) {
        setParticipantsError("Це поле обов’язкове");
        hasError = true;
      } else if (pCount <= 1) {
        setParticipantsError("Введіть значення більше 1 або перейдіть в одиночний режим");
        hasError = true;
      } else if (pCount > 10) {
        setParticipantsError("Кількість дарувальників повинна бути не більше 10 осіб");
        hasError = true;
      }
    }

    if (hasError) return;

    setIsReserving(true);
    const token = localStorage.getItem('token');

    const requestBody = {
      reservationType: isGroupReservation ? "GROUP" : "INDIVIDUAL",
      maxParticipants: isGroupReservation ? parseInt(maxParticipants, 10) : 1,
      email: isGroupReservation ? reserveEmail.trim() : null
    };

    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${wishId}/reserve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        if (typeof setWishes === 'function') {
          setWishes(prevWishes => 
            prevWishes.map(wish => 
              wish.id === wishId 
                ? { 
                    ...wish, 
                    isReserved: true, 
                    reservationType: resData.reservationType || requestBody.reservationType,
                    reservationId: resData.reservationId || wish.reservationId,
                    currentParticipants: resData.currentParticipants || 1,
                    maxParticipants: resData.maxParticipants || requestBody.maxParticipants,
                    isCurrentUserParticipant: true 
                  } 
                : wish
            )
          );
        }
        onClose();
        if (onSuccess) onSuccess();
      } else {
        if (response.status === 400 && !resData.message) {
          if (resData.email) setEmailError(resData.email);
          if (resData.maxParticipants) setParticipantsError(resData.maxParticipants);
        } else {
          alert(resData.message || "Сталася неочікувана помилка");
          if ([400, 404, 410].includes(response.status) && typeof fetchWishlistData === 'function') {
            fetchWishlistData(currentPage); 
          }
          onClose();
        }
      }
    } catch (err) {
      console.error("Помилка при бронюванні бажання:", err);
      alert("Не вдалося з'єднатися з сервером");
    } finally {
      setIsReserving(false);
    }
  };

  // ==========================================
  // 2. ДОЛУЧЕННЯ ДО СПІЛЬНОГО БРОНЮВАННЯ
  // ==========================================
  const handleConfirmJoin = async () => {
    if (!wishId || isJoining) return;

    setJoinEmailError("");
    if (!joinEmail.trim()) {
      setJoinEmailError("Поле обов'язкове для заповнення");
      return;
    } else if (!validateEmailFormat(joinEmail)) {
      setJoinEmailError("Некоректний формат email");
      return;
    }

    setIsJoining(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8085/api/wishlists/share/${shareToken}/wishes/${wishId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: joinEmail.trim() })
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        if (typeof setWishes === 'function') {
          setWishes(prevWishes => 
            prevWishes.map(wish => {
              if (wish.id === wishId) {
                const updatedParticipants = resData.currentParticipants || ((wish.currentParticipants || 0) + 1);
                const maxLimit = resData.maxParticipants || wish.maxParticipants || 2;
                return {
                  ...wish,
                  currentParticipants: updatedParticipants,
                  maxParticipants: maxLimit,
                  isReserved: true, 
                  isCurrentUserParticipant: true
                };
              }
              return wish;
            })
          );
        }
        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert(resData.message || resData.email || "Помилка при долученні до бронювання");
        if ((response.status === 400 || response.status === 404) && typeof fetchWishlistData === 'function') {
          fetchWishlistData(currentPage);
        }
        onClose();
      }
    } catch (err) {
      console.error("Помилка при долученні:", err);
      alert("Не вдалося з'єднатися з сервером");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {/* РЕЖИМ СТВОРЕННЯ БРОНЮВАННЯ ('RESERVE') */}
      {initialMode === 'RESERVE' && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}
             onClick={onClose}>
          <div className="bg-white position-relative shadow d-flex flex-column p-4" 
               style={{ width: '550px', borderRadius: '16px' }}
               onClick={(e) => e.stopPropagation()}>
            
            <button className="btn border-0 position-absolute p-1 bg-transparent" 
                    style={{ right: '20px', top: '20px' }}
                    onClick={onClose}>
              <i className="bi bi-x-lg text-muted" style={{ fontSize: '1.2rem' }}></i>
            </button>

            <div className="w-100 text-center mt-2 mb-4">
              <h4 className="fw-bold mb-3" style={{ color: '#2C2C2C', fontSize: '24px', fontFamily: 'Raleway, sans-serif' }}>
                Бронювання бажання
              </h4>
              <p className="text-muted mb-4 px-2" style={{ fontSize: '14px', lineHeight: '20px' }}>
                Ви впевнені, що хочете забронювати це бажання? Інші користувачі більше не зможуть його обрати.
              </p>
            </div>

            <div className="mb-4 px-2">
              <div className="form-check d-flex align-items-center gap-2 p-0 m-0">
                <input 
                  className="form-check-input shadow-none m-0" 
                  type="checkbox" 
                  id="groupReservationCheck"
                  checked={isGroupReservation} 
                  onChange={(e) => setIsGroupReservation(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#8A60C2' }}
                />
                <label className="form-check-label fw-medium text-dark m-0" htmlFor="groupReservationCheck" style={{ cursor: 'pointer', fontSize: '15px' }}>
                  Відкрити спільне бронювання
                </label>
              </div>
            </div>

            {isGroupReservation && (
              <div className="px-2 mb-2">
                <div className="mb-4">
                  <label className="form-label mb-1 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                    Вкажіть кількість дарувальників <span className="text-danger">*</span>
                  </label>
                  <div className="text-muted mb-2" style={{ fontSize: '13px' }}>Не більше 10 осіб</div>
                  <input 
                    type="number" 
                    min="2" 
                    max="10" 
                    className="form-control shadow-none" 
                    value={maxParticipants} 
                    onChange={(e) => setMaxParticipants(e.target.value)} 
                    style={{ borderRadius: '8px', height: '44px', border: participantsError ? '1px solid #DC3545' : '1px solid #D8D8D8' }}
                  />
                  {participantsError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{participantsError}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label mb-1 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                    Вкажіть свою електронну адресу <span className="text-danger">*</span>
                  </label>
                  <div className="text-muted mb-2" style={{ fontSize: '13px' }}>Завдяки ній дарувальники зможуть зв’язатися з вами</div>
                  <input 
                    type="email" 
                    className="form-control shadow-none" 
                    value={reserveEmail} 
                    onChange={(e) => setReserveEmail(e.target.value)} 
                    placeholder="Значення" 
                    style={{ borderRadius: '8px', height: '44px', border: emailError ? '1px solid #DC3545' : '1px solid #D8D8D8' }}
                  />
                  {emailError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{emailError}</div>}
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between gap-3 mt-3 px-2">
              <button className="btn border-0 flex-fill" 
                      style={{ height: '40px', backgroundColor: '#E0E0E0', color: '#4F4F4F', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}
                      onClick={onClose}
                      disabled={isReserving}>
                Скасувати
              </button>
              <button className="btn border-0 flex-fill text-white" 
                      style={{ height: '40px', backgroundColor: '#8A60C2', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}
                      onClick={handleConfirmReservation}
                      disabled={isReserving}>
                {isReserving ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  "Підтвердити"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* РЕЖИМ ДОЛУЧЕННЯ ДО СПІЛЬНОГО БРОНЮВАННЯ ('JOIN') */}
      {initialMode === 'JOIN' && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}
             onClick={onClose}>
          <div className="bg-white position-relative shadow d-flex flex-column p-4" 
               style={{ width: '550px', borderRadius: '16px' }}
               onClick={(e) => e.stopPropagation()}>
            
            <button className="btn border-0 position-absolute p-1 bg-transparent" 
                    style={{ right: '20px', top: '20px' }}
                    onClick={onClose}>
              <i className="bi bi-x-lg text-muted" style={{ fontSize: '1.2rem' }}></i>
            </button>

            <div className="w-100 text-center mt-2 mb-4">
              <h4 className="fw-bold mb-3" style={{ color: '#2C2C2C', fontSize: '24px', fontFamily: 'Raleway, sans-serif' }}>
                Долучитися до бронювання
              </h4>
              <p className="text-muted mb-2 px-2" style={{ fontSize: '14px', lineHeight: '22px' }}>
                {selectedWish?.creatorEmail || "nure@gmail.com"} відкрив спільне бронювання для {selectedWish?.maxParticipants || 4} осіб.
              </p>
              <p className="text-dark fw-medium" style={{ fontSize: '14px' }}>Бажаєте долучитися?</p>
            </div>

            <div className="mb-4 px-2">
              <label className="form-label mb-1 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                Вкажіть свою електронну адресу <span className="text-danger">*</span>
              </label>
              <div className="text-muted mb-2" style={{ fontSize: '13px' }}>Завдяки ній дарувальники зможуть зв’язатися з вами</div>
              <input 
                type="email" 
                className="form-control shadow-none" 
                value={joinEmail} 
                onChange={(e) => setJoinEmail(e.target.value)} 
                placeholder="Значення" 
                style={{ borderRadius: '8px', height: '44px', border: joinEmailError ? '1px solid #DC3545' : '1px solid #D8D8D8' }}
              />
              {joinEmailError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{joinEmailError}</div>}
            </div>

            <div className="d-flex justify-content-between gap-3 mt-2 px-2">
              <button className="btn border-0 flex-fill" 
                      style={{ height: '40px', backgroundColor: '#E0E0E0', color: '#4F4F4F', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}
                      onClick={onClose}
                      disabled={isJoining}>
                Скасувати
              </button>
              <button className="btn border-0 flex-fill text-white" 
                      style={{ height: '40px', backgroundColor: '#8A60C2', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}
                      onClick={handleConfirmJoin}
                      disabled={isJoining}>
                {isJoining ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  "Підтвердити"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};