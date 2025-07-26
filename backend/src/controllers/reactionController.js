// src/controllers/reactionController.js
const Reaction = require('../models/Reaction');
const jwt      = require('jsonwebtoken');

// GET /api/videos/:id/reactions
exports.getReactions = async (req, res) => {
  try {
    const reactions = await Reaction.find({ video: req.params.id });
    const likes    = reactions.filter(r => r.type === 'like').length;
    const dislikes = reactions.filter(r => r.type === 'dislike').length;

    let userReaction = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        const mine = reactions.find(r => r.user?.toString() === decoded.id);
        if (mine) userReaction = mine.type;
      } catch {}
    }

    res.json({ likes, dislikes, userReaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/videos/:id/reactions
exports.postReaction = async (req, res) => {
  try {
    const { type } = req.body;
    if (!['like','dislike'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
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
      await Reaction.findOneAndUpdate(
        { video: req.params.id, user: userId },
        { type },
        { upsert: true }
      );
    } else {
      // anonymous can add multiple reactions
      await Reaction.create({ video: req.params.id, type });
    }

    // return updated counts
    const reactions = await Reaction.find({ video: req.params.id });
    const likes    = reactions.filter(r => r.type === 'like').length;
    const dislikes = reactions.filter(r => r.type === 'dislike').length;
    res.json({ likes, dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
