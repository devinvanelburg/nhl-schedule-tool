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

  if (!response.ok) {
    alert("CSV failed to load");
    return;
  }

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

  console.log("Loaded rows:", fullSchedule.length);

  allDates = [...new Set(fullSchedule.map(g => g.date))].sort();

  populateDateDropdowns();
  buildSchedule();
}

//////////////////////////////////////////////////
// DATE DROPDOWNS
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

//////////////////////////////////////////////////
// BUILD SCHEDULE
//////////////////////////////////////////////////

function buildSchedule() {
  const start = startSelect.value;
  const end = endSelect.value;

  schedule = {};
  teams.forEach(t => schedule[t] = new Set());

  fullSchedule.forEach(game => {

    if (game.date < start || game.date > end) return;

    const tA = teamMap[game.teamA];
    const tB = teamMap[game.teamB];

    if (!tA || !tB) {
      console.error("Mapping failed:", game);
      return;
    }

    schedule[tA].add(game.date);
    schedule[tB].add(game.date);
  });

  console.log("Team counts:");
  teams.forEach(t => console.log(t, schedule[t].size));

  updateTable();
}

//////////////////////////////////////////////////
// UNION FUNCTION
//////////////////////////////////////////////////

function unionSize(a, b, c) {
  let u = new Set();
  if (a) a.forEach(x => u.add(x));
  if (b) b.forEach(x => u.add(x));
  if (c) c.forEach(x => u.add(x));
  return u.size;
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
// SIMPLE HEATMAP
//////////////////////////////////////////////////

function getColor(v, min, max) {
  let ratio = (v - min) / (max - min || 1);
  let g = Math.floor(200 * ratio);
  let r = 255 - g;
  return `rgb(${r},${g},120)`;
}

//////////////////////////////////////////////////
// UPDATE TABLE
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let values = [];

  // compute values
  document.querySelectorAll("#matrix td").forEach(td => {
    let r = td.dataset.row;
    let c = td.dataset.col;

    let val = unionSize(
      schedule[r],
      schedule[c],
      selected ? schedule[selected] : null
    );

    td.textContent = val;
    td.dataset.val = val;
    values.push(val);
  });

  let min = Math.min(...values);
  let max = Math.max(...values);

  // color
  document.querySelectorAll("#matrix td").forEach(td => {
    let r = td.dataset.row;
    let c = td.dataset.col;
    let val = Number(td.dataset.val);

    td.style.backgroundColor = getColor(val, min, max);
    td.style.border = "1px solid #ccc";

    // simple selection highlight
    if (selected && (r === selected || c === selected)) {
      td.style.border = "2px solid black";
    }

    if (selected && r === selected && c === selected) {
      td.style.backgroundColor = "white";
    }
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teams.slice().sort().forEach(t => {
  teamSelect.add(new Option(t, t));
});

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildSchedule);
endSelect.addEventListener("change", buildSchedule);

createTable();
loadCSV();
