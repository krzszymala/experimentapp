const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const participantRoutes = require('./routes/participants');
const answerRoutes = require('./routes/answers');

app.use(cors());
app.use(bodyParser.json());
app.use('/api/participants', participantRoutes);

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://krzszymala:experimentapp765@cluster0.lrm2cep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
