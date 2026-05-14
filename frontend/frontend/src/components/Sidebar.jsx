import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

export const Sidebar = () => {
  const role = localStorage.getItem('role');

  return (
    <div className="sidebar d-flex flex-column p-3 bg-light border-end">
      <div className="logo mb-4 text-purple fw-bold fs-4">DreamSpace</div>
      
      <nav className="nav flex-column gap-2">
        {/* Пункти для всіх авторизованих користувачів */}
        <NavLink to="/ideas" className={({isActive}) => `nav-link side-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-star me-2"></i> Ідеї
        </NavLink>
        
        <NavLink to="/wishlists" className="nav-link side-link">
          <i className="bi bi-book me-2"></i> Вішлісти
        </NavLink>
        
        <NavLink to="/booked" className="nav-link side-link">
          <i className="bi bi-gift me-2"></i> Заброньовані
        </NavLink>

        <NavLink to="/profile" className="nav-link side-link">
          <i className="bi bi-person me-2"></i> Профіль
        </NavLink>

        {/* Спеціальний пункт лише для адміна */}
        {role === 'ADMIN' && (
          <NavLink to="/admin" className="nav-link side-link admin-link mt-4">
            <i className="bi bi-shield-lock me-2"></i> Адмін панель
          </NavLink>
        )}
      </nav>
    </div>
  );
};