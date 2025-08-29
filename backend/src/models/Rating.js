// src/models/Rating.js
const { Schema, model } = require('mongoose');

const ratingSchema = new Schema({
  video:     { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  value:     { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.index({ video: 1 }); // ← minimal: common query
ratingSchema.index(                // ← minimal: unique per (user, video)
  { video: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

module.exports = model('Rating', ratingSchema);
