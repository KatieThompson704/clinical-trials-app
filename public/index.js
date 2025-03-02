// ✅ Load data on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchData("trials", "trialsTable"); // Load Clinical Trials Table
  fetchData("patients", "patientsTable"); // Load Patients Table
  updateCharts(); // Initialize Charts with full dataset
});

// ✅ Search for Patients by Clinical Trial
function searchPatients() {
  const trialId = document.getElementById("trialSearch").value;
  if (!trialId) {
    alert("Please enter a trial ID!");
    return;
  }

  fetch(`/patients/trial/${trialId}`)
    .then((response) => response.json())
    .then((data) => {
      const resultsBox = document.getElementById("searchResults");
      const title = document.getElementById("searchTitle");
      const list = document.getElementById("patientList");

      list.innerHTML = ""; // Clear previous results
      resultsBox.classList.remove("hidden");

      if (data.length > 0) {
        title.textContent = `${data.length} Patients Enrolled in Trial ${trialId}`;
        data.forEach((patient) => {
          const item = document.createElement("li");
          // ✅ Fix: Remove manually assigned numbering
          item.textContent = `${patient.name} (Age: ${patient.age}, Condition: ${patient.medical_condition})`;
          list.appendChild(item);
        });
      } else {
        title.textContent =
          "No Patients Currently in this Trial. Add Patients Below";
      }
    })
    .catch((error) => {
      console.error("Error fetching patients:", error);
      document.getElementById("searchTitle").textContent = "No Match to Trial";
      document.getElementById("searchResults").classList.remove("hidden");
    });
}

// ✅ Add a new patient
document
  .getElementById("patientForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newPatient = {
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      medical_condition: document.getElementById("condition").value,
      trial_id: document.getElementById("trialId").value || null,
    };

    fetch("http://localhost:5000/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatient),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("statusMessage").textContent = data.message;
        document.getElementById("patientForm").reset();
      })
      .catch((error) => console.error("Error adding patient:", error));
  });

// ✅ Fetch data from the server and populate tables
function fetchData(endpoint, tableId) {
  fetch(`http://localhost:5000/${endpoint}`)
    .then((response) => response.json())
    .then((data) => populateTable(data, tableId))
    .catch((error) => console.error(`Error loading ${endpoint}:`, error));
}

// ✅ Populate Tables Dynamically
function populateTable(data, tableId) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = ""; // Clear existing data

  data.forEach((row) => {
    const tr = document.createElement("tr");
    Object.values(row).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// ✅ Update Charts When Filters Change
document
  .getElementById("sponsorFilter")
  .addEventListener("change", updateCharts);

document.getElementById("phaseFilter").addEventListener("change", updateCharts);
document
  .getElementById("conditionFilter")
  .addEventListener("change", updateCharts);

// ✅ Update Charts using Applied Filters
function updateCharts() {
  const sponsor = document.getElementById("sponsorFilter").value;
  const phase = document.getElementById("phaseFilter").value;
  const condition = document.getElementById("conditionFilter").value;

  let queryParams = [];
  if (sponsor) queryParams.push(`sponsor=${sponsor}`);
  if (phase) queryParams.push(`phase=${phase}`);
  if (condition) queryParams.push(`condition=${condition}`);

  const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

  // ✅ Fetch Age Distribution Data
  fetch(`/stats/age-groups${queryString}`)
    .then((response) => response.json())
    .then((data) => updateAgeChart(data));

  // ✅ Fetch Gender Distribution Data
  fetch(`/patients${queryString}`)
    .then((response) => response.json())
    .then((data) => updateGenderChart(data));

  // ✅ Fetch Adverse Events Data
  fetch(`/stats/adverse-events${queryString}`)
    .then((response) => response.json())
    .then((data) => updateAdverseEventsChart(data));
}

// ✅ Update Age Distribution Chart
function updateAgeChart(data) {
  const ageGroups = data.reduce(
    (acc, group) => {
      acc[group.age_group] = group.count;
      return acc;
    },
    {
      "0-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56-65": 0,
      "66-75": 0,
      "76+": 0,
    }
  );

  ageChart.data.labels = Object.keys(ageGroups);
  ageChart.data.datasets[0].data = Object.values(ageGroups);
  ageChart.update();
}

// ✅ Update Age Distribution Chart
function updateAgeChart(data) {
  const ageGroups = data.reduce(
    (acc, group) => {
      acc[group.age_group] = group.count;
      return acc;
    },
    {
      "0-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56-65": 0,
      "66-75": 0,
      "76+": 0,
    }
  );

  ageChart.data.labels = Object.keys(ageGroups);
  ageChart.data.datasets[0].data = Object.values(ageGroups);
  ageChart.update();
}

// ✅ Update Gender Distribution Chart
function updateGenderChart(patients) {
  const genderCounts = { Male: 0, Female: 0, Other: 0 };

  patients.forEach((patient) => {
    genderCounts[patient.gender]++;
  });

  genderChart.data.labels = Object.keys(genderCounts);
  genderChart.data.datasets[0].data = Object.values(genderCounts);
  genderChart.update();
}

// ✅ Update Adverse Events Chart
function updateAdverseEventsChart(data) {
  const labels = data.map((event) => event.severity);
  const counts = data.map((event) => event.count);

  adverseEventsChart.data.labels = labels;
  adverseEventsChart.data.datasets[0].data = counts;
  adverseEventsChart.update();
}

// ✅ Initialize ChartJS Charts
const ctxAge = document.getElementById("ageChart").getContext("2d");
const ageChart = new Chart(ctxAge, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Patient Age Distribution",
        backgroundColor: "#3498db",
        borderColor: "#2980b9",
        borderWidth: 1,
        data: [],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { title: { display: true, text: "Age Group" } },
      y: { title: { display: true, text: "Number of Patients" } },
    },
  },
});

const ctxGender = document.getElementById("genderChart").getContext("2d");
const genderChart = new Chart(ctxGender, {
  type: "pie",
  data: {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Gender Distribution",
        backgroundColor: ["#6A8CAF", "#E8A2A8", "#B0B0B0"],
        data: [],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  },
});

// ✅ Initialize Adverse Events Chart
const ctxAdverseEvents = document
  .getElementById("adverseEventsChart")
  .getContext("2d");
const adverseEventsChart = new Chart(ctxAdverseEvents, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Adverse Events",
        backgroundColor: ["#f1c40f", "#e67e22", "#e74c3c"],
        borderColor: ["#f39c12", "#d35400", "#c0392b"],
        borderWidth: 1,
        data: [],
      },
    ],
  },
  options: {
    responsive: true,
    indexAxis: "y", // ✅ Makes it a horizontal bar chart
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        // ✅ Display data labels on bars
        anchor: "end",
        align: "right",
        formatter: (value) => value,
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Total Events" },
      },
      y: {
        title: { display: true, text: "Severity" },
      },
    },
  },
});

// ✅ Fetch full data for tables on page load
fetchData("trials", "trialsTable");
fetchData("patients", "patientsTable");
// ✅ Load adverse events data when filters change or page loads
document.addEventListener("DOMContentLoaded", updateCharts);
// Ensure the search runs on "Enter" key press
document
  .getElementById("trialSearch")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents form submission if inside a form
      searchPatients(); // Call search function
    }
  });
