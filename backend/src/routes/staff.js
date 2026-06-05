const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

router.get('/', async (req, res) => {
  try {
    const { role, isAvailable } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    const staff = await Staff.find(query).sort({ name: 1 });
    res.json({ success: true, data: staff, total: staff.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('concertsWorked', 'title date');
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
