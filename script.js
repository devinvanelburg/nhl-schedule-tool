<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NHL Schedule Compatibility Tool</title>

  <!-- ✅ CSS LINK (important) -->
  style.css
</head>

<body>

<h1>NHL Schedule Compatibility</h1>

<div class="controls">
  <label>Season:</label>
  <select id="seasonSelect"></select>

  <label>Team 1:</label>
  <select id="teamSelect">
    <option value="None">None</option>
  </select>

  <label>Start Date:</label>
  <select id="startDate"></select>

  <label>End Date:</label>
  <select id="endDate"></select>
</div>

<div class="container">

  <!-- ✅ MAIN MATRIX -->
  <div class="table-container">
    <table id="matrix"></table>
  </div>

  <!-- ✅ SIDEBAR (UPDATED) -->
  <div class="sidebar">
    <h3>Compatibility Ranking</h3>
    <ul id="most"></ul>
  </div>

</div>

<!-- ✅ SCRIPT LINK (important) -->
script.jsscript>

</body>
</html>
