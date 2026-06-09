const teams = [const "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL",
  "DET","EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR",
  "OTT","PHI","PIT","SJS","SEA","STL","TBL","TOR","VAN","VGK","WSH","WPG","ARI"
];

const teamSelect = document.getElementById("teamSelect");
const seasonSelect = document.getElementById("seasonSelect");
const matrix = document.getElementById("matrix");
const mostList = document.getElementById("most");
const leastList = document.getElementById("least");

let schedule = {};

//////////////////////////////////////////////////
// MOCK DATA (replace later with real schedule)
//////////////////////////////////////////////////
function loadMockSeason() {
  schedule = {};
  teams.forEach(team => {
    let days = new Set();
    while (days.size < 84) {
      days.add(Math.floor(Math.random() * 200));
    }
    schedule[team] = days;
  });
}
loadMockSeason();

//////////////////////////////////////////////////
// UI SETUP
//////////////////////////////////////////////////

teams.slice().sort().forEach(team => {
  let opt = document.createElement("option");
  opt.value = team;
  opt.textContent = team;
  teamSelect.appendChild(opt);
});

// Season dropdown (extensible)
["2025-26"].forEach(season => {
  let opt = document.createElement("option");
  opt.value = season;
  opt.textContent = season;
  seasonSelect.appendChild(opt);
});

//////////////////////////////////////////////////
// TABLE BUILD
//////////////////////////////////////////////////

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

//////////////////////////////////////////////////
// CORE MATH
//////////////////////////////////////////////////

function unionSize(...sets) {
  let u = new Set();
  sets.forEach(s => s.forEach(v => u.add(v)));
  return u.size;
}

//////////////////////////////////////////////////
// HEATMAP COLORING
//////////////////////////////////////////////////

function getColor(value, min, max) {
  let ratio = (value - min) / (max - min || 1);

  // Green gradient
  let g = Math.floor(200 * ratio);
  let r = 255 - g;
  let b = 100;

  return `rgb(${r},${g},${b})`;
}

//////////////////////////////////////////////////
// MAIN UPDATE
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let diagValues = [];
  let offValues = [];

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;

    let sets = [schedule[r], schedule[c]];
    if (selected) sets.push(schedule[selected]);

    let val = unionSize(...sets);
    td.textContent = val;

    if (r === c) {
      diagValues.push(val);
    } else {
      offValues.push(val);
    }

    td.dataset.value = val;
  });

  // Compute separate scales
  let diagMin = Math.min(...diagValues);
  let diagMax = Math.max(...diagValues);

  let offMin = Math.min(...offValues);
  let offMax = Math.max(...offValues);

  // Apply colors
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;
    const val = Number(td.dataset.value);

    if (r === c) {
      td.style.backgroundColor = getColor(val, diagMin, diagMax);
    } else {
      td.style.backgroundColor = getColor(val, offMin, offMax);
    }
  });

  updateSidebar(selected);
}

//////////////////////////////////////////////////
// SIDEBAR
//////////////////////////////////////////////////

function updateSidebar(selected) {
  let results = teams.map(team => {
    let sets = [schedule[team]];
    if (selected) sets.push(schedule[selected]);

    return {
      team,
      value: unionSize(...sets)
    };
  });

  // Sort descending
  let sorted = results.slice().sort((a, b) => b.value - a.value);

  // MOST (no restriction)
  mostList.innerHTML = "";
  sorted.slice(0, 5).forEach(x => {
    let li = document.createElement("li");
    li.textContent = `${x.team}: ${x.value}`;
    mostList.appendChild(li);
  });

  // LEAST (exclude selected team)
  leastList.innerHTML = "";
  let filtered = selected
    ? sorted.filter(x => x.team !== selected)
    : sorted;

  filtered.slice(-5).forEach(x => {
    let li = document.createElement("li");
    li.textContent = `${x.team}: ${x.value}`;
    leastList.appendChild(li);
  });
}

//////////////////////////////////////////////////
// EVENTS
//////////////////////////////////////////////////

teamSelect.addEventListener("change", updateTable);
seasonSelect.addEventListener("change", () => {
  loadMockSeason(); // later load real data per season
  updateTable();
});

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

createTable();
updateTable();
