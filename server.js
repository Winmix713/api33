const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = 3000;

app.get('/matches', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'matches.csv');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);
    });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});