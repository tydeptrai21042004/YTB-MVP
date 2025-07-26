// src/routes/videos.js
const router = require('express').Router();
const { uploadMiddleware } = require('../middleware/upload');
const auth = require('../middleware/auth');
const {
  uploadVideo,
  listVideos,
  getVideo,
  postSummary,
  deleteVideo
} = require('../controllers/videoController');
const optionalAuth = require('../middleware/optionalAuth');
// public listing & fetch
router.get('/',    listVideos);
router.get('/:id', optionalAuth, getVideo);
router.post('/:id/summary', postSummary);

// protected: upload & delete
router.post(
  '/',
  auth,
  uploadMiddleware.single('video'),
  uploadVideo
);
router.delete('/:id', auth, deleteVideo);

module.exports = router;
