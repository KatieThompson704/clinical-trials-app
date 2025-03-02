// ✅ Load data on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchData("trials", "trialsTable"); // Load Clinical Trials Table
  fetchData("patients", "patientsTable"); // Load Patients Table
  updateCharts(); // Initialize Charts with full dataset
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

function updateCharts() {
  const sponsor = document.getElementById("sponsorFilter").value;
  const phase = document.getElementById("phaseFilter").value;
  const condition = document.getElementById("conditionFilter").value;

  let queryParams = [];
  if (sponsor) queryParams.push(`sponsor=${sponsor}`);
  if (phase) queryParams.push(`phase=${phase}`);
  if (condition) queryParams.push(`condition=${condition}`);

  const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

  // Fetch updated data for charts only (not affecting tables)
  fetch(`/stats/age-groups${queryString}`)
    .then((response) => response.json())
    .then((data) => updateAgeChart(data));

  fetch(`/patients${queryString}`)
    .then((response) => response.json())
    .then((data) => updateGenderChart(data));
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
        backgroundColor: ["#2ecc71", "#e74c3c", "#9b59b6"],
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

// ✅ Fetch full data for tables on page load
fetchData("trials", "trialsTable");
fetchData("patients", "patientsTable");
