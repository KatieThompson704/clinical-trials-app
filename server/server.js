const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Clinical Trials API is Running");
});

// ✅ Get All Clinical Trials (READ)
app.get("/trials", (req, res) => {
  db.query("SELECT * FROM clinical_trials", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// ✅ Add a New Clinical Trial (CREATE)
app.post("/trials", (req, res) => {
  const { trial_name, sponsor } = req.body;
  if (!trial_name || !sponsor) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO clinical_trials (trial_name, sponsor) VALUES (?, ?)";
  db.query(sql, [trial_name, sponsor], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error adding trial" });
    }
    res.json({ message: "Trial added successfully", id: result.insertId });
  });
});

// ✅ Update an Existing Clinical Trial (UPDATE)
app.put("/trials/:id", (req, res) => {
  const { id } = req.params;
  const { trial_name, sponsor } = req.body;

  const sql =
    "UPDATE clinical_trials SET trial_name = ?, sponsor = ? WHERE trial_id = ?";
  db.query(sql, [trial_name, sponsor, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating trial" });
    }
    res.json({ message: "Trial updated successfully" });
  });
});

// ✅ Delete a Clinical Trial (DELETE)
app.delete("/trials/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM clinical_trials WHERE trial_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting trial" });
    }
    res.json({ message: "Trial deleted successfully" });
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
