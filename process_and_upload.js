const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const FtpClient = require('ftp');

require('dotenv').config();

const jsonFilePath = path.join(__dirname, 'combined_matches.json');
const csvFilePath = path.join(__dirname, 'matches.csv');
const apiFilePath = path.join(__dirname, 'api_data.json');

// Function to read JSON file
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
};

// Function to read CSV file
const readCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Function to combine data from JSON and CSV
const combineData = async () => {
  try {
    const jsonData = await readJsonFile(jsonFilePath);
    const csvData = await readCsvFile(csvFilePath);

    const combinedData = jsonData.matches.map((match) => {
      const csvMatch = csvData.find(
        (row) =>
          row['Hazai csapat'] === match.home_team &&
          row['Vendég csapat'] === match.away_team
      );
      return {
        ...match,
        csv_score: csvMatch ? csvMatch['Eredmény'] : null,
      };
    });

    return combinedData;
  } catch (err) {
    console.error('Error combining data:', err);
  }
};

// Function to write combined data to API file
const writeApiFile = async (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(apiFilePath, JSON.stringify({ matches: data }, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Function to upload file to FTP server
const uploadToFTP = (filePath) => {
  const client = new FtpClient();
  client.on('ready', () => {
    client.put(filePath, path.basename(filePath), (err) => {
      if (err) throw err;
      client.end();
    });
  });

  client.connect({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
  });
};

// Main function to process and upload files
const processAndUploadFiles = async () => {
  try {
    const combinedData = await combineData();
    await writeApiFile(combinedData);
    uploadToFTP(apiFilePath);
    console.log('API file created and uploaded successfully.');
  } catch (err) {
    console.error('Error processing and uploading files:', err);
  }
};

processAndUploadFiles();