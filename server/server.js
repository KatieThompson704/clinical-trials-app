// ✅ Import required modules
const express = require("express");
const cors = require("cors");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Default Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/* 🔍 READ (Fetch Data) */

// ✅ Get All Clinical Trials
app.get("/trials", (req, res) => {
  db.query("SELECT * FROM clinical_trials", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get Patients by Trial ID (Search Functionality)
app.get("/patients/trial/:trial_id", (req, res) => {
  const sql = "SELECT * FROM patients WHERE trial_id = ?";
  db.query(sql, [req.params.trial_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get All Patients with Filtering for Charts
app.get("/patients", (req, res) => {
  let sql = "SELECT * FROM patients WHERE 1=1";
  let params = [];

  if (req.query.sponsor) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE sponsor = ?)";
    params.push(req.query.sponsor);
  }

  if (req.query.phase) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE phase = ?)";
    params.push(req.query.phase);
  }

  if (req.query.condition) {
    sql += " AND medical_condition = ?";
    params.push(req.query.condition);
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get Patient Age Distribution by Groups (Updated for Filtering)
app.get("/stats/age-groups", (req, res) => {
  let sql = `
      SELECT 
          CASE 
              WHEN age BETWEEN 0 AND 25 THEN '0-25'
              WHEN age BETWEEN 26 AND 35 THEN '26-35'
              WHEN age BETWEEN 36 AND 45 THEN '36-45'
              WHEN age BETWEEN 46 AND 55 THEN '46-55'
              WHEN age BETWEEN 56 AND 65 THEN '56-65'
              WHEN age BETWEEN 66 AND 75 THEN '66-75'
              ELSE '76+' 
          END AS age_group, 
          COUNT(*) AS count
      FROM patients
      WHERE 1=1
  `;
  let params = [];

  if (req.query.sponsor) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE sponsor = ?)";
    params.push(req.query.sponsor);
  }
  if (req.query.phase) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE phase = ?)";
    params.push(req.query.phase);
  }
  if (req.query.condition) {
    sql += " AND medical_condition = ?";
    params.push(req.query.condition);
  }

  sql += " GROUP BY age_group ORDER BY age_group;";

  db.query(sql, params, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json(result);
  });
});

// ✅ Get Adverse Events by Severity with Filtering
app.get("/stats/adverse-events", (req, res) => {
  let sql = `
    SELECT severity, COUNT(*) AS count
    FROM adverse_events
    WHERE 1=1
  `;
  let params = [];

  if (req.query.sponsor) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE sponsor = ?)";
    params.push(req.query.sponsor);
  }
  if (req.query.phase) {
    sql +=
      " AND trial_id IN (SELECT trial_id FROM clinical_trials WHERE phase = ?)";
    params.push(req.query.phase);
  }
  if (req.query.condition) {
    sql +=
      " AND patient_id IN (SELECT patient_id FROM patients WHERE medical_condition = ?)";
    params.push(req.query.condition);
  }

  sql +=
    " GROUP BY severity ORDER BY FIELD(severity, 'Mild', 'Moderate', 'Severe');";

  db.query(sql, params, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json(result);
  });
});

// ✅ Add a New Patient
app.post("/patients", (req, res) => {
  const { name, age, gender, medical_condition, trial_id } = req.body;
  if (!name || !age || !gender)
    return res.status(400).json({ error: "Missing required fields" });

  const sql =
    "INSERT INTO patients (name, age, gender, medical_condition, trial_id) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, age, gender, medical_condition, trial_id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Patient added successfully!", id: result.insertId });
    }
  );
});

/* ✅ Start Server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
