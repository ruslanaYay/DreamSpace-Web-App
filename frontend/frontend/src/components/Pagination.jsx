import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const maxVisiblePages = 5; // Скільки номерів сторінок показувати навколо поточної

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className="d-flex justify-content-center align-items-center mt-5 mb-4">
      <ul className="pagination custom-pagination align-items-center gap-2">
        {/* Кнопка Назад */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link border-0 d-flex align-items-center gap-1" onClick={() => onPageChange(currentPage - 1)}>
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
          <button className="page-link border-0 d-flex align-items-center gap-1" onClick={() => onPageChange(currentPage + 1)}>
            Вперед <i className="bi bi-arrow-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};