const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const open = require('open');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Port frontendowy
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(bodyParser.json());

// Serwowanie statycznych plików z katalogu build
const buildPath = path.resolve(__dirname, '../build');
app.use(express.static(buildPath));

// Serwowanie pliku index.html dla wszystkich żądań, które nie pasują do żadnych innych endpointów
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  // Automatyczne otwieranie przeglądarki z adresem localhost:5000
  await open(`http://localhost:${port}`);
});
