import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    release_year: '',
    cover_url: '',
    genre_id: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    axios.get('http://localhost:5000/api/genres')
      .then(res => setGenres(res.data.genres || res.data))
      .catch(() => setGenres([]));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        developer: formData.developer,
        cover_url: formData.cover_url,
        genre_id: formData.genre_id
      };
      if (formData.release_year) {
        payload.release_year = parseInt(formData.release_year, 10);
      }
      await axios.post('http://localhost:5000/api/games', payload);
      setMessage('Juego creado exitosamente en el catálogo.');
      setFormData({ title: '', developer: '', release_year: '', cover_url: '', genre_id: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el juego.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '700px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            Panel de <span className="cyan-text">Administración</span>
          </h2>

          <h5 className="text-white mb-4">Agregar nuevo juego al catálogo</h5>

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-white">Título <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: The Witcher 3"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Desarrollador <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                placeholder="Ej: CD Projekt Red"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Año de lanzamiento</label>
              <input
                type="number"
                className="form-control bg-dark text-white border-secondary"
                name="release_year"
                value={formData.release_year}
                onChange={handleChange}
                placeholder="Ej: 2015"
                min="1950"
                max={new Date().getFullYear() + 5}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">URL de portada</label>
              <input
                type="url"
                className="form-control bg-dark text-white border-secondary"
                name="cover_url"
                value={formData.cover_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Género <span className="text-danger">*</span></label>
              <select
                className="form-select bg-dark text-white border-secondary"
                name="genre_id"
                value={formData.genre_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Selecciona un género --</option>
                {genres.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin')}
              >
                Volver
              </button>
              <button
                type="submit"
                className="btn btn-neon px-5"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Crear Juego'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
