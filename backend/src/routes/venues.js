const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// GET all venues
router.get('/', async (req, res) => {
  try {
    const { country, city, minCapacity, venueType } = req.query;
    const query = {};
    if (country) query.country = new RegExp(country, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (minCapacity) query.capacity = { $gte: parseInt(minCapacity) };
    if (venueType) query.venueType = venueType;

    const venues = await Venue.find(query).sort({ capacity: -1 });
    res.json({ success: true, data: venues, total: venues.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json({ success: true, data: venue });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
    res.json({ success: true, message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GEOSPATIAL: Find venues near a location
router.get('/geo/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 500000 } = req.query; // default 500km
    if (!lng || !lat) return res.status(400).json({ success: false, error: 'lng and lat required' });

    const venues = await Venue.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).limit(10);

    res.json({ success: true, data: venues });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
