const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

router.post('/', auth, async (req, res) => {
  const { title, startTime, endTime } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
  try {
    const ev = new Event({ title, startTime, endTime, owner: req.user._id });
    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Not found' });
    if (!ev.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    const { title, startTime, endTime, status } = req.body;
    if (title) ev.title = title;
    if (startTime) ev.startTime = startTime;
    if (endTime) ev.endTime = endTime;
    if (status) ev.status = status;
    await ev.save();
    res.json(ev);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Not found' });
    if (!ev.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    await ev.remove();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
