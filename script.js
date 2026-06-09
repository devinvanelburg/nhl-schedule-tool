//////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////

const teams = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL",
  "DET","EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR",
  "OTT","PHI","PIT","SJS","SEA","STL","TBL","TOR","VAN","VGK","WSH","WPG","UTA"
];

const teamMap = {
  "Anaheim Ducks": "ANA",
  "Boston Bruins": "BOS",
  "Buffalo Sabres": "BUF",
  "Calgary Flames": "CGY",
  "Carolina Hurricanes": "CAR",
  "Chicago Blackhawks": "CHI",
  "Colorado Avalanche": "COL",
  "Columbus Blue Jackets": "CBJ",
  "Dallas Stars": "DAL",
  "Detroit Red Wings": "DET",
  "Edmonton Oilers": "EDM",
  "Florida Panthers": "FLA",
  "Los Angeles Kings": "LAK",
  "Minnesota Wild": "MIN",
  "Montreal Canadiens": "MTL",
  "Nashville Predators": "NSH",
  "New Jersey Devils": "NJD",
  "New York Islanders": "NYI",
  "New York Rangers": "NYR",
  "Ottawa Senators": "OTT",
  "Philadelphia Flyers": "PHI",
  "Pittsburgh Penguins": "PIT",
  "San Jose Sharks": "SJS",
  "Seattle Kraken": "SEA",
  "St. Louis Blues": "STL",
  "Tampa Bay Lightning": "TBL",
  "Toronto Maple Leafs": "TOR",
  "Vancouver Canucks": "VAN",
  "Vegas Golden Knights": "VGK",
  "Washington Capitals": "WSH",
  "Winnipeg Jets": "WPG",
  "Utah Mammoth": "UTA"
};

//////////////////////////////////////////////////
// DOM
//////////////////////////////////////////////////

const teamSelect = document.getElementById("teamSelect");
const startSelect = document.getElementById("startDate");
const endSelect = document.getElementById("endDate");
const matrix = document.getElementById("matrix");
const rankingList = document.getElementById("most");

//////////////////////////////////////////////////
// DATA
//////////////////////////////////////////////////

let fullSchedule = [];
let schedule = {};
let allDates = [];

//////////////////////////////////////////////////
// LOAD CSV
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
      teamA: parts[1].replace(/\u00A0/g, " ").trim(),
      teamB: parts[2].replace(/\u00A0/g, " ").trim()
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

  // ✅ DEBUG CHECK
  console.log("TEAM DAY COUNTS:");
  teams.forEach(t => console.log(t, schedule[t].size));

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
// SAFE UNION
//////////////////////////////////////////////////

function unionSize(...sets) {
  let u = new Set();
  sets.forEach(s => {
    if (!s) return;
    s.forEach(v => u.add(v));
  });
  return u.size;
}

//////////////////////////////////////////////////
// COLOR SCALE
//////////////////////////////////////////////////

function getColor(v, min, max) {
  let ratio = (v - min) / (max - min || 1);
  let g = Math.floor(200 * ratio);
  let r = 255 - g;
  return `rgb(${r},${g},120)`;
}

//////////////////////////////////////////////////
// UPDATE TABLE (FIXED)
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let selectedVals = [];
  let otherVals = [];

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;

    let sets = [
      schedule[r] || new Set(),
      schedule[c] || new Set()
    ];

    if (selected) {
      sets.push(schedule[selected] || new Set());
    }

    let val = unionSize(...sets);

    td.textContent = val;
    td.dataset.value = val;

    if (!selected) {
      otherVals.push(val);
    } else if (r === selected && c === selected) {
      // ignore self cell
    } else if (r === selected || c === selected) {
      selectedVals.push(val);
    } else {
      otherVals.push(val);
    }
  });

  // ✅ SAFE MIN/MAX
  const sMin = selectedVals.length ? Math.min(...selectedVals) : 0;
  const sMax = selectedVals.length ? Math.max(...selectedVals) : 1;

  const oMin = otherVals.length ? Math.min(...otherVals) : 0;
  const oMax = otherVals.length ? Math.max(...otherVals) : 1;

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;
    const val = Number(td.dataset.value);

    td.style.border = "1px solid #ccc";

    if (selected) {

      // ✅ SELF CELL
      if (r === selected && c === selected) {
        td.style.backgroundColor = "white";
        td.style.border = "3px solid black";
        return;
      }

      // ✅ SELECTED ROW/COLUMN
      if (r === selected || c === selected) {
        td.style.backgroundColor = getColor(val, sMin, sMax);
        td.style.border = "2px solid black";
        return;
      }
    }

    // ✅ ALL OTHER CELLS
    td.style.backgroundColor = getColor(val, oMin, oMax);
  });

  updateRanking(selected);
}

//////////////////////////////////////////////////
// RANKING
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

  results.sort((a, b) => b.value - a.value);

  rankingList.innerHTML = "";
  results.forEach((x, i) => {
    rankingList.innerHTML += `<li>${i+1}. ${x.team}: ${x.value}</li>`;
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teams.slice().sort().forEach(t => {
  teamSelect.add(new Option(t, t));
});

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildScheduleFromDateRange);
endSelect.addEventListener("change", buildScheduleFromDateRange);

createTable();
loadCSV();
