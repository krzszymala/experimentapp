import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Experiment.css';
import Footer from '../Footer';

const images = [
  { src: '/images/car.png', correctAnswer: 'car', options: ['square', 'triangle', 'bicycle'] },
  { src: '/images/dog2.png', correctAnswer: 'dog', options: ['cat', 'cow', 'horse'] },
  { src: '/images/cyclists.png', correctAnswer: 'cyclists', options: ['car', 'horses', 'walking_people'] },
  { src: '/images/giraffe.png', correctAnswer: 'giraffe', options: ['snake', 'ostrich', 'bench'] },
  { src: '/images/buggy.png', correctAnswer: 'buggy', options: ['wheelchair', 'bicycle', 'scooter'] },
  { src: '/images/workers.png', correctAnswer: 'two', options: ['none', 'one', 'three'] },
  { src: '/images/angry.png', correctAnswer: 'angry', options: ['smiling', 'sad', 'surprised'] },
  { src: '/images/disgusted.png', correctAnswer: 'disgusted', options: ['angry', 'smiling', 'surprised'] },
  { src: '/images/confusion.png', correctAnswer: 'confused', options: ['smiling', 'sad', 'angry'] },
  { src: '/images/sad.png', correctAnswer: 'sad', options: ['smiling', 'angry', 'disgusted'] }
];

const exposureTimes = [17, 34, 50, 100];
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
    const correctAnswer = t(`experiment_options.${images[currentImageIndex].correctAnswer}`);
    const incorrectAnswers = images[currentImageIndex].options.map(option => t(`experiment_options.${option}`));
    const allOptions = [...incorrectAnswers, correctAnswer].sort(() => 0.5 - Math.random());
    setOptions([...allOptions, t('i_dont_know')]);
  }, [currentImageIndex, t]);

  useEffect(() => {
    if (showQuestion) {
      generateOptions();
    }
  }, [showQuestion, generateOptions]);

  const handleStart = () => {
    localStorage.removeItem('answers'); // Wyczyszczenie zapisanych odpowiedzi
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
      console.log('Sending answer data to server:', answerData);
      const response = await fetch('https://perceptionthresholdthesis.site/api/participants/saveAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const result = await response.json();
      console.log('Answer saved successfully:', result);
    } catch (error) {
      console.error('Error saving answer data:', error);
    }
  };

  const handleAnswerSubmit = () => {
    const translatedCorrectAnswer = t(`experiment_options.${images[currentImageIndex].correctAnswer}`);
    const isCorrect = answer === translatedCorrectAnswer;
  
    console.log('Translated correct answer:', translatedCorrectAnswer);
    console.log('User answer:', answer);
    console.log('Is answer correct:', isCorrect);
  
    const answerData = {
      participantId,
      image: images[currentImageIndex].src,
      answer,
      exposureTime: exposureTimes[currentRound],
      correct: isCorrect,
      stage: 1,
      phase: 'experiment'
    };
  
    console.log("Answer data being saved: ", answerData);
  
    // Pobierz obecnie zapisane odpowiedzi
    const savedAnswers = JSON.parse(localStorage.getItem('answers')) || [];
  
    console.log('Checking for duplicates...');
    console.log('Saved answers:', savedAnswers);
  
    // Sprawdź, czy odpowiedź już istnieje
    const isDuplicate = savedAnswers.some(savedAnswer => {
      console.log('Comparing saved answer:', savedAnswer);
      console.log('With current answer data:', answerData);
      return savedAnswer.image === answerData.image &&
             savedAnswer.exposureTime === answerData.exposureTime &&
             savedAnswer.participantId === answerData.participantId;
    });
  
    if (isDuplicate) {
      console.log('Duplicate answer detected, not saving.');
    } else {
      // Zapis odpowiedzi lokalnie
      localStorage.setItem('answers', JSON.stringify([...savedAnswers, answerData]));
      console.log('Current saved answers:', JSON.parse(localStorage.getItem('answers'))); // Logowanie obecnie zapisanych odpowiedzi
      
      // Zapis odpowiedzi na serwerze tylko jeśli nie jest duplikatem
      saveResponse(answerData);
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
    <div className="App">
      <div className="content">
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
      </div>
      <Footer />
    </div>
  );
}

export default Experiment;
