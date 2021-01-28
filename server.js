require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const urlSchema = new Schema({
  url: String
});

const myUrl = mongoose.model('myUrl', urlSchema);

bodyParser.urlencoded({ extended: false });

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', function(req, res) {
  let urlString = req.body.url;
  if (!urlString.includes('https://') && !urlString.includes('http://')) {
    res.json({ error: 'invalid url' });
  } else {
    const newUrl = new myUrl({ url: urlString });
    dns.lookup(urlString, function(err, data) {
      if (err) return err;
    });
    newUrl.save(function(err, data) {
      if (err) return done(err);
      res.json({ original_url: req.body.url, short_url: data._id });
      console.log('Saved ' + urlString + ' as new entry!');
    });
  }
});

app.get('/api/shorturl/:url', function(req, res) {
  urlToGet = req.params.url;
  myUrl.findById(req.params.url, function(err, entry) {
    if (!entry.url.includes('https://') && !entry.url.includes('http://')) {
      res.json({ error: 'invalid url' });
    } else {
      if (err) return err;
      res.redirect(entry.url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
