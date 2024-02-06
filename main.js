const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const sessions = {};
const sessionDuration = 60 * 60 * 1000; // Session duration is 1 hour

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  const sessionId = req.cookies.sessionId || crypto.randomBytes(16).toString('hex');
  res.cookie('sessionId', sessionId, { httpOnly: true, path: '/' });

  console.log('Session ID - ', sessionId);

  let sessionData = sessions[sessionId] || {};
  sessionData.lastAccessed = Date.now();

  res.sendFile(path.join(__dirname, 'views', 'client.html'));

  sessions[sessionId] = sessionData;
});

app.post('/survey', (req, res) => {
  const sessionId = req.cookies.sessionId;
  let sessionData = sessions[sessionId] || {};

  const { name, age } = req.body;
  sessionData = { name, age, lastAccessed: Date.now() };

  console.log(sessionData);

  res.sendFile(path.join(__dirname, 'views', 'surveySubmitted.html'));

  sessions[sessionId] = sessionData;
});

app.get('/getData', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const sessionData = sessions[sessionId] || {};

  if (sessionData.lastAccessed && Date.now() - sessionData.lastAccessed > sessionDuration) {
    delete sessions[sessionId];
    res.send('Session has expired.');
  } else {
    res.send(`Session ID: ${sessionId}<br>Session Data: ${JSON.stringify(sessionData)}`);
  }
});

app.get('/surveySubmitted', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'surveySubmitted.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'results.html'));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
