import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `http://localhost:5000${coverUrl}` : coverUrl;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Fecha no disponible';
  return new Date(dateValue).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const GameDetail = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [gameRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/games/${gameId}`),
          axios.get(`http://localhost:5000/api/reviews/${gameId}`)
        ]);

        setGame(gameRes.data);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el detalle del juego.');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5">
        {loading && <p className="text-secondary">Cargando detalle del juego...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && !game && (
          <div className="game-card p-4 text-center text-secondary">
            Juego no encontrado.
          </div>
        )}

        {!loading && !error && game && (
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="game-card p-3">
              <img 
                src={resolveCoverSrc(game.cover_url)}
                className="img-fluid rounded mb-3" 
                alt={game.title}
                onError={(e) => {
                  e.currentTarget.src = fallbackCover;
                }}
              />
              <h2 className="cyan-text">{game.title}</h2>
              <p className="text-secondary">
                Desarrollador: {game.developer || 'No disponible'}<br />
                Lanzamiento: {game.release_year || 'No disponible'}
              </p>
              <div className="d-grid gap-2">
                <Link to={`/games/${game._id}/review`} className="btn btn-neon">
                  <i className="bi bi-pencil-square"></i> Escribir Reseña
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <h3 className="section-title mb-4 text-white">Reseñas de la Comunidad</h3>

            {reviews.length === 0 && (
              <div className="game-card p-4 text-secondary">
                Aun no hay reseñas publicadas para este juego.
              </div>
            )}

            {reviews.map((review) => (
              <div className="game-card p-4 mb-3" key={review._id}>
                <div className="d-flex justify-content-between border-bottom border-secondary pb-2 mb-3">
                  <span className="fw-bold cyan-text">@{review.user_id?.username || 'Usuario'}</span>
                  <span className="text-warning">
                    <i className="bi bi-star-fill"></i> {review.rating}/10
                  </span>
                </div>
                <p className="text-white mb-2">"{review.content}"</p>
                <small className="text-secondary">Publicado el {formatDate(review.date)}</small>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;