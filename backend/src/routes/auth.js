// src/routes/auth.js
const router = require('express').Router();
const {
  register,
  login,
  getProfile
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/profile',   auth, getProfile);

module.exports = router;
