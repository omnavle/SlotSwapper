const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({ status: 'SWAPPABLE', owner: { $ne: req.user._id } }).populate('owner', 'name email');
    res.json(slots);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/swap-request', auth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) return res.status(400).json({ message: 'Missing slot ids' });

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const mySlot = await Event.findById(mySlotId).session(session);
      const theirSlot = await Event.findById(theirSlotId).session(session);
      if (!mySlot || !theirSlot) throw new Error('Slot not found');
      if (!mySlot.owner.equals(req.user._id)) throw new Error('mySlot not owned by you');
      if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') throw new Error('Both slots must be SWAPPABLE');
      if (theirSlot.owner.equals(req.user._id)) throw new Error('Cannot request your own slot');

      const swapReq = new SwapRequest({ fromUser: req.user._id, toUser: theirSlot.owner, mySlot: mySlot._id, theirSlot: theirSlot._id });
      await swapReq.save({ session });
      mySlot.status = 'SWAP_PENDING';
      theirSlot.status = 'SWAP_PENDING';
      await mySlot.save({ session });
      await theirSlot.save({ session });
      result = swapReq;
    });
    session.endSession();
    res.json(result);
  } catch (err) {
    session.endSession();
    console.error(err);
    res.status(400).json({ message: err.message || 'Error creating swap request' });
  }
});

router.get('/my-requests', auth, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ toUser: req.user._id }).populate('fromUser', 'name email').populate('mySlot').populate('theirSlot');
    const outgoing = await SwapRequest.find({ fromUser: req.user._id }).populate('toUser', 'name email').populate('mySlot').populate('theirSlot');
    res.json({ incoming, outgoing });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/swap-response/:requestId', auth, async (req, res) => {
  const { accept } = req.body;
  const { requestId } = req.params;

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const swapReq = await SwapRequest.findById(requestId).session(session);
      if (!swapReq) throw new Error('Swap request not found');
      if (!swapReq.toUser.equals(req.user._id)) throw new Error('Not authorized to respond');
      if (swapReq.status !== 'PENDING') throw new Error('Request already handled');

      const mySlot = await Event.findById(swapReq.mySlot).session(session);
      const theirSlot = await Event.findById(swapReq.theirSlot).session(session);
      if (!mySlot || !theirSlot) throw new Error('One of the slots missing');

      if (!accept) {
        swapReq.status = 'REJECTED';
        mySlot.status = 'SWAPPABLE';
        theirSlot.status = 'SWAPPABLE';
        await mySlot.save({ session });
        await theirSlot.save({ session });
        await swapReq.save({ session });
        result = swapReq;
      } else {
        const fromUserId = swapReq.fromUser;
        const toUserId = swapReq.toUser;

        mySlot.owner = toUserId;
        theirSlot.owner = fromUserId;
        mySlot.status = 'BUSY';
        theirSlot.status = 'BUSY';

        swapReq.status = 'ACCEPTED';

        await mySlot.save({ session });
        await theirSlot.save({ session });
        await swapReq.save({ session });
        result = swapReq;
      }
    });
    session.endSession();
    res.json(result);
  } catch (err) {
    session.endSession();
    console.error(err);
    res.status(400).json({ message: err.message || 'Error responding to swap' });
  }
});

module.exports = router;
