import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Training.css';

const images = [
  { src: '/images/square.png', name: 'Square' },
  { src: '/images/circle.png', name: 'Circle' },
  { src: '/images/cat.png', name: 'Cat' },
  { src: '/images/smile.png', name: 'Smile' },
];

const randomWords = [
  'House', 'Car', 'Phone', 'Apple', 'Computer', 
  'Book', 'Pen', 'Watch', 'Dog', 'Clock',
  'Bike', 'Door', 'Lamp', 'Table', 'Chair',
  'TV', 'Key', 'Window', 'Shoes', 'Flower'
];

const displayTime = 300; // Time to display image in milliseconds (300 ms)
const initialPauseTime = 3000; // Initial pause before first image in milliseconds (3 seconds)
const pauseTime = 3000; // Pause time in milliseconds (3 seconds)
const questionDelayTime = 1000; // Delay before showing question in milliseconds (1 second)

function Training() {
  const { t } = useTranslation();
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
  }, [started, isPause, showQuestion, currentImageIndex]);

  useEffect(() => {
    if (showQuestion) {
      const shuffledWords = [...randomWords].sort(() => Math.random() - 0.5);
      const options = shuffledWords.slice(0, 4);
      options.push(images[currentImageIndex].name);
      setOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [showQuestion, currentImageIndex]);

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => {
      setIsPause(false);
    }, initialPauseTime);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedOption) {
      return;
    }

    const data = {
      participantId,
      imageName: images[currentImageIndex].name,
      answer: selectedOption,
      isCorrect: selectedOption === images[currentImageIndex].name,
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
        setTimeout(() => {
          setIsPause(false);
        }, pauseTime);
      } else {
        navigate('/summary');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  return (
    <div className="training-container">
      {!started ? (
        <div className="instructions">
          <h2>{t('training_instructions_title')}</h2>
          <p>
            {t('training_instructions_text')}
          </p>
          <button onClick={handleStart} className="start-button">
            {t('training_start')}
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
              <h2>{t('training_question')}</h2>
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
                <button type="submit" className="submit-button">{t('training_submit_answer')}</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Training;
