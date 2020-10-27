require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const MOVIES = require('./movies-data.json');

const app = express();

const PORT = process.env.PORT || 8000;

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));

app.use(cors());

app.use(helmet());

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.use(validateBearerToken);

app.get('/movie', handleGetMovie);

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized Request' });
  }
  // move to the next middleware
  next();
}

function handleGetMovie(req, res) {
  let response = MOVIES;
  //filter by genre
  if (req.query.genre) {
    response = response.filter((movie) => {
      return movie.genre.toLowerCase().includes(req.query.genre.toLowerCase());
    });
  }
  //filter by country
  if (req.query.country) {
    response = response.filter((movie) => {
      return movie.country
        .toLowerCase()
        .includes(req.query.country.toLowerCase());
    });
  }
  //filter by avg vote
  if (req.query.avg_vote) {
    response = response.filter((movie) => {
      return Number(movie.avg_vote) >= Number(req.query.avg_vote);
    });
  }

  res.json(response);
}

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
