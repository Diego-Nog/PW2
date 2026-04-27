import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `${API_URL}${coverUrl}` : coverUrl;
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
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 10, content: '' });
  const [savingReviewId, setSavingReviewId] = useState(null);

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [gameRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/api/games/${gameId}`),
          axios.get(`${API_URL}/api/reviews/${gameId}`)
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

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditForm({
      rating: review.rating,
      content: review.content
    });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditForm({ rating: 10, content: '' });
  };

  const handleSaveEdit = async (reviewId) => {
    if (!user?.id) {
      window.alert('Debes iniciar sesion para editar reseñas.');
      return;
    }

    if (!editForm.content || editForm.content.trim().length < 10) {
      window.alert('La reseña debe tener al menos 10 caracteres.');
      return;
    }

    try {
      setSavingReviewId(reviewId);
      const res = await axios.put(`${API_URL}/api/reviews/${reviewId}`, {
        user_id: user.id,
        rating: Number(editForm.rating),
        content: editForm.content
      });

      setReviews((prev) => prev.map((review) => (
        review._id === reviewId ? res.data.review : review
      )));
      setEditingReviewId(null);
      setEditForm({ rating: 10, content: '' });
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo editar la reseña.');
    } finally {
      setSavingReviewId(null);
    }
  };

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
              <div className="game-cover-row mb-3">
                <img 
                  src={resolveCoverSrc(game.cover_url)}
                  className="img-fluid rounded game-detail-cover"
                  alt={game.title}
                  onError={(e) => {
                    e.currentTarget.src = fallbackCover;
                  }}
                />
                <div className="game-rating-summary">
                  <div>
                    <div className="game-rating-main text-white fw-bold">
                      <span className="text-warning game-rating-star">
                        <i className="bi bi-star-fill"></i>
                      </span>
                      {averageRating ? `${averageRating}/10` : 'Sin calificacion'}
                    </div>
                    <small className="text-secondary">
                      {reviews.length === 1 ? '1 reseña' : `${reviews.length} reseñas`}
                    </small>
                  </div>
                </div>
              </div>
              <h2 className="cyan-text">{game.title}</h2>
              <p className="text-secondary">
                Desarrollador: {game.developer || 'No disponible'}<br />
                Lanzamiento: {game.release_year || 'No disponible'}<br />
                Género: {game.genre_id?.name || 'No disponible'}
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

                {editingReviewId === review._id ? (
                  <div className="review-edit-panel">
                    <div className="mb-2">
                      <label className="form-label text-white mb-1">Calificación</label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={editForm.rating}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                      >
                        <option value="10">10</option>
                        <option value="9">9</option>
                        <option value="8">8</option>
                        <option value="7">7</option>
                        <option value="6">6</option>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-white mb-1">Descripción</label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="4"
                        value={editForm.content}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                      ></textarea>
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancelEdit}
                        disabled={savingReviewId === review._id}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-neon btn-sm"
                        onClick={() => handleSaveEdit(review._id)}
                        disabled={savingReviewId === review._id}
                      >
                        {savingReviewId === review._id ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white mb-2">"{review.content}"</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-secondary">Publicado el {formatDate(review.date)}</small>
                      {user?.id && (review.user_id?._id || review.user_id) === user.id && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-neon"
                          onClick={() => handleStartEdit(review)}
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </>
                )}
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