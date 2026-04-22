import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || !user.is_admin) return null;

  const options = [
    {
      label: 'Crear Juegos',
      description: 'Agrega nuevos juegos al catálogo',
      icon: '🎮',
      path: '/admin/create-game',
      color: 'var(--neon-cyan)'
    },
    {
      label: 'Crear Géneros',
      description: 'Registra nuevos géneros de videojuegos',
      icon: '🗂️',
      path: '/admin/create-genre',
      color: '#a855f7'
    },
    {
      label: 'Crear Usuarios',
      description: 'Crea y gestiona cuentas de usuario',
      icon: '👤',
      path: '/admin/create-user',
      color: '#f59e0b'
    },
    {
      label: 'Peticiones de Usuarios',
      description: 'Aprueba o rechaza juegos enviados por usuarios',
      icon: '📋',
      path: '/admin/user-requests',
      color: '#22c55e'
    }
  ];

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '800px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-2 text-white text-center">
            Panel de <span className="cyan-text">Administración</span>
          </h2>
          <p className="text-secondary text-center mb-5">¿Qué deseas hacer?</p>

          <div className="row g-4">
            {options.map((opt) => (
              <div className="col-12 col-sm-6" key={opt.path}>
                <button
                  className="w-100 h-100 text-start p-4 rounded"
                  onClick={() => navigate(opt.path)}
                  style={{
                    background: '#1a1a1a',
                    border: `2px solid ${opt.color}`,
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    color: '#fff'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = opt.color + '22';
                    e.currentTarget.style.boxShadow = `0 0 18px ${opt.color}66`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{opt.icon}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: opt.color }}>{opt.label}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.85rem' }}>{opt.description}</div>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/profile')}
            >
              Volver al Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
