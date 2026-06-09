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

const teamSelect = document.getElementById("teamSelect");
const seasonSelect = document.getElementById("seasonSelect");
const startSelect = document.getElementById("startDate");
const endSelect = document.getElementById("endDate");
const matrix = document.getElementById("matrix");
const mostList = document.getElementById("most");
const leastList = document.getElementById("least");

let fullSchedule = [];
let schedule = {};
let allDates = [];

//////////////////////////////////////////////////
// LOAD CSV
//////////////////////////////////////////////////

async function loadCSV() {
  const response = await fetch("NHL schedule 2025-26.csv");
  const text = await response.text();

  const lines = text.trim().split("\n");

  fullSchedule = lines.map(line => {
    const parts = line.split(",");
    return {
      date: parts[0].trim(),
      teamA: parts[1].trim(),
      teamB: parts[2].trim()
    };
  });

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

    // Debug (optional)
    // if (!tA || !tB) console.log("Missing mapping:", game);

    if (tA) schedule[tA].add(game.date);
    if (tB) schedule[tB].add(game.date);
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
// MATH + HEATMAP
//////////////////////////////////////////////////

function unionSize(...sets) {
  let u = new Set();
  sets.forEach(s => s.forEach(v => u.add(v)));
  return u.size;
}

function getColor(v, min, max) {
  let ratio = (v - min) / (max - min || 1);

  let g = Math.floor(200 * ratio);
  let r = 255 - g;

  return `rgb(${r},${g},120)`;
}

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let diag = [], off = [];

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.row;
    const c = td.dataset.col;

    let sets = [schedule[r], schedule[c]];
    if (selected) sets.push(schedule[selected]);

    let val = unionSize(...sets);
    td.textContent = val;

    td.dataset.value = val;

    if (r === c) diag.push(val);
    else off.push(val);
  });

  let dMin = Math.min(...diag), dMax = Math.max(...diag);
  let oMin = Math.min(...off), oMax = Math.max(...off);

  document.querySelectorAll("#matrix td").forEach(td => {
    const val = Number(td.dataset.value);

    let color = (td.dataset.row === td.dataset.col)
      ? getColor(val, dMin, dMax)
      : getColor(val, oMin, oMax);

    td.style.backgroundColor = color;
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

  let sorted = results.slice().sort((a, b) => b.value - a.value);

  mostList.innerHTML = "";
  sorted.slice(0, 5).forEach(x => {
    mostList.innerHTML += `<li>${x.team}: ${x.value}</li>`;
  });

  leastList.innerHTML = "";
  let filtered = selected
    ? sorted.filter(x => x.team !== selected)
    : sorted;

  filtered.slice(-5).forEach(x => {
    leastList.innerHTML += `<li>${x.team}: ${x.value}</li>`;
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teams.slice().sort().forEach(t => {
  teamSelect.add(new Option(t, t));
});

["2025-26"].forEach(s => {
  seasonSelect.add(new Option(s, s));
});

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildScheduleFromDateRange);
endSelect.addEventListener("change", buildScheduleFromDateRange);

createTable();
loadCSV();
