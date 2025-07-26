// src/controllers/commentController.js
const Comment = require('../models/Comment');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

// GET /api/videos/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.id })
      .sort('-createdAt');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/videos/:id/comments
exports.postComment = async (req, res) => {
  try {
    const text = req.body.text?.trim();
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    let userId = null, name = 'Anonymous';
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        userId = decoded.id;
        const user = await User.findById(userId);
        if (user) name = user.name;
      } catch {}
    }

    const comment = new Comment({
      video:   req.params.id,
      user:    userId,
      name,
      text
    });
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
