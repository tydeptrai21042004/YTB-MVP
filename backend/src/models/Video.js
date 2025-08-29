// src/models/Video.js
const { Schema, model } = require('mongoose');

const videoSchema = new Schema({
  originalName: String,
  filename:     String,
  title:        { type: String, required: true },
  description:  String,
  url:          String,
  uploadedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ← minimal: required
  uploadedAt:   { type: Date, default: Date.now },
  viewCount:    { type: Number, default: 0 },
  kind:         { type: String, enum: ['short','regular'], default: 'regular' }
});

videoSchema.index({ uploadedBy: 1, uploadedAt: -1 }); // ← minimal: relation index

module.exports = model('Video', videoSchema);
