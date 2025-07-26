// src/controllers/historyController.js
const History = require('../models/History');

// GET /api/history
exports.getHistory = async (req, res) => {
  try {
    const entries = await History.find({ user: req.user.id })
      .sort('-viewedAt')
      .populate('video', 'title url uploadedAt');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
