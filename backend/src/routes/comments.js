// src/routes/comments.js
const router = require('express').Router();
const { getComments, postComment } = require('../controllers/commentController');

router.get('/:id/comments', getComments);
router.post('/:id/comments', postComment);

module.exports = router;
