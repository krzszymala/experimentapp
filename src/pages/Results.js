import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Results.css';
import Footer from '../Footer';

const images = [
  { src: '/images/car.png', correctAnswer: 'car' },
  { src: '/images/dog2.png', correctAnswer: 'dog' },
  { src: '/images/cyclists.png', correctAnswer: 'cyclists' },
  { src: '/images/giraffe.png', correctAnswer: 'giraffe' },
  { src: '/images/buggy.png', correctAnswer: 'buggy' },
  { src: '/images/workers.png', correctAnswer: 'two' },
  { src: '/images/angry.png', correctAnswer: 'angry' },
  { src: '/images/disgusted.png', correctAnswer: 'disgusted' },
  { src: '/images/confusion.png', correctAnswer: 'confused' },
  { src: '/images/sad.png', correctAnswer: 'sad' }
];

const exposureTimes = [17, 34, 50, 100];

const Results = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const storedAnswers = JSON.parse(localStorage.getItem('answers')) || [];
    setResults(storedAnswers);
  }, []);

  const handleHomeClick = () => {
    localStorage.removeItem('participant');
    localStorage.removeItem('answers');
    navigate('/');
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Funkcja do wysyłania maila
    const mailto = `mailto:krz.szymala@gmail.com?subject=Opinia%20na%20temat%20badania&body=${encodeURIComponent(feedback)}`;
    window.location.href = mailto;
  };

  const getCorrectAnswersCount = (time) => {
    const uniqueAnswers = new Set();
    results.forEach(answer => {
      if (answer.exposureTime === time) {
        const image = images.find(img => img.src === answer.image);
        if (image && answer.answer === t(`experiment_options.${image.correctAnswer}`)) {
          uniqueAnswers.add(answer.image);
        }
      }
    });
    return uniqueAnswers.size;
  };

  return (
    <div className="results-container">
      <h1>{t('results.title')}</h1>
      <p>{t('results.exposure_time')}</p>
      <ul>
        {exposureTimes.map(time => (
          <li key={time}>{time} ms: {getCorrectAnswersCount(time)} {t('results.correct_answers')}</li>
        ))}
      </ul>
      <p>{t('results.thanks')}</p>
      <button onClick={handleHomeClick} className="home-button">{t('results.home_button')}</button>
      <h2>{t('results.feedback_title')}</h2>
      <form onSubmit={handleFeedbackSubmit} className="feedback-form">
        <textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder={t('results.feedback_placeholder')}
          rows="4"
          cols="50"
        />
        <br />
        <button type="submit" className="submit-feedback-button">{t('results.submit_feedback_button')}</button>
      </form>
      <div className="flag-container">
        {/* Dodaj odpowiednie elementy flagi tutaj */}
        <button>English</button>
        <button>Polski</button>
      </div>
      <Footer />
    </div>
  );
};

export default Results;
