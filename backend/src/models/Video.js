// src/models/Video.js
const { Schema, model } = require('mongoose');

const videoSchema = new Schema({
  originalName: String,
  filename:     String,
  title:        { type: String, required: true },
  description:  String,
  url:          String,
  uploadedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt:   { type: Date, default: Date.now },
  viewCount:    { type: Number, default: 0 },   // ← tracked here
  kind:         { type: String, enum: ['short','regular'], default: 'regular' }  // ← new
});

module.exports = model('Video', videoSchema);
