# 🏥 Clinical Trials Web App - Node.js, Express, MySQL

## 📌 Overview

This project is a **simple web application** that connects to a **MySQL database** and displays **clinical trials data** in a front-end webpage.

It uses:

- **Backend:** Node.js + Express
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript (fetch API)

---

## 📂 **Project Structure**

```
|-- 📂 node_modules/         # Installed dependencies (after running npm install)
|-- 📂 public/               # Static files (HTML, CSS, JS)
|   |-- index.html           # Frontend UI
|   |-- style.css            # Styles
|   |-- index.js             # Fetch API calls
|-- 📂 server/               # Backend (Node.js + Express)
|   |-- server.js            # Main backend server
|   |-- db.js                # Database connection logic
|-- package.json             # Node.js dependencies
|-- .gitignore               # Ignore unnecessary files
|-- .env                     # Database credentials
|-- README.md                # Documentation
```

---

## 🔹 **Step 1: Set Up MySQL Database**

Before running the application, ensure you have a **MySQL server running**.

### 🛠 **Create a Database & Tables**

1. **Log into MySQL**
   ```sql
   mysql -u root -p
   ```
2. **Create the Database**
   ```sql
   CREATE DATABASE clinical_trials_db;
   ```
3. **Use the Database**
   ```sql
   USE clinical_trials_db;
   ```
4. **Create the `clinical_trials` Table**

   ```sql
   CREATE TABLE clinical_trials (
       trial_id INT PRIMARY KEY AUTO_INCREMENT,
       trial_name VARCHAR(255) NOT NULL,
       sponsor VARCHAR(255) NOT NULL
   );
   ```

5. **Check the Table**
   ```sql
   SELECT * FROM clinical_trials;
   ```

---

## 🔹 **Step 2: Set Up Node.js Backend**

### 🛠 **Initialize the Project**

1. **Navigate to the project folder**
   ```bash
   cd ~/bootcamp/clinical-trial
   ```
2. **Initialize Node.js**
   ```bash
   npm init -y
   ```
3. **Install Dependencies**
   ```bash
   npm install express mysql2 cors dotenv
   ```

---

## 🔹 **Step 3: Set Up MySQL Connection**

1. **Create a folder for the backend**
   ```bash
   mkdir server
   cd server
   ```
2. **Create `db.js` to connect MySQL**

   ```js
   const mysql = require("mysql2");
   require("dotenv").config();

   const db = mysql.createPool({
     host: process.env.DB_HOST || "localhost",
     user: process.env.DB_USER || "root",
     password: process.env.DB_PASS || "",
     database: process.env.DB_NAME || "clinical_trials_db",
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
   });

   module.exports = db;
   ```

---

## 🔹 **Step 4: Set Up Express API**

1. **Create `server.js` inside `server/`**

   ```js
   const express = require("express");
   const cors = require("cors");
   const db = require("./db");

   const app = express();
   const PORT = process.env.PORT || 5000;

   app.use(cors());
   app.use(express.json());

   app.get("/", (req, res) => {
     res.send("Clinical Trials API is Running");
   });

   // Fetch all clinical trials
   app.get("/trials", (req, res) => {
     db.query("SELECT * FROM clinical_trials", (err, results) => {
       if (err) {
         return res.status(500).json({ error: "Database query failed" });
       }
       res.json(results);
     });
   });

   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });
   ```

---

## 🔹 **Step 5: Create `.env` File**

Create a `.env` file to store credentials:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=clinical_trials_db
PORT=5000
```

---

## 🔹 **Step 6: Start Backend Server**

1. **Run the server**
   ```bash
   node server/server.js
   ```
2. **Test API in Browser**
   ```
   http://localhost:5000/trials
   ```
   Should return JSON data.

---

## 🔹 **Step 7: Set Up Frontend**

1. **Modify `public/index.html`**

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Clinical Trials</title>
       <link rel="stylesheet" href="style.css" />
     </head>
     <body>
       <h1>Clinical Trials Data</h1>
       <table id="trialsTable">
         <thead>
           <tr>
             <th>Trial ID</th>
             <th>Trial Name</th>
             <th>Sponsor</th>
           </tr>
         </thead>
         <tbody></tbody>
       </table>
       <script src="index.js"></script>
     </body>
   </html>
   ```

2. **Modify `public/index.js`**

   ```js
   document.addEventListener("DOMContentLoaded", () => {
     fetch("http://localhost:5000/trials")
       .then((response) => response.json())
       .then((data) => {
         const tableBody = document.querySelector("#trialsTable tbody");
         tableBody.innerHTML = "";

         data.forEach((trial) => {
           const row = document.createElement("tr");
           row.innerHTML = `
                       <td>${trial.trial_id}</td>
                       <td>${trial.trial_name}</td>
                       <td>${trial.sponsor}</td>
                   `;
           tableBody.appendChild(row);
         });
       })
       .catch((error) => console.error("Error fetching trials:", error));
   });
   ```

3. **Modify `public/style.css`**

   ```css
   body {
     font-family: Arial, sans-serif;
     text-align: center;
     margin: 20px;
   }

   table {
     width: 80%;
     margin: 20px auto;
     border-collapse: collapse;
   }

   th,
   td {
     border: 1px solid #ddd;
     padding: 10px;
     text-align: left;
   }

   th {
     background-color: #007bff;
     color: white;
   }

   tr:nth-child(even) {
     background-color: #f2f2f2;
   }
   ```

---

## 🔹 **Step 8: Run the Web App**

1. **Start Backend**
   ```bash
   node server/server.js
   ```
2. **Open `index.html` in Browser**
   - Right-click `index.html` > **"Open with Live Server"**
   - **OR** open manually in the browser.

You should see the **clinical trials table populated with MySQL data!** 🎉

---

---

## 🛠 **Troubleshooting**

**Q: My API doesn’t return data?**

- Run `SHOW TABLES;` in MySQL to confirm the table exists.
- Check if the `.env` file has the correct database credentials.

**Q: CORS errors in the browser?**

- Make sure the backend server is **running** and includes `app.use(cors());`.

---
