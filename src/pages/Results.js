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

  useEffect(() => {
    const storedAnswers = JSON.parse(localStorage.getItem('answers')) || [];
    setResults(storedAnswers);
  }, []);

  const handleHomeClick = () => {
    localStorage.removeItem('participant');
    localStorage.removeItem('answers');
    navigate('/');
  };

  const getCorrectAnswersCount = (time) => {
    // Tworzymy zestaw, aby uniknąć liczenia duplikatów
    const uniqueAnswers = new Set();
    results.forEach(answer => {
      if (answer.exposureTime === time) {
        const image = images.find(img => img.src === answer.image);
        if (image && answer.answer === image.correctAnswer) {
          uniqueAnswers.add(answer.image); // dodajemy tylko unikalne obrazy
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
    </div>
  );
};

export default Results;
