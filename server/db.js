const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables

// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost", // MySQL Server (change if needed)
  user: process.env.DB_USER || "root", // MySQL Username
  password: process.env.DB_PASS || "root", // MySQL Password
  database: process.env.DB_NAME || "clinical_trials_db", // Your database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export database connection
module.exports = db;
