// import the mysql2 constructor from the library
const mysql = require('mysql2');
// Used for accessing connection credentials
require('dotenv').config();

// create connection to our database, pass in your MySQL information for username and password
const db = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: process.env.DB_USER,
  // Your MySQL password
  password: process.env.DB_PW,
  database: process.env.DB_NAME
});

module.exports = db;
