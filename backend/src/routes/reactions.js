// src/routes/reactions.js
const router = require('express').Router();
const {
  getReactions,
  postReaction
} = require('../controllers/reactionController');

router.get('/:id/reactions', getReactions);
router.post('/:id/reactions', postReaction);

module.exports = router;
