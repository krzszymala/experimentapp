const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const open = require('open');
const mongoose = require('mongoose'); // Poprawiono błąd w imporcie Mongoose

// Wczytanie zmiennych środowiskowych
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

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
