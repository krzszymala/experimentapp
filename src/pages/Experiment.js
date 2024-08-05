import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Experiment.css';

const images = [
  { src: '/images/triangle.png', correctAnswer: 'triangle', options: ['mountains', 'car', 'moon'] },
  { src: '/images/apple.png', correctAnswer: 'apple', options: ['orange', 'tree', 'dog'] },
  { src: '/images/disable.png', correctAnswer: 'person_with_disability', options: ['car', 'table', 'race_car_driver'] },
  { src: '/images/joy.png', correctAnswer: 'joy', options: ['sadness', 'crying', 'fear'] },
  { src: '/images/sadness.png', correctAnswer: 'sadness', options: ['joy', 'fear', 'anger'] },
  { src: '/images/sun.png', correctAnswer: 'sun', options: ['orange', 'apple', 'cat'] },
  { src: '/images/rocks.png', correctAnswer: 'rocks', options: ['road', 'house', 'whale'] },
  { src: '/images/orange.png', correctAnswer: 'orange', options: ['sun', 'house', 'smile'] },
  { src: '/images/scared.png', correctAnswer: 'fear', options: ['joy', 'cat', 'sadness'] },
  { src: '/images/dog.png', correctAnswer: 'dog', options: ['cat', 'sadness', 'sweater'] }
];

const exposureTimes = [34, 50, 100, 150];
const initialPauseTime = 3000; // Initial pause before first image in milliseconds (3 seconds)
const infoDisplayTime = 3000; // Time to display exposure time information
const pauseTime = 3000; // Pause time in milliseconds (3 seconds)
const questionDelayTime = 1000; // Delay before showing question in milliseconds (1 second)

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
  const [started, setStarted] = useState(false); // Dodano zmienną `started`
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (showInfo) {
      timer = setTimeout(() => {
        setShowInfo(false);
        setIsPause(false);
      }, infoDisplayTime);
    }
    return () => clearTimeout(timer);
  }, [showInfo]);

  useEffect(() => {
    let timer;
    if (!isPause && !showQuestion && !showInfo) {
      timer = setTimeout(() => {
        setIsPause(true);
        setTimeout(() => {
          setShowQuestion(true);
        }, questionDelayTime);
      }, exposureTimes[currentRound]);
    }
    return () => clearTimeout(timer);
  }, [isPause, showQuestion, showInfo, currentRound]);

  useEffect(() => {
    if (showQuestion) {
      const shuffledOptions = [...images[currentImageIndex].options, images[currentImageIndex].correctAnswer].sort(() => Math.random() - 0.5);
      setOptions(shuffledOptions);
    }
  }, [showQuestion, currentImageIndex]);

  const handleStart = () => {
    setStarted(true); // Ustawienie `started` na true
    setShowInfo(true);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedOption) {
      return;
    }

    const data = {
      imageName: images[currentImageIndex].correctAnswer,
      answer: selectedOption,
      isCorrect: selectedOption === images[currentImageIndex].correctAnswer,
      exposureTime: exposureTimes[currentRound]
    };

    console.log('Submitting answer:', data);

    try {
      const response = await fetch('http://54.37.234.226:5000/api/answers/saveAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Answer saved:', result);

      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setIsPause(true);
        setSelectedOption('');
        setShowQuestion(false);
        setShowInfo(true);
      } else if (currentRound < exposureTimes.length - 1) {
        setCurrentImageIndex(0);
        setCurrentRound(currentRound + 1);
        setIsPause(true);
        setSelectedOption('');
        setShowQuestion(false);
        setShowInfo(true);
      } else {
        navigate('/summary');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  return (
    <div className="experiment-container">
      <h1>{t('experiment_instructions_title')}</h1>
      <p>{t('experiment_instructions_text')}</p>
      {!showInfo && !started && (
        <button onClick={handleStart}>{t('start_experiment')}</button>
      )}
      {showInfo && (
        <div className="info-popup">
          <p>{t('experiment_info_text')}</p>
        </div>
      )}
      {showQuestion && (
        <div className="question-container">
          <p>{t('select_the_correct_option')}</p>
          {options.map((option, index) => (
            <button key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))}
          <button onClick={handleAnswerSubmit}>{t('submit_answer')}</button>
        </div>
      )}
    </div>
  );
}

export default Experiment;