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
app.use('/api/answers', answerRoutes);

const mongoURI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

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
