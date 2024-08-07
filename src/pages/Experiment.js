import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Experiment.css';

const images = [
  { src: '/images/triangle.png', correctAnswer: 'Trójkąt', options: ['Góry', 'Samochód', 'Księżyc'] },
  { src: '/images/apple.png', correctAnswer: 'Jabłko', options: ['Pomarańcza', 'Drzewo', 'Pies'] },
  { src: '/images/disable.png', correctAnswer: 'Osoba z niepełnosprawnością', options: ['Samochód', 'Stół', 'Kierowca wyścigówki'] },
  { src: '/images/joy.png', correctAnswer: 'Radość', options: ['Smutek', 'Płacz', 'Strach'] },
  { src: '/images/sadness.png', correctAnswer: 'Smutek', options: ['Radość', 'Strach', 'Złość'] },
  { src: '/images/sun.png', correctAnswer: 'Słońce', options: ['Pomarańcza', 'Jabłko', 'Kot'] },
  { src: '/images/rocks.png', correctAnswer: 'Skały', options: ['Droga', 'Dom', 'Wieloryb'] },
  { src: '/images/orange.png', correctAnswer: 'Pomarańcza', options: ['Słońce', 'Dom', 'Uśmiech'] },
  { src: '/images/scared.png', correctAnswer: 'Strach', options: ['Radość', 'Kot', 'Smutek'] },
  { src: '/images/dog.png', correctAnswer: 'Pies', options: ['Kot', 'Smutek', 'Sweter'] }
];

const exposureTimes = [34, 50, 100, 150];
const initialPauseTime = 3000; // Początkowa przerwa przed pierwszym obrazem w milisekundach (3 sekundy)
const infoDisplayTime = 3000; // Czas wyświetlania informacji o czasie ekspozycji
const pauseTime = 3000; // Czas przerwy w milisekundach (3 sekundy)
const questionDelayTime = 1000; // Czas opóźnienia przed wyświetleniem pytania w milisekundach (1 sekunda)

function Experiment() {
  const { t } = useTranslation();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPause, setIsPause] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  const participantId = location.state?.participantId;

  useEffect(() => {
    if (!participantId) {
      navigate('/');
      return;
    }
  }, [participantId, navigate]);

  useEffect(() => {
    let timer;
    if (started && !isPause && !showQuestion && !showInfo) {
      console.log(`Displaying image: ${images[currentImageIndex].correctAnswer} for ${exposureTimes[currentRound]} ms`);
      timer = setTimeout(() => {
        setIsPause(true);
        setTimeout(() => {
          setShowQuestion(true);
          console.log('Showing question');
        }, questionDelayTime);
      }, exposureTimes[currentRound]);
    }

    return () => clearTimeout(timer);
  }, [isPause, navigate, started, showQuestion, showInfo, currentImageIndex, currentRound]);

  const generateOptions = useCallback(() => {
    const correctAnswer = images[currentImageIndex].correctAnswer;
    const incorrectAnswers = images[currentImageIndex].options;
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
    console.log('Starting experiment...');
    setShowInfo(true);
    setTimeout(() => {
      setShowInfo(false);
      setTimeout(() => {
        setIsPause(false);
        console.log('Initial pause ended, showing first image');
      }, pauseTime);
    }, infoDisplayTime);
  };

  const saveResponse = async (answerData) => {
    try {
      const response = await fetch('http://54.37.234.226:5000/api/participants/saveAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Answer saved:', result);
    } catch (error) {
      console.error('Error saving answer data:', error);
    }
  };

  const handleAnswerSubmit = () => {
    console.log(`Answer submitted: ${answer}`);
    const answerData = {
      participantId,
      image: images[currentImageIndex].src,
      answer,
      exposureTime: exposureTimes[currentRound],
      stage: 1,
      phase: 'experiment'
    };
    console.log("Answer data being saved: ", answerData);

    // Pobierz obecnie zapisane odpowiedzi
    const savedAnswers = JSON.parse(localStorage.getItem('answers')) || [];

    // Sprawdź, czy odpowiedź już istnieje
    const isDuplicate = savedAnswers.some(savedAnswer =>
      savedAnswer.image === answerData.image &&
      savedAnswer.exposureTime === answerData.exposureTime
    );

    if (!isDuplicate) {
      // Zapis odpowiedzi lokalnie
      localStorage.setItem('answers', JSON.stringify([...savedAnswers, answerData]));
      console.log('Current saved answers:', JSON.parse(localStorage.getItem('answers'))); // Logowanie obecnie zapisanych odpowiedzi
      
      // Zapis odpowiedzi na serwerze tylko jeśli nie jest duplikatem
      saveResponse(answerData);
    } else {
      console.log('Duplicate answer detected, not saving.');
    }

    setAnswers([...answers, answerData]);
    setAnswer('');
    setSelectedOption('');
    setShowQuestion(false);
    if (currentImageIndex + 1 === images.length) {
      if (currentRound + 1 === exposureTimes.length) {
        navigate('/results', { state: { participantId, answers: [...answers, answerData] } }); // Pass the complete answers list
      } else {
        setCurrentRound(prevRound => prevRound + 1);
        setCurrentImageIndex(0);
        setShowInfo(true);
        setTimeout(() => {
          setShowInfo(false);
          setTimeout(() => {
            setIsPause(false);
          }, pauseTime);
        }, infoDisplayTime);
      }
    } else {
      setTimeout(() => {
        setIsPause(false);
        setCurrentImageIndex(prevIndex => prevIndex + 1);
      }, pauseTime);
    }
  };

  const handleOptionClick = (option) => {
    setAnswer(option);
    setSelectedOption(option);
  };

  return (
    <div className="experiment-container">
      {!started ? (
        <div className="registration-container">
          <h1>{t('experiment_instructions_title')}</h1>
          <p className="study-description">
            {t('experiment_instructions_text')}
          </p>
          <button onClick={handleStart} className="start-button">
            {t('experiment_start')}
          </button>
        </div>
      ) : (
        <>
          {showInfo && (
            <div className="info-container">
              <h2>{t('experiment_exposure_time')}: {exposureTimes[currentRound]} ms</h2>
            </div>
          )}
          {!showInfo && !showQuestion && (
            <div className="image-container">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.correctAnswer}
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
              <h2>{t('experiment_question')}</h2>
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
                <button type="submit" className="submit-button">{t('experiment_submit_answer')}</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Experiment;
