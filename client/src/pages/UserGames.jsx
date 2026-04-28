import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = '/cover-placeholder.svg';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `${API_URL}${coverUrl}` : coverUrl;
};

const UserGames = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user?.id || user?._id;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.is_admin) {
      navigate('/admin/create-game');
      return;
    }

    const fetchGames = async () => {
      if (!currentUserId) {
        setGames([]);
        setError('No se pudo identificar tu sesion. Cierra sesion y vuelve a entrar.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/games`, {
          params: {
            include_pending: true,
            include_rejected: true,
            created_by: currentUserId
          }
        });

        const onlyOwnGames = (res.data.games || []).filter((game) => {
          const ownerId = game.created_by?._id || game.created_by;
          return ownerId?.toString() === currentUserId?.toString();
        });

        setGames(onlyOwnGames);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar tus juegos.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [user, navigate, currentUserId]);

  const handleDelete = async (gameId, title) => {
    const confirmed = window.confirm(`¿Eliminar el juego "${title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/games/${gameId}`, {
        params: {
          user_id: currentUserId,
          is_admin: false
        }
      });
      setGames(prev => prev.filter(g => g._id !== gameId));
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo eliminar el juego.');
    }
  };

  if (!user || user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="section-title mb-2 text-white">
              Gestionar <span className="cyan-text">Mis Juegos</span>
            </h2>
            <p className="text-secondary mb-0">Tus juegos se publican cuando un admin los apruebe.</p>
          </div>

          <button
            className="btn btn-neon px-4"
            onClick={() => navigate('/my-games/new')}
          >
            Create
          </button>
        </div>

        {loading && <p className="text-secondary">Cargando juegos...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && games.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            Aun no has creado juegos.
          </div>
        )}

        <div className="row g-4">
          {games.map((game) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={game._id}>
              <div className="admin-game-card h-100">
                <img
                  src={resolveCoverSrc(game.cover_url)}
                  alt={game.title}
                  className="admin-game-image"
                  onError={(e) => {
                    e.currentTarget.src = fallbackCover;
                  }}
                />

                <div className="admin-game-overlay">
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => navigate(`/my-games/new?edit=${game._id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(game._id, game.title)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="p-3">
                  <h6 className="text-white mb-1 text-truncate">{game.title}</h6>
                  <p className="mb-1 small">
                    {(() => {
                      const normalizedStatus = game.approval_status || (game.created_by ? 'pending' : 'approved');
                      const badgeClass = normalizedStatus === 'approved'
                        ? 'badge bg-success'
                        : normalizedStatus === 'rejected'
                          ? 'badge bg-danger'
                          : 'badge bg-warning text-dark';
                      const label = normalizedStatus === 'approved'
                        ? 'Aprobado'
                        : normalizedStatus === 'rejected'
                          ? 'Rechazado'
                          : 'Pendiente';

                      return <span className={badgeClass}>{label}</span>;
                    })()}
                  </p>
                  <p className="text-secondary mb-0 small text-truncate">
                    {game.developer || 'Sin desarrollador'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGames;
