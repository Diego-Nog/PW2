import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const CreateReview = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({ rating: 10, content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/games/${gameId}`);
        setGame(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el juego.');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user?.id) {
      setError('Debes iniciar sesion para publicar una reseña.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('http://localhost:5000/api/reviews', {
        user_id: user.id,
        game_id: gameId,
        content: formData.content,
        rating: formData.rating
      });

      navigate(`/games/${gameId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo publicar la reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '800px' }}>
        <div className="game-card p-5">
          {loading && <p className="text-secondary">Cargando juego...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !game && !error && (
            <div className="alert alert-warning">Juego no encontrado.</div>
          )}

          {!loading && game && (
          <>
          <h2 className="section-title mb-4 text-white">
            Escribir Reseña para <span className="cyan-text">{game.title}</span>
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-white">Calificación (1-10)</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                <option value="10">10 - Obra Maestra</option>
                <option value="9">9 - Excelente</option>
                <option value="8">8 - Muy Bueno</option>
                <option value="7">7 - Bueno</option>
                <option value="6">6 - Aceptable</option>
                <option value="5">5 - Mediocre</option>
                <option value="4">4 - Deficiente</option>
                <option value="3">3 - Malo</option>
                <option value="2">2 - Muy Malo</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label text-white">Tu Opinión</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                rows="6" 
                placeholder="¿Qué te pareció el juego?"
                name="content"
                value={formData.content}
                onChange={handleChange}
                minLength={10}
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-between">
              <Link to={`/games/${gameId}`} className="btn btn-outline-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-neon px-5" disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar Reseña'}
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReview;
