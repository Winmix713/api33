require('dotenv').config();
const FtpSrv = require('ftp-srv');

const ftpServer = new FtpSrv(`ftp://${process.env.FTP_HOST}:21`);

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
  if (username === process.env.FTP_USERNAME && password === process.env.FTP_PASSWORD) {
    resolve({ root: process.cwd() });
  } else {
    reject(new Error('Invalid credentials'));
  }
});

ftpServer.listen()
  .then(() => {
    console.log(`FTP server is running on ftp://${process.env.FTP_HOST}:21`);
  })
  .catch(err => {
    console.error(`Failed to start FTP server: ${err.message}`);
  });