import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [meditationExperience, setMeditationExperience] = useState(false);
  const [meditationYears, setMeditationYears] = useState('');
  const [infoVisible, setInfoVisible] = useState(false); // Dodany stan do zarządzania widocznością dymka
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const participantData = {
      age,
      gender,
      education,
      meditationExperience,
      meditationYears: meditationExperience ? meditationYears : null,
    };

    console.log('Sending participant data:', participantData);

    try {
      const response = await fetch('http://54.37.234.226:5000/api/participants/saveParticipant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Participant saved:', result);
      navigate('/training', { state: { participantId: result._id } });
    } catch (error) {
      console.error('Error saving participant data:', error);
    }
  };

  const toggleInfo = () => {
    setInfoVisible(!infoVisible); // Przełączanie widoczności dymka
  };

  const closeInfo = () => {
    setInfoVisible(false); // Zamknięcie dymka
  };

  return (
    <div className="registration-container" style={{ position: 'relative' }}>
      <h1>Rejestracja</h1>
      <form onSubmit={handleSubmit} className="registration-form">
        <label>
          Wiek:
          <select value={age} onChange={(e) => setAge(e.target.value)} required>
            <option value="">Wybierz</option>
            {[...Array(73).keys()].map(i => (
              <option key={i + 18} value={i + 18}>{i + 18}</option>
            ))}
          </select>
        </label>
        <label>
          Płeć:
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Wybierz</option>
            <option value="male">Mężczyzna</option>
            <option value="female">Kobieta</option>
          </select>
        </label>
        <label>
          Wykształcenie:
          <select value={education} onChange={(e) => setEducation(e.target.value)} required>
            <option value="">Wybierz</option>
            <option value="none">Brak wykształcenia</option>
            <option value="primary">Podstawowe</option>
            <option value="middle">Gimnazjalne</option>
            <option value="vocational">Zawodowe</option>
            <option value="secondary">Średnie</option>
            <option value="higher">Wyższe</option>
          </select>
        </label>
        <label>
          Doświadczenie w medytacji:
          <input type="checkbox" checked={meditationExperience} onChange={(e) => setMeditationExperience(e.target.checked)} />
        </label>
        {meditationExperience && (
          <label>
            Lata praktyki:
            <select value={meditationYears} onChange={(e) => setMeditationYears(e.target.value)} required>
              <option value="">Wybierz</option>
              {[...Array(90).keys()].map(i => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className="submit-button">Zarejestruj</button>
      </form>
      <button className="info-button" onClick={toggleInfo}>Informacje o badaniu</button>
      {infoVisible && (
        <div className="info-popup visible">
          <button className="close-button" onClick={closeInfo}>×</button>
          <h2>Informacje o badaniu</h2>
          <p>
            Nazywam się Krzysztof Szymała, jestem studentem kognitywistyki na Uniwersytecie Śląskim w Katowicach. 
            Moje badanie dotyczy różnic w percepcji bodźców wzrokowych u osób medytujących i niemeditujących i jest częścią pracy magisterskiej,
            której tytuł to "Wpływ technik medytacyjnych na wybrane procesy poznawcze człowieka".
            Udział w badaniu pomoże w zgłębianiu wpływu medytacji na nasze zdolności percepcyjne.
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
