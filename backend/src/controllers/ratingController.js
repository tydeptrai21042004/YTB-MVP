// src/controllers/ratingController.js
const Rating = require('../models/Rating');
const jwt    = require('jsonwebtoken');

// GET /api/videos/:id/rating
exports.getRating = async (req, res) => {
  try {
    const ratings = await Rating.find({ video: req.params.id });
    const count   = ratings.length;
    const sum     = ratings.reduce((acc, r) => acc + r.value, 0);
    const average = count ? sum / count : 0;

    let userRating = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const userId = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET).id;
        const mine   = ratings.find(r => r.user?.toString() === userId);
        if (mine) userRating = mine.value;
      } catch {}
    }

    res.json({
      average: parseFloat(average.toFixed(2)),
      count,
      userRating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/videos/:id/rating
exports.postRating = async (req, res) => {
  try {
    const val = parseInt(req.body.value, 10);
    if (isNaN(val) || val < 1 || val > 5) {
      return res.status(400).json({ error: 'Rating must be 1–5' });
    }

    let userId = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        userId = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET).id;
      } catch {}
    }

    if (userId) {
      // upsert for logged‑in users
      await Rating.findOneAndUpdate(
        { video: req.params.id, user: userId },
        { value: val },
        { upsert: true }
      );
    } else {
      // anonymous ratings
      await Rating.create({ video: req.params.id, value: val });
    }

    // return updated statistics
    const ratings = await Rating.find({ video: req.params.id });
    const count   = ratings.length;
    const sum     = ratings.reduce((acc, r) => acc + r.value, 0);
    const average = count ? sum / count : 0;

    res.json({
      average: parseFloat(average.toFixed(2)),
      count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
