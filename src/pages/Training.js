// Training.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Training.css';

const images = [
  { src: '/images/square.png', name: 'kwadrat' },
  { src: '/images/circle.png', name: 'koło' },
  { src: '/images/cat.png', name: 'kot' },
  { src: '/images/smile.png', name: 'uśmiech' },
];

const randomWords = [
  'Dom', 'Samochód', 'Telefon', 'Jabłko', 'Komputer', 
  'Książka', 'Długopis', 'Zegarek', 'Pies', 'Zegar',
  'Rower', 'Drzwi', 'Lampa', 'Stół', 'Krzesło',
  'Telewizor', 'Klucz', 'Okno', 'Buty', 'Kwiat'
];

const displayTime = 300; // Czas wyświetlania w milisekundach (300 ms)
const initialPauseTime = 3000; // Początkowa przerwa przed pierwszym obrazem w milisekundach (3 sekundy)
const pauseTime = 3000; // Czas przerwy w milisekundach (3 sekundy)
const questionDelayTime = 1000; // Czas opóźnienia przed wyświetleniem pytania w milisekundach (1 sekunda)

function Training() {
  const location = useLocation();
  const { participantId } = location.state || {};
  console.log("Participant ID in Training: ", participantId);

  const [started, setStarted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPause, setIsPause] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (started && !isPause && !showQuestion) {
      console.log(`Displaying image: ${images[currentImageIndex].name} for ${displayTime} ms`);
      timer = setTimeout(() => {
        setIsPause(true);
        setTimeout(() => {
          setShowQuestion(true);
          console.log('Showing question');
        }, questionDelayTime);
      }, displayTime);
    }

    return () => clearTimeout(timer);
  }, [isPause, navigate, started, showQuestion, currentImageIndex]);

  // Memoize the generateOptions function
  const generateOptions = useCallback(() => {
    const correctAnswer = images[currentImageIndex].name;
    const incorrectAnswers = randomWords
      .filter(word => word !== correctAnswer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const allOptions = [...incorrectAnswers, correctAnswer].sort(() => 0.5 - Math.random());
    setOptions([...allOptions, 'Nie wiem']);
  }, [currentImageIndex]);

  useEffect(() => {
    if (showQuestion) {
      generateOptions();
    }
  }, [showQuestion, generateOptions]);

  const handleStart = () => {
    setStarted(true);
    console.log('Starting training...');
    setTimeout(() => {
      setIsPause(false);
      console.log('Initial pause ended, showing first image');
    }, initialPauseTime);
  };

  const handleAnswerSubmit = async () => {
    console.log(`Answer submitted: ${answer}`);
    console.log("Submitting answer with participant ID: ", participantId);
    const answerData = {
      participantId,
      image: images[currentImageIndex].name,
      answer,
      stage: 1,
      phase: 'training' // Dodanie pola phase z wartością training
    };
    console.log("Answer data being sent: ", answerData);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response from server:', result);
    } catch (error) {
      console.error('Error saving answer:', error);
    }

    setAnswer('');
    setSelectedOption('');
    setShowQuestion(false);
    if (currentImageIndex + 1 === images.length) {
      navigate('/experiment', { state: { participantId } }); // Przekazanie participantId do Experiment.js
    } else {
      setTimeout(() => {
        setIsPause(false);
        setCurrentImageIndex(prevIndex => prevIndex + 1);
        console.log('Pause ended, showing next image');
      }, pauseTime);
    }
  };

  const handleOptionClick = (option) => {
    setAnswer(option);
    setSelectedOption(option);
  };

  return (
    <div className="training-container">
      {!started ? (
        <div className="registration-container">
          <h1>Instrukcje</h1>
          <p className="study-description">
            W ramach tego eksperymentu będą prezentowane obrazy o czasie ekspozycji 300 ms. Po każdej prezentacji pojawi się pytanie o to, co pojawiło się na ekranie. Jeśli nie jesteś pewien odpowiedzi, proszę, nie strzelaj – wybierz opcję "nie wiem".
            <br /><br />
            Upewnij się, że wykonujesz eksperyment w odpowiednio oświetlonym pomieszczeniu. Jeśli jest to w godzinach nocnych, zaleca się zapalenie światła, aby zapewnić dobre warunki widoczności.
          </p>
          <div className="warning-box">
            <strong>Ostrzeżenie:</strong> Osoby cierpiące na epilepsję nie powinny wykonywać tego eksperymentu.
          </div>
          <button onClick={handleStart} className="start-button">
            Start
          </button>
        </div>
      ) : (
        <>
          {!showQuestion && (
            <div className="image-container">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.name}
                  className="image"
                  style={{
                    display: index === currentImageIndex && !isPause && !showQuestion ? 'block' : 'none'
                  }}
                />
              ))}
            </div>
          )}
          {showQuestion && (
            <div className="question-container">
              <h2>Co widziałeś na obrazku?</h2>
              <form onSubmit={e => { e.preventDefault(); handleAnswerSubmit(); }}>
                <ul className="options-list">
                  {options.map((option, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className={option === selectedOption ? 'selected' : ''}
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
                <br />
                <button type="submit" className="submit-button">Zatwierdź odpowiedź</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Training;
