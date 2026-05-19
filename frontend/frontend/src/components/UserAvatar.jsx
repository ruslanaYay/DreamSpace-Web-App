import React from 'react';
import "../App.css";

export const UserAvatar = ({ user }) => {
  const renderAvatar = () => {
    if (user?.photoUrl) {
      return (
        <img 
          src={user.photoUrl} 
          alt="Profile" 
          className="rounded-circle shadow-sm" 
          style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
        />
      );
    }

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
      <div className="avatar-placeholder d-flex align-items-center justify-content-center rounded-circle shadow-sm">
        <span className="fw-bold text-white">{initial}</span>
      </div>
    );
  };

  return (
    <div className="user-profile-trigger">
      {renderAvatar()}
    </div>
  );
};