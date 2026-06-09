document.addEventListener("DOMContentLoaded", () => {

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
const startSelect = document.getElementById("startDate");
const endSelect = document.getElementById("endDate");
const matrix = document.getElementById("matrix");

// populate team dropdown
teams.slice().sort().forEach(t => {
  teamSelect.add(new Option(t, t));
});

let fullSchedule = [];
let schedule = {};
let allDates = [];

//////////////////////////////////////////////////
// LOAD CSV (simple + reliable)
//////////////////////////////////////////////////

async function loadCSV() {
  const res = await fetch("NHL schedule 2025-26.csv");
  const text = await res.text();

  const lines = text.split("\n");

  fullSchedule = lines.map(line => {
    const parts = line.trim().split(",");
    if (parts.length !== 3) return null;
    return {
      date: parts[0].trim(),
      a: parts[1].trim(),
      b: parts[2].trim()
    };
  }).filter(x => x !== null);

  console.log("Games:", fullSchedule.length);

  allDates = [...new Set(fullSchedule.map(g => g.date))].sort();

  console.log("Dates:", allDates.length);

  populateDates();
  buildSchedule();
}

//////////////////////////////////////////////////
// DATE DROPDOWNS
//////////////////////////////////////////////////

function populateDates() {
  startSelect.innerHTML = "";
  endSelect.innerHTML = "";

  allDates.forEach(d => {
    startSelect.add(new Option(d, d));
    endSelect.add(new Option(d, d));
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

  fullSchedule.forEach(g => {
    if (g.date < start || g.date > end) return;

    const tA = teamMap[g.a];
    const tB = teamMap[g.b];

    if (!tA || !tB) return;

    schedule[tA].add(g.date);
    schedule[tB].add(g.date);
  });

  console.log("Check team sizes:");
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

  teams.forEach(t => {
    let th = document.createElement("th");
    th.textContent = t;
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
      td.dataset.r = r;
      td.dataset.c = c;
      tr.appendChild(td);
    });

    matrix.appendChild(tr);
  });
}

//////////////////////////////////////////////////
// UNION
//////////////////////////////////////////////////

function unionSize(a,b,c){
  let s = new Set();
  a.forEach(x => s.add(x));
  b.forEach(x => s.add(x));
  if(c) c.forEach(x => s.add(x));
  return s.size;
}

//////////////////////////////////////////////////
// UPDATE TABLE (WORKING BASE)
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.r;
    const c = td.dataset.c;

    const val = unionSize(
      schedule[r],
      schedule[c],
      selected ? schedule[selected] : null
    );

    td.textContent = val;
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildSchedule);
endSelect.addEventListener("change", buildSchedule);

createTable();
loadCSV();

});
