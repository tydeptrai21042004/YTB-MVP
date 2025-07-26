// src/models/Reaction.js
const { Schema, model } = require('mongoose');

const reactionSchema = new Schema({
  video:     { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  type:      { type: String, enum: ['like','dislike'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Reaction', reactionSchema);
