// src/models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } }); // ← minimal

userSchema.virtual('uploads', {                      // ← minimal: reverse relation
  ref: 'Video',
  localField: '_id',
  foreignField: 'uploadedBy'
});

module.exports = model('User', userSchema);
