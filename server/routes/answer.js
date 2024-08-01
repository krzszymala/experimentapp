const express = require('express');
const router = express.Router();
const Answer = require('../models/answer');

// Pobierz wszystkie odpowiedzi
router.get('/', async (req, res) => {
  try {
    const answers = await Answer.find();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pobierz jedną odpowiedź po ID
router.get('/:id', getAnswer, (req, res) => {
  res.json(res.answer);
});

// Utwórz nową odpowiedź
router.post('/', async (req, res) => {
  const answer = new Answer({
    questionId: req.body.questionId,
    answerText: req.body.answerText,
    isCorrect: req.body.isCorrect
  });

  try {
    const newAnswer = await answer.save();
    res.status(201).json(newAnswer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Zaktualizuj odpowiedź
router.patch('/:id', getAnswer, async (req, res) => {
  if (req.body.answerText != null) {
    res.answer.answerText = req.body.answerText;
  }
  if (req.body.isCorrect != null) {
    res.answer.isCorrect = req.body.isCorrect;
  }

  try {
    const updatedAnswer = await res.answer.save();
    res.json(updatedAnswer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Usuń odpowiedź
router.delete('/:id', getAnswer, async (req, res) => {
  try {
    await res.answer.remove();
    res.json({ message: 'Deleted Answer' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware do pobrania odpowiedzi po ID
async function getAnswer(req, res, next) {
  let answer;
  try {
    answer = await Answer.findById(req.params.id);
    if (answer == null) {
      return res.status(404).json({ message: 'Cannot find answer' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.answer = answer;
  next();
}

module.exports = router;
