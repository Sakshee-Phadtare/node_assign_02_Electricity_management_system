import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME, 
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

export default connection;
