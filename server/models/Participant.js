const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  meditationExperience: {
    type: Boolean,
    required: true
  },
  meditationYears: {
    type: Number,
    required: false
  }
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
