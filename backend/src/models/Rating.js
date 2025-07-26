// src/models/Rating.js
const { Schema, model } = require('mongoose');

const ratingSchema = new Schema({
  video:     { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  value:     { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Rating', ratingSchema);
