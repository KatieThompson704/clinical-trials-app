// ✅ Import required modules
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Ensure db.js is properly set up with MySQL connection
const path = require("path"); // ✅ Import path module

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// ✅ Serve Static Files (Correct way)
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Default Route (Redirect to index.html)
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

// ✅ Get Single Clinical Trial by ID
app.get("/trials/:id", (req, res) => {
  db.query(
    "SELECT * FROM clinical_trials WHERE trial_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
});

// ✅ Get All Patients
app.get("/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get Single Patient by ID
app.get("/patients/:id", (req, res) => {
  db.query(
    "SELECT * FROM patients WHERE patient_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
});

// ✅ Get Patients by Trial ID (Filter)
app.get("/patients/trial/:trial_id", (req, res) => {
  const sql = "SELECT * FROM patients WHERE trial_id = ?";
  db.query(sql, [req.params.trial_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get All Lab Results
app.get("/lab-results", (req, res) => {
  db.query("SELECT * FROM lab_results", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get Patient Age Distribution
app.get("/stats/age", (req, res) => {
  const sql = "SELECT age, COUNT(*) as count FROM patients GROUP BY age";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* ✏️ CREATE (Insert Data) */

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

// ✅ Add a New Clinical Trial
app.post("/trials", (req, res) => {
  const { trial_name, sponsor, phase, status } = req.body;
  if (!trial_name || !sponsor || !phase || !status)
    return res.status(400).json({ error: "Missing required fields" });

  const sql =
    "INSERT INTO clinical_trials (trial_name, sponsor, phase, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [trial_name, sponsor, phase, status], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Trial added successfully!", id: result.insertId });
  });
});

/* 📝 UPDATE (Modify Data) */

// ✅ Update a Patient
app.put("/patients/:id", (req, res) => {
  const { name, age, gender, medical_condition, trial_id } = req.body;
  const sql =
    "UPDATE patients SET name=?, age=?, gender=?, medical_condition=?, trial_id=? WHERE patient_id=?";
  db.query(
    sql,
    [name, age, gender, medical_condition, trial_id, req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Patient updated successfully!" });
    }
  );
});

// ✅ Update a Clinical Trial
app.put("/trials/:id", (req, res) => {
  const { trial_name, sponsor, phase, status } = req.body;
  const sql =
    "UPDATE clinical_trials SET trial_name=?, sponsor=?, phase=?, status=? WHERE trial_id=?";
  db.query(
    sql,
    [trial_name, sponsor, phase, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Trial updated successfully!" });
    }
  );
});

/* 🗑️ DELETE (Remove Data) */

// ✅ Delete a Patient
app.delete("/patients/:id", (req, res) => {
  db.query(
    "DELETE FROM patients WHERE patient_id=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Patient deleted successfully!" });
    }
  );
});

// ✅ Delete a Clinical Trial
app.delete("/trials/:id", (req, res) => {
  db.query(
    "DELETE FROM clinical_trials WHERE trial_id=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Trial deleted successfully!" });
    }
  );
});

/* ✅ API for Appointments, Adverse Events, and Lab Results */

// ✅ Get All Appointments
app.get("/appointments", (req, res) => {
  db.query("SELECT * FROM appointments", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ Get All Adverse Events
app.get("/adverse-events", (req, res) => {
  db.query("SELECT * FROM adverse_events", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* ✅ Start Server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
