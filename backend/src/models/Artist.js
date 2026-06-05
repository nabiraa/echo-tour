const mongoose = require('mongoose');

// ─── ARTIST COLLECTION ────────────────────────────────────────────────────────
// Demonstrates: flexible schema, embedded documents, array fields
const artistSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: [true, 'Stage name is required'],
      unique: true,
      trim: true,
      index: true, // Index for fast lookups
    },
    realName: { type: String, trim: true },
    nationality: { type: String, required: true },
    genre: {
      type: [String],
      default: ['K-Pop'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one genre is required',
      },
    },
    debutYear: { type: Number, min: 1990, max: new Date().getFullYear() },
    agency: { type: String, required: true },
    members: [
      {
        name: { type: String, required: true },
        role: { type: String, enum: ['Vocalist', 'Rapper', 'Dancer', 'Leader', 'Maknae', 'Visual', 'All-rounder'] },
        birthdate: Date,
        nationality: String,
      },
    ],
    // Embedded social stats — avoids extra collection for small data
    socialMedia: {
      instagram: { followers: Number, handle: String },
      twitter: { followers: Number, handle: String },
      youtube: { subscribers: Number, channelId: String },
    },
    profileImage: { type: String, default: 'default-artist.jpg' },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    // Schema-level validation rules (MongoDB validator)
    collection: 'artists',
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
artistSchema.index({ stageName: 'text', agency: 'text' }); // Text search index
artistSchema.index({ nationality: 1, isActive: 1 });       // Compound index

// ─── VIRTUAL ──────────────────────────────────────────────────────────────────
artistSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

module.exports = mongoose.model('Artist', artistSchema);
