// src/models/Reaction.js
const { Schema, model } = require('mongoose');

const reactionSchema = new Schema({
  video:     { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  type:      { type: String, enum: ['like','dislike'], required: true },
  createdAt: { type: Date, default: Date.now }
});

reactionSchema.index(                                   // ← minimal: unique per (user, video)
  { video: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

module.exports = model('Reaction', reactionSchema);
