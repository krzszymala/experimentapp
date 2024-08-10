import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';
import Footer from '../Footer';

function Home() {
  const { t, i18n } = useTranslation();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [meditationExperience, setMeditationExperience] = useState(false);
  const [meditationYears, setMeditationYears] = useState('');
  const [meditationType, setMeditationType] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    const participantData = {
      age,
      gender,
      education,
      meditationExperience,
      meditationYears: meditationExperience ? meditationYears : null,
      meditationType: meditationExperience ? meditationType : null,
    };

    console.log('Sending participant data:', participantData);

    try {
      const response = await fetch('https://perceptionthresholdthesis.site/api/participants/saveParticipant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(t('network_error'));
      }

      const result = await response.json();
      console.log('Participant saved:', result);
      navigate('/training', { state: { participantId: result._id } });
    } catch (error) {
      console.error('Error saving participant data:', error);
      setError(error.message || t('unknown_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInfo = () => setInfoVisible(!infoVisible);
  const closeInfo = () => setInfoVisible(false);
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const generateOptions = (count, start = 1) => {
    return Array.from({ length: count }, (_, i) => (
      <option key={i + start} value={i + start}>{i + start}</option>
    ));
  };

  return (
    <div className="App">
      <div className="content">
        <div className="registration-container" style={{ position: 'relative' }}>
          <h1>{t('registration')}</h1>
          <form onSubmit={handleSubmit} className="registration-form">
            <label>
              {t('age')}
              <select value={age} onChange={(e) => setAge(e.target.value)} required>
                <option value="">{t('select')}</option>
                {generateOptions(83, 18)}
              </select>
            </label>
            <label>
              {t('gender')}
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">{t('select')}</option>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </label>
            <label>
              {t('education')}
              <select value={education} onChange={(e) => setEducation(e.target.value)} required>
                <option value="">{t('select')}</option>
                <option value="none">{t('none')}</option>
                <option value="primary">{t('primary')}</option>
                <option value="middle">{t('middle')}</option>
                <option value="vocational">{t('vocational')}</option>
                <option value="secondary">{t('secondary')}</option>
                <option value="higher">{t('higher')}</option>
              </select>
            </label>
            <label>
              {t('meditation_experience')}
              <input 
                type="checkbox" 
                checked={meditationExperience} 
                onChange={(e) => setMeditationExperience(e.target.checked)} 
              />
            </label>
            {meditationExperience && (
              <>
                <label>
                  {t('years_of_practice')}
                  <select 
                    value={meditationYears} 
                    onChange={(e) => setMeditationYears(e.target.value)} 
                    required
                  >
                    <option value="">{t('select')}</option>
                    {generateOptions(90)}
                  </select>
                </label>
                <label>
                  {t('meditation_type')}
                  <select 
                    value={meditationType} 
                    onChange={(e) => setMeditationType(e.target.value)} 
                    required
                  >
                    <option value="">{t('select')}</option>
                    <option value="mindfulness">{t('mindfulness')}</option>
                    <option value="zen">{t('zen')}</option>
                    <option value="tm">{t('tm')}</option>
                    <option value="vipassana">{t('vipassana')}</option>
                    <option value="kundalini">{t('kundalini')}</option>
                    <option value="christian_meditation">{t('christian_meditation')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </label>
              </>
            )}
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('register')}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <button className="info-button" onClick={toggleInfo}>{t('study_info')}</button>
          {infoVisible && (
            <div className="info-popup visible">
              <button className="close-button" onClick={closeInfo}>×</button>
              <h2>{t('study_info')}</h2>
              <p>{t('info_text')}</p>
            </div>
          )}
          <div className="flag-container">
            <button onClick={() => changeLanguage('en')} aria-label={t('change_to_english')}>
              <div className="flag-button"></div>
                <img src="/images/uk.png" alt="" />
              <div className="flag-text">{t('english')}</div>
            </button>
            <button onClick={() => changeLanguage('pl')} aria-label={t('change_to_polish')}>
              <div className="flag-button">
                <img src="/images/pl.png" alt="" />
                <div className="flag-text">{t('polski')}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;