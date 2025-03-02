// ✅ Load data on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchData("trials", "trialsTable");
  fetchData("patients", "patientsTable");
});

// ✅ Fetch data from the server
function fetchData(endpoint, tableId) {
  fetch(`http://localhost:5000/${endpoint}`)
    .then((response) => response.json())
    .then((data) => populateTable(data, tableId))
    .catch((error) => console.error(`Error loading ${endpoint}:`, error));
}
// ✅ Populate the table
function populateTable(data, tableId) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = "";

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

function searchPatients() {
  const trialId = document.getElementById("trialSearch").value;
  if (!trialId) {
    alert("Please enter a trial ID!");
    return;
  }

  // ✅ Fetch Patients by Trial ID
  fetch(`http://localhost:5000/patients/trial/${trialId}`)
    .then((response) => response.json())
    .then((data) => {
      const list = document.getElementById("patientList");
      list.innerHTML = ""; // Clear previous results
      data.forEach((patient) => {
        const item = document.createElement("li");
        item.textContent = `${patient.name} (Age: ${patient.age}, Condition: ${patient.medical_condition})`;
        list.appendChild(item);
      });
    })
    .catch((error) => console.error("Error fetching patients:", error));
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

// ✅ Load the age chart
function loadAgeChart() {
  fetch("http://localhost:5000/stats/age")
    .then((response) => response.json())
    .then((data) => {
      const ages = data.map((entry) => entry.age);
      const counts = data.map((entry) => entry.count);

      new Chart(document.getElementById("ageChart"), {
        type: "bar",
        data: {
          labels: ages,
          datasets: [
            {
              label: "Number of Patients",
              data: counts,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    })
    .catch((error) => console.error("Error loading chart:", error));
}

// Load the chart on page load
document.addEventListener("DOMContentLoaded", loadAgeChart);
