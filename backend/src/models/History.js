// src/models/History.js
const { Schema, model } = require('mongoose');

const historySchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  video:    { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  viewedAt: { type: Date, default: Date.now }
});

historySchema.index({ user: 1, video: 1, viewedAt: -1 }); // ← minimal: relation index

module.exports = model('History', historySchema);
