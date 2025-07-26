// src/models/Comment.js
const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  video:     { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name:      { type: String, required: true },
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Comment', commentSchema);
