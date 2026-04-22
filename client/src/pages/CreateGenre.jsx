import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateGenre = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);
  const [formData, setFormData] = useState({ name: '', description: '', tags: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGenre, setLoadingGenre] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchGenre = async () => {
      try {
        setLoadingGenre(true);
        const res = await axios.get(`http://localhost:5000/api/genres/${editId}`);
        const genre = res.data.genre;
        setFormData({
          name: genre.name || '',
          description: genre.description || '',
          tags: Array.isArray(genre.tags) ? genre.tags.join(', ') : ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el género para editar.');
      } finally {
        setLoadingGenre(false);
      }
    };

    fetchGenre();
  }, [editId, isEditMode]);

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
        name: formData.name,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/genres/${editId}`, payload);
        setMessage('Género actualizado exitosamente.');
      } else {
        await axios.post('http://localhost:5000/api/genres', payload);
        setMessage('Género creado exitosamente.');
      }
      setFormData({ name: '', description: '', tags: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el género.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            {isEditMode ? 'Editar ' : 'Crear '}<span className="cyan-text">Género</span>
          </h2>

          {loadingGenre && <p className="text-secondary">Cargando datos del género...</p>}

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-white">Nombre <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: RPG"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Descripción</label>
              <textarea
                className="form-control bg-dark text-white border-secondary"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción del género..."
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Etiquetas <span className="text-secondary" style={{ fontSize: '0.8rem' }}>(separadas por coma)</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Ej: aventura, mundo abierto, historia"
              />
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin/create-genre')}
              >
                Volver
              </button>
              <button type="submit" className="btn btn-neon px-5" disabled={loading || loadingGenre}>
                {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Género'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGenre;
