import mysql2 from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

// Create a MySQL connection pool
const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD
}).promise();

// Extremely simple error handling function
const errorHandling = (err) => err && console.error(err);

// Get messages from the database
export const getMessages = async (messageAmount) => await pool.query('CALL getMessages(?)', [messageAmount], errorHandling).then(res => res[0][0]);

// Send a message to the database
export const sendMessage = async (userId, message) => await pool.query('CALL sendMessage(?,?)', [userId, message], errorHandling);

// Register a new user in the database
export const newUser = (username, password) => pool.query('CALL newUser(?,?)', [username, password], errorHandling);

// Authenticate a user in the database
export const authenticateUser = (username, password) => pool.query('CALL authenticateUser(?,?)', [username, password], errorHandling);