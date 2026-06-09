document.addEventListener("DOMContentLoaded", () => {

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
const rankingList = document.getElementById("ranking");

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

  allDates = [...new Set(fullSchedule.map(g => g.date))].sort();

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

  updateTable();
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
// COLOR
//////////////////////////////////////////////////

function heatColor(v, min, max) {
  let ratio = (v - min) / (max - min || 1);
  let g = Math.floor(200 * ratio);
  let r = 255 - g;
  return `rgb(${r},${g},120)`;
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
// UPDATE TABLE (CORRECT 3-ZONE LOGIC)
//////////////////////////////////////////////////

function updateTable() {
  const selected = teamSelect.value === "None" ? null : teamSelect.value;

  let rowVals = [];
  let otherVals = [];

  // PASS 1
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.r;
    const c = td.dataset.c;

    const val = unionSize(
      schedule[r],
      schedule[c],
      selected ? schedule[selected] : null
    );

    td.textContent = val;
    td.dataset.val = val;

    if (!selected) {
      otherVals.push(val);
    }
    else if (r === selected && c === selected) {
      // skip self
    }
    else if (r === selected || c === selected) {
      rowVals.push(val);
    }
    else {
      otherVals.push(val);
    }
  });

  const rMin = rowVals.length ? Math.min(...rowVals) : 0;
  const rMax = rowVals.length ? Math.max(...rowVals) : 1;

  const oMin = otherVals.length ? Math.min(...otherVals) : 0;
  const oMax = otherVals.length ? Math.max(...otherVals) : 1;

  // PASS 2
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.r;
    const c = td.dataset.c;
    const val = Number(td.dataset.val);

    td.style.border = "1px solid #ccc";

    if (selected) {

      if (r === selected && c === selected) {
        td.style.backgroundColor = "white";
        td.style.border = "3px solid black";
        return;
      }

      if (r === selected || c === selected) {
        td.style.backgroundColor = heatColor(val, rMin, rMax);
        td.style.border = "2px solid black";
        return;
      }
    }

    td.style.backgroundColor = heatColor(val, oMin, oMax);
  });

  updateRanking(selected);
}

//////////////////////////////////////////////////
// RANKING
//////////////////////////////////////////////////

function updateRanking(selected) {
  if (!selected) {
    rankingList.innerHTML = "";
    return;
  }

  let results = teams.map(t => {
    return {
      team: t,
      value: unionSize(schedule[t], schedule[selected])
    };
  });

  results.sort((a,b) => b.value - a.value);

  rankingList.innerHTML = "";

  results.forEach((x,i) => {
    rankingList.innerHTML += `<li>${i+1}. ${x.team}: ${x.value}</li>`;
  });
}

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

teams.slice().sort().forEach(t => teamSelect.add(new Option(t,t)));

teamSelect.addEventListener("change", updateTable);
startSelect.addEventListener("change", buildSchedule);
endSelect.addEventListener("change", buildSchedule);

createTable();
loadCSV();

});
