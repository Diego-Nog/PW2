import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    release_year: '',
    cover_url: '',
    genre_id: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    axios.get('http://localhost:5000/api/genres')
      .then(res => setGenres(res.data.genres || res.data))
      .catch(() => setGenres([]));
  }, [user, navigate]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchGame = async () => {
      try {
        setLoadingGame(true);
        const res = await axios.get(`http://localhost:5000/api/games/${editId}`);
        const game = res.data;
        setFormData({
          title: game.title || '',
          developer: game.developer || '',
          release_year: game.release_year || '',
          cover_url: game.cover_url || '',
          genre_id: game.genre_id?._id || game.genre_id || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el juego a editar.');
      } finally {
        setLoadingGame(false);
      }
    };

    fetchGame();
  }, [editId, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('developer', formData.developer);
      payload.append('genre_id', formData.genre_id);

      if (formData.cover_url) {
        payload.append('cover_url', formData.cover_url);
      }

      if (formData.release_year) {
        payload.append('release_year', String(parseInt(formData.release_year, 10)));
      }

      if (coverImage) {
        payload.append('cover_image', coverImage);
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/games/${editId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/admin/create-game');
        return;
      } else {
        await axios.post('http://localhost:5000/api/games', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/admin/create-game');
        return;
      }
      setFormData({ title: '', developer: '', release_year: '', cover_url: '', genre_id: '' });
      setCoverImage(null);
      setFileInputKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el juego.');
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

          <h5 className="text-white mb-4">
            {isEditMode ? 'Editar juego del catálogo' : 'Agregar nuevo juego al catálogo'}
          </h5>

          {loadingGame && <p className="text-secondary">Cargando datos del juego...</p>}

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
              <label className="form-label text-white">Imagen de portada</label>
              <input
                key={fileInputKey}
                type="file"
                className="form-control bg-dark text-white border-secondary"
                name="cover_image"
                onChange={handleImageChange}
                accept="image/*"
              />
              <small className="text-secondary d-block mt-1">
                {coverImage
                  ? `Archivo seleccionado: ${coverImage.name}`
                  : isEditMode && formData.cover_url
                    ? 'Si no seleccionas una nueva imagen, se conserva la actual.'
                    : 'Selecciona una imagen desde tu dispositivo.'}
              </small>
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
                onClick={() => navigate('/admin/create-game')}
              >
                Volver
              </button>
              <button
                type="submit"
                className="btn btn-neon px-5"
                disabled={loading || loadingGame}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear Juego'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
