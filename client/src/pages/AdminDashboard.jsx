import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const icons = {
  game: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="3"/>
      <path d="M8 12h2m-1-1v2"/>
      <circle cx="15" cy="11.5" r=".8" fill="currentColor" stroke="none"/>
      <circle cx="17" cy="13.5" r=".8" fill="currentColor" stroke="none"/>
    </svg>
  ),
  genre: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h10M4 18h6"/>
      <circle cx="19" cy="17" r="3"/>
      <path d="M19 15v2l1 1"/>
    </svg>
  ),
  user: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      <path d="M16 11l1.5 1.5L20 10"/>
    </svg>
  ),
  requests: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  reports: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  ),
};

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
      icon: icons.game,
      path: '/admin/create-game',
      color: '#06b6d4'
    },
    {
      label: 'Crear Géneros',
      description: 'Registra nuevos géneros de videojuegos',
      icon: icons.genre,
      path: '/admin/create-genre',
      color: '#a855f7'
    },
    {
      label: 'Crear Usuarios',
      description: 'Crea y gestiona cuentas de usuario',
      icon: icons.user,
      path: '/admin/create-user',
      color: '#f59e0b'
    },
    {
      label: 'Peticiones de Usuarios',
      description: 'Aprueba o rechaza juegos enviados por usuarios',
      icon: icons.requests,
      path: '/admin/user-requests',
      color: '#22c55e'
    },
    {
      label: 'Reportes',
      description: 'Consulta reportes y estadísticas del sistema',
      icon: icons.reports,
      path: '/admin/reports',
      color: '#e11d48'
    }
  ];

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-5">
          <h2 className="section-title mb-1 text-white">
            Panel de <span className="cyan-text">Administración</span>
          </h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>Selecciona una sección para continuar</p>
        </div>

        <div className="row g-3">
          {options.map((opt) => (
            <div
              className="col-12 col-sm-6 col-lg-4"
              key={opt.path}
              style={{ display: 'flex' }}
            >
              <button
                className="w-100 text-start"
                onClick={() => navigate(opt.path)}
                style={{
                  background: '#111418',
                  border: `1px solid ${opt.color}44`,
                  borderLeft: `4px solid ${opt.color}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  color: '#fff',
                  padding: '1.4rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = opt.color + '15';
                  e.currentTarget.style.borderColor = opt.color;
                  e.currentTarget.style.borderLeftColor = opt.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${opt.color}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#111418';
                  e.currentTarget.style.borderColor = opt.color + '44';
                  e.currentTarget.style.borderLeftColor = opt.color;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ color: opt.color }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1rem', color: '#f0f0f0', marginBottom: '0.25rem' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#8b8fa8', lineHeight: '1.4' }}>
                    {opt.description}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate('/profile')}
          >
            Volver al Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
