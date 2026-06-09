//////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////

const teams = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL",
  "DET","EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR",
  "OTT","PHI","PIT","SJS","SEA","STL","TBL","TOR","VAN","VGK","WSH","WPG","UTA"
];

//////////////////////////////////////////////////
// TEAM MAP (unchanged)
//////////////////////////////////////////////////

const teamMap = { /* SAME AS BEFORE */ };

//////////////////////////////////////////////////
// DOM
//////////////////////////////////////////////////

const teamSelect = document.getElementById("teamSelect");
const seasonSelect = document.getElementById("seasonSelect");
const startSelect = document.getElementById("startDate");
const endSelect = document.getElementById("endDate");
const matrix = document.getElementById("matrix");
const rankingList = document.getElementById("most"); // reuse this only

let fullSchedule = [];
let schedule = {};
let allDates = [];

//////////////////////////////////////////////////
// LOAD CSV (same robust version)
//////////////////////////////////////////////////

async function loadCSV() {
  const response = await fetch("NHL schedule 2025-26.csv");
  const text = await response.text();

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

  fullSchedule = lines.map(line => {
    const parts = line.split(",");
    if (parts.length !== 3) return null;

    return {
      date: parts[0].trim(),
      teamA: parts[1].trim(),
      teamB: parts[2].trim()
    };
  }).filter(x => x !== null);

  allDates = [...new Set(fullSchedule.map(g => g.date))].sort();

  populateDateDropdowns();
  buildScheduleFromDateRange();
}

//////////////////////////////////////////////////
// DATE FILTER
//////////////////////////////////////////////////

function populateDateDropdowns() {
  startSelect.innerHTML = "";
  endSelect.innerHTML = "";

  allDates.forEach(date => {
    startSelect.add(new Option(date, date));
    endSelect.add(new Option(date, date));
  });

  startSelect.selectedIndex = 0;
  endSelect.selectedIndex = allDates.length - 1;
}

function buildScheduleFromDateRange() {
  const start = startSelect.value;
  const end = endSelect.value;

  schedule = {};
  teams.forEach(t => schedule[t] = new Set());

  fullSchedule.forEach(game => {
    if (game.date < start || game.date > end) return;

    const tA = teamMap[game.teamA];
    const tB = teamMap[game.teamB];

    if (!tA || !tB) return;

    schedule[tA].add(game.date);
    schedule[tB].add(game.date);
  });

  updateTable();
}

//////////////////////////////////////////////////
// TABLE
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

  teams.forEach(r => {
    let tr = document.createElement("tr");

    let th = document.createElement("th");
    th.textContent = r;
    tr.appendChild(th);

    teams.forEach(c => {
      let td = document.createElement("td");
      td.dataset.row = r;
      td.dataset.col = c;
      tr.appendChild(td);
    });

    matrix.appendChild(tr);
  });
}

//////////////////////////////////////////////////
// MATH
//////////////////////////////////////////////////

function unionSize(...sets) {
  let u = new Set();
  sets.forEach(s => s.forEach(v => u.add(v)));
  return u.size;
}

//////////////////////////////////////////////////
// COLOR
//////////////////////////////////////////////////

function getColor(v, min, max) {
  let ratio = (v - min) / (max - min || 1);
  let g = Math.floor(200 * ratio);
  let r = 255 - g;
  return `rgb(${r},${g},120)`;
}

//////////////////////////////////////////////////
// MAIN UPDATE
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let selectedVals = []; // row/col heatmap
  let otherVals = [];    // everything else

  // First pass: compute values + categorize
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;

    let sets = [schedule[r], schedule[c]];
    if (selected) sets.push(schedule[selected]);

    let val = unionSize(...sets);
    td.textContent = val;
    td.dataset.value = val;

    if (!selected) {
      otherVals.push(val);
    } else if (r === selected && c === selected) {
      // self → ignore
    } else if (r === selected || c === selected) {
      selectedVals.push(val);
    } else {
      otherVals.push(val);
    }
  });

  // Compute scales
  let sMin = Math.min(...selectedVals);
  let sMax = Math.max(...selectedVals);
  let oMin = Math.min(...otherVals);
  let oMax = Math.max(...otherVals);

  // Second pass: apply colors + styles
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;
    const val = Number(td.dataset.value);

    // ✅ DEFAULT
    td.style.border = "1px solid #ccc";

    if (selected) {

      // ✅ 1. SELF CELL → WHITE
      if (r === selected && c === selected) {
        td.style.backgroundColor = "white";
        td.style.border = "3px solid black";
        return;
      }

      // ✅ 2. SELECTED ROW/COLUMN
      if (r === selected || c === selected) {
        td.style.backgroundColor = getColor(val, sMin, sMax);
        td.style.border = "2px solid black";
        return;
      }
    }

    // ✅ 3. ALL OTHER CELLS
    td.style.backgroundColor = getColor(val, oMin, oMax);
  });
}

//////////////////////////////////////////////////
// RANKING (NEW)
//////////////////////////////////////////////////

function updateRanking(selected) {
  let results = teams.map(team => {
    let sets = [schedule[team]];
    if (selected) sets.push(schedule[selected]);

    return {
      team,
      value: unionSize(...sets)
    };
  });

  let sorted = results.sort((a, b) => b.value - a.value);

  rankingList.innerHTML = "";

  sorted.forEach((x, i) => {
    rankingList.innerHTML += `<li>${i+1}. ${x.team}: ${x.value}</li>`;
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teams.slice().sort().forEach(t => {
  teamSelect.add(new Option(t, t));
});

["2025-26"].forEach(s => {
  seasonSelect.add(new Option(s,s));
});

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildScheduleFromDateRange);
endSelect.addEventListener("change", buildScheduleFromDateRange);

createTable();
loadCSV();
``
