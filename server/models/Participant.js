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
  },

  meditationType: {
    type: String,
    required: false,
    enum: ['mindfulness', 'zen', 'fa', 'tm', 'om', 'yoga', 'lkm', 'vipassana', 'kundalini', 'christian_meditation', 'other']  }
  
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
