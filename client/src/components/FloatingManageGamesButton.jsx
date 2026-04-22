import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FloatingManageGamesButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.is_admin) return null;

  return (
    <button
      type="button"
      className="floating-manage-games-btn"
      onClick={() => navigate('/my-games')}
      title="Gestionar juegos"
      aria-label="Gestionar juegos"
    >
      <i className="bi bi-plus-lg"></i>
    </button>
  );
};

export default FloatingManageGamesButton;
