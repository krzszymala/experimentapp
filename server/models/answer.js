const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  stage: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
