// src/routes/ratings.js
const router = require('express').Router();
const {
  getRating,
  postRating
} = require('../controllers/ratingController');

router.get('/:id/rating', getRating);
router.post('/:id/rating', postRating);

module.exports = router;
