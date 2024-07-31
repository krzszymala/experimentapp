import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [meditationExperience, setMeditationExperience] = useState(false);
  const [meditationYears, setMeditationYears] = useState('');
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

    try {
      // Wysyłanie danych uczestnika do serwera
      const response = await fetch('http://localhost:80/api/participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Participant saved to MongoDB:', data);
        navigate('/training', { state: { participantId: data._id } });
      } else {
        console.error('Failed to save participant data to MongoDB');
      }
    } catch (error) {
      console.error('Error saving participant data:', error);
    }
  };

  return (
    <div className="registration-container">
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
            Lata medytacji:
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
    </div>
  );
}

export default Home;
