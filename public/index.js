document.addEventListener("DOMContentLoaded", () => {
  loadTrials(); // Load trials when page loads

  // Event Listeners
  document.querySelector("#searchInput").addEventListener("input", loadTrials);
  document.querySelector("#sortSelect").addEventListener("change", loadTrials);
});

// ✅ Fetch and Display Clinical Trials
function loadTrials() {
  let searchQuery = document.querySelector("#searchInput").value.toLowerCase();
  let sortOrder = document.querySelector("#sortSelect").value;

  fetch("http://localhost:5000/trials")
    .then((response) => response.json())
    .then((data) => {
      let filteredData = data.filter(
        (trial) =>
          trial.trial_name.toLowerCase().includes(searchQuery) ||
          trial.sponsor.toLowerCase().includes(searchQuery)
      );

      if (sortOrder === "asc") {
        filteredData.sort((a, b) => a.trial_name.localeCompare(b.trial_name));
      } else if (sortOrder === "desc") {
        filteredData.sort((a, b) => b.trial_name.localeCompare(a.trial_name));
      }

      displayTrials(filteredData);
    })
    .catch((error) => console.error("Error fetching trials:", error));
}

// ✅ Display Clinical Trials in Table
function displayTrials(trials) {
  const tableBody = document.querySelector("#trialsTable tbody");
  tableBody.innerHTML = ""; // Clear table

  trials.forEach((trial) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${trial.trial_id}</td>
            <td>${trial.trial_name}</td>
            <td>${trial.sponsor}</td>
        `;
    tableBody.appendChild(row);
  });
}
