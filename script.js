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

const matrix = document.getElementById("matrix");
const teamSelect = document.getElementById("teamSelect");

let schedule = {};
let fullSchedule = [];

async function loadCSV() {
  const res = await fetch("NHL schedule 2025-26.csv");
  const text = await res.text();

  const lines = text.split(/\r?\n/).filter(l => l);

  fullSchedule = lines.map(l => {
    const [date, a, b] = l.split(",");
    return { date: date.trim(), a: a.trim(), b: b.trim() };
  });

  buildSchedule();
}

function buildSchedule() {
  schedule = {};
  teams.forEach(t => schedule[t] = new Set());

  fullSchedule.forEach(g => {
    const tA = teamMap[g.a];
    const tB = teamMap[g.b];
    if (tA) schedule[tA].add(g.date);
    if (tB) schedule[tB].add(g.date);
  });

  console.log("Check counts:");
  teams.forEach(t => console.log(t, schedule[t].size));

  updateTable();
}

function unionSize(a, b) {
  const s = new Set([...a, ...b]);
  return s.size;
}

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

function updateTable() {
  document.querySelectorAll("#matrix td").forEach(td => {
    const r = td.dataset.r;
    const c = td.dataset.c;

    td.textContent = unionSize(schedule[r], schedule[c]);
  });
}

teams.sort().forEach(t => teamSelect.add(new Option(t, t)));

createTable();
loadCSV();

});
