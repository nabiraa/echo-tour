const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');

// ── GET ALL ARTISTS ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, nationality, isActive, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.$text = { $search: search }; // Uses text index
    if (nationality) query.nationality = nationality;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [artists, total] = await Promise.all([
      Artist.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Artist.countDocuments(query),
    ]);

    res.json({ success: true, data: artists, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET SINGLE ARTIST ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' });
    res.json({ success: true, data: artist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── CREATE ARTIST ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json({ success: true, data: artist });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── UPDATE ARTIST ─────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,         // Return updated document
      runValidators: true, // Apply schema validation on update
    });
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' });
    res.json({ success: true, data: artist });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── DELETE ARTIST ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' });
    res.json({ success: true, message: 'Artist deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
