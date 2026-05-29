import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];

    // 1. Якщо кількість сторінок не перевищує 5 — всі підряд
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } 
    else {
      // 2. Якщо сторінок більше 5
      if (currentPage <= 3) {
        // На одній із перших: < [1] 2 3 ... 7 >
        pages.push(1, 2, 3, '...', totalPages);
      } 
      else if (currentPage > 3 && currentPage < totalPages - 2) {
        // На одній із середніх: < 1 ... 3 [4] 5 ... 7 >
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      } 
      else {
        // На одній із останніх: < 1 ... 5 [6] 7 >
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="d-flex justify-content-center align-items-center mt-5 mb-4">
      <ul className="pagination custom-pagination align-items-center gap-2">
        {/* Кнопка Назад */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0 d-flex align-items-center gap-1" 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          >
            <i className="bi bi-arrow-left"></i> Назад
          </button>
        </li>

        {/* Номери сторінок */}
        {getPages().map((page, index) => (
          <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
            {page === '...' ? (
              <span className="page-link border-0 bg-transparent text-muted">...</span>
            ) : (
              <button className="page-link border-0 shadow-none" onClick={() => onPageChange(page)}>
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Кнопка Вперед */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0 d-flex align-items-center gap-1" 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          >
            Вперед <i className="bi bi-arrow-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};