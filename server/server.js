const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const open = require('open');
const mongoose = require('mongoose'); // Poprawiono błąd w imporcie Mongoose

// Wczytanie zmiennych środowiskowych
require('dotenv').config();

const app = express();
const port = process.env.PORT || 80;

app.use(cors({
  origin: 'http://localhost:3000', // Port frontendowy
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(bodyParser.json());

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB', error);
});

// Logowanie połączeń do MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + process.env.MONGODB_URI);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Serwowanie statycznych plików z katalogu build
const buildPath = path.resolve(__dirname, '../build');
app.use(express.static(buildPath));

// Endpointy dla API
const participantRoutes = require('./routes/participants');
app.use('/api/participants', participantRoutes);

// Serwowanie pliku index.html dla wszystkich żądań, które nie pasują do żadnych innych endpointów
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  // Automatyczne otwieranie przeglądarki z adresem localhost:5000
  await open(`http://localhost:${port}`);
});

console.log('MONGODB_URI:', process.env.MONGODB_URI);

app.get('/test-db', async (req, res) => {
  try {
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const testDoc = new Test({ name: 'Test' });
    await testDoc.save();
    const result = await Test.find();
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});