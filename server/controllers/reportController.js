const Game = require('../models/Game');
const Review = require('../models/Review');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const mongoose = require('mongoose');

// Reporte 1: Top Rated por Género
// Cruza Games, Genres y Reviews para mostrar los juegos mejor calificados por categoría.
exports.topRatedByGenre = async (req, res) => {
  try {
    const data = await Review.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: 'game_id',
          foreignField: '_id',
          as: 'game'
        }
      },
      { $unwind: '$game' },
      { $match: { 'game.approval_status': 'approved' } },
      {
        $lookup: {
          from: 'genres',
          localField: 'game.genre_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      { $unwind: '$genre' },
      {
        $group: {
          _id: { game_id: '$game_id', genre_id: '$genre._id' },
          game_title: { $first: '$game.title' },
          genre_name: { $first: '$genre.name' },
          avg_rating: { $avg: '$rating' },
          review_count: { $sum: 1 }
        }
      },
      {
        $sort: { avg_rating: -1 }
      },
      {
        $group: {
          _id: '$_id.genre_id',
          genre_name: { $first: '$genre_name' },
          top_games: {
            $push: {
              game_title: '$game_title',
              avg_rating: { $round: ['$avg_rating', 2] },
              review_count: '$review_count'
            }
          }
        }
      },
      {
        $project: {
          genre_name: 1,
          top_games: { $slice: ['$top_games', 5] }
        }
      },
      { $sort: { genre_name: 1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte Top Rated por Género', error: err.message });
  }
};

// Reporte 2: Actividad de Críticos
// Une Users y Reviews para identificar a los usuarios con mayor volumen de contenido generado por mes.
exports.criticActivity = async (req, res) => {
  try {
    const data = await Review.aggregate([
      {
        $group: {
          _id: {
            user_id: '$user_id',
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          review_count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          year: '$_id.year',
          month: '$_id.month',
          review_count: 1
        }
      },
      { $sort: { year: -1, month: -1, review_count: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte de Actividad de Críticos', error: err.message });
  }
};

// Reporte 3: Tendencias de Lanzamiento
// Analiza Games y Reviews para determinar qué años de lanzamiento están recibiendo más atención.
exports.launchTrends = async (req, res) => {
  try {
    const data = await Review.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: 'game_id',
          foreignField: '_id',
          as: 'game'
        }
      },
      { $unwind: '$game' },
      { $match: { 'game.release_year': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$game.release_year',
          review_count: { $sum: 1 },
          avg_rating: { $avg: '$rating' },
          unique_games: { $addToSet: '$game_id' }
        }
      },
      {
        $project: {
          _id: 0,
          release_year: '$_id',
          review_count: 1,
          avg_rating: { $round: ['$avg_rating', 2] },
          game_count: { $size: '$unique_games' }
        }
      },
      { $sort: { review_count: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte de Tendencias de Lanzamiento', error: err.message });
  }
};

// Reporte 4: Salud del Sistema
// Consulta SystemLogs para visualizar la frecuencia de errores en login o publicación.
exports.systemHealth = async (req, res) => {
  try {
    const data = await SystemLog.aggregate([
      { $match: { level: 'error' } },
      {
        $group: {
          _id: {
            action: '$action',
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            }
          },
          count: { $sum: 1 },
          last_error: { $last: '$error_details' }
        }
      },
      {
        $project: {
          _id: 0,
          action: '$_id.action',
          date: '$_id.date',
          count: 1,
          last_error: 1
        }
      },
      { $sort: { date: -1, count: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte de Salud del Sistema', error: err.message });
  }
};
