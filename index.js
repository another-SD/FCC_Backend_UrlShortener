require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validator = require('validator');
const dns = require('dns');
const url = require('url');

// connecting to database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// to parse json objects and a middleware for it
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// mongoDB Schema and Model
let urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    require: true,
    unique: true
  },
  short_url: {
    type: Number,
    unique: true
  }
})

let urlModel = mongoose.model('urlModel', urlSchema)

// this is where project starts
app.post("/api/shorturl", (req, res) => {
  // we are going to look that if a given url exists 
  // by checking if that url has an ip address in dns server
  const inputurl = req.body.url;
  let hostname = new URL(inputurl).hostname;

  dns.lookup(hostname, async (err, data) => {
    if (!data) return res.json({error: "Invalid url"})
    else {
      let counter = await urlModel.countDocuments({})
      let addit = await urlModel.create({
        original_url: inputurl, short_url: counter
      })
      res.json({original_url: inputurl, short_url: counter})
    }
  })
})

app.get("/api/shorturl/:num", async (req, res) => {
  let num = req.params.num;
  let a = await urlModel.findOne({short_url: num});
  res.redirect(a.original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
