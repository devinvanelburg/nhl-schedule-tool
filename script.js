const teams = [
  "ANA","ARI","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL",
  "DET","EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR",
  "OTT","PHI","PIT","SJS","SEA","STL","TBL","TOR","VAN","VGK","WSH","WPG"
];

const teamSelect = document.getElementById("teamSelect");
const matrix = document.getElementById("matrix");
const mostList = document.getElementById("most");
const leastList = document.getElementById("least");

/*
Mock schedule:
Each team gets a set of "days" between 1–200
In reality, you'll replace this with actual NHL schedule parsing
*/
const schedule = {};

teams.forEach(team => {
  let days = new Set();
  while (days.size < 84) {
    days.add(Math.floor(Math.random() * 200));
  }
  schedule[team] = days;
});

// Populate dropdown
teams.slice().sort().forEach(team => {
  let opt = document.createElement("option");
  opt.value = team;
  opt.textContent = team;
  teamSelect.appendChild(opt);
});

// Create table header
function createTable() {
  matrix.innerHTML = "";

  let header = document.createElement("tr");
  header.appendChild(document.createElement("th"));

  teams.forEach(team => {
    let th = document.createElement("th");
    th.textContent = team;
    header.appendChild(th);
  });

  matrix.appendChild(header);

  teams.forEach(rowTeam => {
    let tr = document.createElement("tr");

    let rowHeader = document.createElement("th");
    rowHeader.textContent = rowTeam;
    tr.appendChild(rowHeader);

    teams.forEach(colTeam => {
      let td = document.createElement("td");
      td.dataset.row = rowTeam;
      td.dataset.col = colTeam;
      tr.appendChild(td);
    });

    matrix.appendChild(tr);
  });
}

function unionSize(...sets) {
  let union = new Set();
  sets.forEach(s => s.forEach(x => union.add(x)));
  return union.size;
}

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let diagonalResults = [];

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;

    let sets = [schedule[r], schedule[c]];
    if (selected) sets.push(schedule[selected]);

    let val = unionSize(...sets);
    td.textContent = val;

    if (r === c) {
      diagonalResults.push({ team: r, value: val });
    }
  });

  updateSidebar(diagonalResults);
}

function updateSidebar(results) {
  let sorted = results.slice().sort((a, b) => b.value - a.value);

  mostList.innerHTML = "";
  leastList.innerHTML = "";

  sorted.slice(0, 5).forEach(x => {
    let li = document.createElement("li");
    li.textContent = `${x.team}: ${x.value}`;
    mostList.appendChild(li);
  });

  sorted.slice(-5).forEach(x => {
    let li = document.createElement("li");
    li.textContent = `${x.team}: ${x.value}`;
    leastList.appendChild(li);
  });
}

teamSelect.addEventListener("change", updateTable);

// Initialize
createTable();
updateTable();
