const express = require('express');
const router = express.Router();
const Answer = require('../models/answer');
const Participant = require('../models/Participant');

// Route to save participant data
router.post('/saveParticipant', async (req, res) => {
  const participant = new Participant(req.body);
  try {
    await participant.save();
    res.status(201).send(participant);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Route to save answer data
router.post('/saveAnswer', async (req, res) => {
  const answer = new Answer(req.body);
  try {
    await answer.save();
    res.status(201).send(answer);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
