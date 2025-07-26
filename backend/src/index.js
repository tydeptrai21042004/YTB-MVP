// src/index.js
require('dotenv').config();
const express = require('express');
const path    = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/videos', require('./routes/videos'));
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/videos', require('./routes/comments'));
app.use('/api/videos', require('./routes/reactions'));
app.use('/api/videos', require('./routes/ratings'));
app.use('/api/history', require('./routes/history'));
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
