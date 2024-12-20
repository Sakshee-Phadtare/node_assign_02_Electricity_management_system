import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME, 
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
    return;
  }
  console.log('Connected to MySQL');
});

export default connection;

