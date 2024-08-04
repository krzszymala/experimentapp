import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const images = [
  { src: '/images/triangle.png', correctAnswer: 'Trójkąt' },
  { src: '/images/apple.png', correctAnswer: 'Jabłko' },
  { src: '/images/disable.png', correctAnswer: 'Osoba z niepełnosprawnością' },
  { src: '/images/joy.png', correctAnswer: 'Radość' },
  { src: '/images/sadness.png', correctAnswer: 'Smutek' },
  { src: '/images/sun.png', correctAnswer: 'Słońce' },
  { src: '/images/rocks.png', correctAnswer: 'Skały' },
  { src: '/images/orange.png', correctAnswer: 'Pomarańcza' },
  { src: '/images/scared.png', correctAnswer: 'Strach' },
  { src: '/images/dog.png', correctAnswer: 'Pies' }
];

const exposureTimes = [34, 50, 100, 150];

const Results = () => {
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
        if (image && answer.answer === image.correctAnswer) {
          uniqueAnswers.add(answer.image);
        }
      }
    });
    return uniqueAnswers.size;
  };

  return (
    <div className="results-container">
      <h1>Wyniki</h1>
      <p>Twój wynik w czasie ekspozycji:</p>
      <ul>
        {exposureTimes.map(time => (
          <li key={time}>{time} ms: {getCorrectAnswersCount(time)} poprawnych odpowiedzi</li>
        ))}
      </ul>
      <p>Dziękujemy za udział w badaniu!</p>
      <button onClick={handleHomeClick} className="home-button">Strona główna</button>
      <h2>Podziel się swoją opinią na temat badania lub przekaż swoje uwagi</h2>
      <form onSubmit={handleFeedbackSubmit} className="feedback-form">
        <textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder="Wpisz tutaj swoje uwagi..."
          rows="4"
          cols="50"
        />
        <br />
        <button type="submit" className="submit-feedback-button">Wyślij</button>
      </form>
    </div>
  );
};

export default Results;
