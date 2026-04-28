import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = '/cover-placeholder.svg';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `${API_URL}${coverUrl}` : coverUrl;
};

const Library = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [ratingsByGameId, setRatingsByGameId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/api/library/${user.id}`);
        setItems(res.data.library || []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la biblioteca.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user]);

  useEffect(() => {
    const fetchRatings = async () => {
      const gameIds = [...new Set(items
        .map((item) => item.game_id?._id || item.game_id)
        .filter(Boolean))];

      if (gameIds.length === 0) {
        setRatingsByGameId({});
        return;
      }

      try {
        const ratingsEntries = await Promise.all(
          gameIds.map(async (gameId) => {
            const res = await axios.get(`${API_URL}/api/reviews/${gameId}`);
            const reviews = Array.isArray(res.data) ? res.data : [];
            const average = reviews.length
              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
              : null;

            return [gameId, { average, count: reviews.length }];
          })
        );

        setRatingsByGameId(Object.fromEntries(ratingsEntries));
      } catch {
        setRatingsByGameId({});
      }
    };

    fetchRatings();
  }, [items]);

  const handleStatusChange = async (libraryId, status) => {
    try {
      setUpdatingId(libraryId);
      const res = await axios.patch(`${API_URL}/api/library/${libraryId}`, { status });
      setItems((prev) => prev.map((item) => (
        item._id === libraryId ? res.data.library : item
      )));
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (libraryId) => {
    try {
      setRemovingId(libraryId);
      await axios.delete(`${API_URL}/api/library/${libraryId}`);
      setItems((prev) => prev.filter((item) => item._id !== libraryId));
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo eliminar el juego de la biblioteca.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-vh-100">
      <Navbar />

      <main className="container mt-5">
        <h3 className="section-title text-white">Colección de Juegos</h3>

        {loading && <p className="text-secondary">Cargando biblioteca...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !user && (
          <div className="game-card p-4 text-center text-secondary mt-3">
            Inicia sesion para ver tu biblioteca.
          </div>
        )}

        {!loading && !error && user && items.length === 0 && (
          <div className="game-card p-4 text-center text-secondary mt-3">
            No hay juegos disponibles en tu biblioteca.
          </div>
        )}

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {items.map((item) => {
            const game = item.game_id;
            if (!game) return null;

            return (
            <div className="col" key={item._id}>
              <div className="game-card p-3 library-card d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                <img
                  src={resolveCoverSrc(game.cover_url)}
                  className="rounded mb-3 mb-sm-0 me-sm-3 library-card-img"
                  alt={game.title}
                  onError={(e) => {
                    e.currentTarget.src = fallbackCover;
                  }}
                />
                <div className="flex-grow-1">
                  <div className="library-rating-row">
                    <div className="game-rating-main text-white fw-bold">
                      <span className="text-warning game-rating-star">
                        <i className="bi bi-star-fill"></i>
                      </span>
                      {ratingsByGameId[game._id]?.average
                        ? `${ratingsByGameId[game._id].average}/10`
                        : 'Sin calificacion'}
                    </div>
                  </div>
                  <h5 className="mb-1 text-white">{game.title}</h5>
                  <p className="small text-secondary mb-0">
                    {game.developer || 'Sin desarrollador'}
                  </p>
                  <p className="small text-secondary mb-2 mb-sm-0">
                    Estado: {item.status}
                  </p>
                </div>
                <div className="library-actions mt-3 mt-sm-0 ms-sm-3">
                  <Link to={`/games/${game._id}`} className="btn btn-outline-neon btn-sm">
                    Ver info
                  </Link>
                  <select
                    className="form-select form-select-sm"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    disabled={updatingId === item._id}
                  >
                    <option value="pendiente de jugar">Pendiente</option>
                    <option value="jugando">Jugando</option>
                    <option value="jugado">Jugado</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemove(item._id)}
                    disabled={removingId === item._id}
                  >
                    {removingId === item._id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </main>
    </div>
  );
};

export default Library;