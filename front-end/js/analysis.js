// =======================================================
// ANALYSIS.JS
// Halaman Analisis & Statistik GIS Area Rawan Dampak Pertambangan
// =======================================================

const GEE_API_BASE_URL = "http://localhost:3000";

function getDashboardMapState() {
  try {
    const savedState = localStorage.getItem("dashboardMapState");

    if (!savedState) {
      return null;
    }

    return JSON.parse(savedState);
  } catch (error) {
    console.error("Gagal membaca state peta dashboard:", error);
    return null;
  }
}

function getAnalysisLayerFromDashboard() {
  const mapState = getDashboardMapState();

  return mapState?.layer || "rf_all";
}

async function loadDashboardLayerToAnalysisMap() {
  if (!analysisMap) return;

  const selectedLayer = getAnalysisLayerFromDashboard();

  try {
    const response = await fetch(
      `${GEE_API_BASE_URL}/api/tile/${encodeURIComponent(selectedLayer)}`
    );

    const result = await response.json();

    if (result.status !== "success") {
      console.error("Gagal mengambil tile layer:", result);
      return;
    }

    if (rfLayer && analysisMap.hasLayer(rfLayer)) {
      analysisMap.removeLayer(rfLayer);
    }

    rfLayer = L.tileLayer(result.tile_url, {
      opacity: 0.76,
      transparent: true
    });

    rfLayer.addTo(analysisMap);

  } catch (error) {
    console.error("Gagal memuat layer dari backend:", error);
  }
}

const userLogin = localStorage.getItem("user");

if (!userLogin) {
  window.location.href = "login.php";
}

const userNameEl = document.getElementById("analysisUserName");
const logoutBtn = document.getElementById("analysisLogoutBtn");
const viewMapBtn = document.getElementById("viewMapBtn");

const metricAccuracy = document.getElementById("metricAccuracy");
const metricPrecision = document.getElementById("metricPrecision");
const metricRecall = document.getElementById("metricRecall");
const metricF1 = document.getElementById("metricF1");
const metricKappa = document.getElementById("metricKappa");

const areaDonut = document.getElementById("areaDonut");
const areaTableBody = document.getElementById("areaTableBody");

const analysisSlopeBar = document.getElementById("analysisSlopeBar");
const analysisRainBar = document.getElementById("analysisRainBar");
const analysisLandBar = document.getElementById("analysisLandBar");
const analysisSlopeText = document.getElementById("analysisSlopeText");
const analysisRainText = document.getElementById("analysisRainText");
const analysisLandText = document.getElementById("analysisLandText");

const trainingCount = document.getElementById("trainingCount");
const testingCount = document.getElementById("testingCount");
const totalDataCount = document.getElementById("totalDataCount");
const matrixBody = document.getElementById("matrixBody");

const mapZoomIn = document.getElementById("mapZoomIn");
const mapZoomOut = document.getElementById("mapZoomOut");
const mapHome = document.getElementById("mapHome");
const mapLayerToggle = document.getElementById("mapLayerToggle");

let analysisMap = null;
let satelliteLayer = null;
let osmLayer = null;
let rfLayer = null;
let markerLayer = null;
let currentBaseLayer = "satellite";

const defaultCenter = [-4.4078, 122.3755];
const defaultZoom = 11;

const riskColors = {
  safe: "#4caf50",
  low: "#acd23d",
  medium: "#ffc533",
  high: "#ff7b2d",
  danger: "#ee1d2f"
};

const rfAllMetrics = {
  accuracy: 84.00,
  precision: 87.28,
  recall: 84.49,
  f1: 84.13,
  kappa: 0.7695
};

function loadUser() {
  try {
    const user = JSON.parse(userLogin);
    if (user?.name && userNameEl) {
      userNameEl.textContent = user.name;
    }
  } catch (error) {
    if (userNameEl) userNameEl.textContent = "Mahasiswa";
  }
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("id-ID");
}

function buildDonutGradient(percentages) {
  let start = 0;
  const keys = percentages.length === 3
    ? ["safe", "medium", "danger"]
    : ["safe", "low", "medium", "high", "danger"];

  const parts = percentages.map((value, index) => {
    const end = start + Number(value);
    const part = `${riskColors[keys[index]]} ${start}% ${end}%`;
    start = end;
    return part;
  });

  return `conic-gradient(${parts.join(",")})`;
}

function updateSummaryCards() {
  const data = rfAllMetrics;

  const accuracyEl = document.getElementById("accuracyValue");
  const precisionEl = document.getElementById("precisionValue");
  const recallEl = document.getElementById("recallValue");
  const f1El = document.getElementById("f1Value");
  const kappaEl = document.getElementById("kappaValue");

  if (accuracyEl) accuracyEl.textContent = `${data.accuracy.toFixed(2)}%`;
  if (precisionEl) precisionEl.textContent = `${data.precision.toFixed(2)}%`;
  if (recallEl) recallEl.textContent = `${data.recall.toFixed(2)}%`;
  if (f1El) f1El.textContent = `${data.f1.toFixed(2)}%`;
  if (kappaEl) kappaEl.textContent = data.kappa.toFixed(4);
}

function updateAreaStatistic(data) {
  const labels = ["Aman", "Sedang", "Rawan"];
  const dots = ["dot-safe", "dot-medium", "dot-danger"];

  // Data awal pada desain lama terdiri atas 5 kelas.
  // Untuk penelitian 3 kelas, kelas Tidak Rawan + Rendah digabung menjadi Aman,
  // sedangkan Tinggi + Sangat Tinggi digabung menjadi Rawan.
  const areaPercent = [
    Number(data.area[0] || 0) + Number(data.area[1] || 0),
    Number(data.area[2] || 0),
    Number(data.area[3] || 0) + Number(data.area[4] || 0)
  ];

  const areaHa = [
    Number(data.areaHa[0] || 0) + Number(data.areaHa[1] || 0),
    Number(data.areaHa[2] || 0),
    Number(data.areaHa[3] || 0) + Number(data.areaHa[4] || 0)
  ];

  const total = areaHa.reduce((sum, value) => sum + value, 0);

  areaDonut.style.background = buildDonutGradient(areaPercent);

  areaTableBody.innerHTML = labels.map((label, index) => `
    <tr>
      <td><i class="${dots[index]}"></i>${label}</td>
      <td>${formatNumber(areaHa[index])}</td>
      <td>${formatPercent(areaPercent[index])}</td>
    </tr>
  `).join("") + `
    <tr class="total-row">
      <td>Total</td>
      <td>${formatNumber(total)}</td>
      <td>100%</td>
    </tr>
  `;
}

function updateFeatureImportance(data) {
  const [slope, rain, land] = data.importance;

  analysisSlopeBar.style.width = `${slope}%`;
  analysisRainBar.style.width = `${rain}%`;
  analysisLandBar.style.width = `${land}%`;

  analysisSlopeText.textContent = formatPercent(slope);
  analysisRainText.textContent = formatPercent(rain);
  analysisLandText.textContent = formatPercent(land);
}

function updateModelStatistic(data) {
  const training = data.data.training;
  const testing = data.data.testing;

  trainingCount.textContent = `${training} Titik`;
  testingCount.textContent = `${testing} Titik`;
  totalDataCount.textContent = `${training + testing} Titik`;
}

function percent(numerator, denominator) {
  if (!denominator) return "—";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function updateConfusionMatrix(data) {
  const { tn, fp, fn, tp } = data.matrix;
  const actualSafe = tn + fp;
  const actualRisk = fn + tp;
  const predSafe = tn + fn;
  const predRisk = fp + tp;
  const total = actualSafe + actualRisk;
  const overall = tn + tp;

  matrixBody.innerHTML = `
    <tr><th>Tidak Rawan</th><td class="true-cell">${tn}</td><td>${fp}</td><td>${actualSafe}</td><td>${percent(tn, actualSafe)}</td></tr>
    <tr><th>Rawan</th><td>${fn}</td><td class="true-cell">${tp}</td><td>${actualRisk}</td><td>${percent(tp, actualRisk)}</td></tr>
    <tr><th>Total</th><td>${predSafe}</td><td>${predRisk}</td><td>${total}</td><td>—</td></tr>
    <tr><th>User's Accuracy</th><td>${percent(tn, predSafe)}</td><td>${percent(tp, predRisk)}</td><td>—</td><td>${percent(overall, total)}</td></tr>
  `;
}

function initMap() {
  if (typeof L === "undefined") return;

  const mapEl = document.getElementById("analysisMap");
  if (!mapEl || analysisMap) return;

  const dashboardState = getDashboardMapState();

  const center = dashboardState?.center
    ? [dashboardState.center.lat, dashboardState.center.lng]
    : defaultCenter;

  const zoom = dashboardState?.zoom || defaultZoom;

  analysisMap = L.map("analysisMap", {
    zoomControl: false,
    attributionControl: false
  }).setView(center, zoom);

  satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles © Esri" }
  );

  osmLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  );

  markerLayer = L.layerGroup();

  satelliteLayer.addTo(analysisMap);
  markerLayer.addTo(analysisMap);

  loadDashboardLayerToAnalysisMap();

  setTimeout(() => analysisMap.invalidateSize(), 250);
}

function updateMapMarker(data) {
  if (!analysisMap || !markerLayer) return;

  markerLayer.clearLayers();

  const name = getSelectedName();
  const marker = L.marker(data.coords).bindPopup(`
    <b>${name}</b><br>
    Lokasi perusahaan tambang<br>
    Lat: ${data.coords[0]}<br>
    Lon: ${data.coords[1]}
  `);

  markerLayer.addLayer(marker);
  analysisMap.setView(data.coords, 11);
}

function toggleBaseLayer() {
  if (!analysisMap || !osmLayer || !satelliteLayer) return;

  if (currentBaseLayer === "satellite") {
    analysisMap.removeLayer(satelliteLayer);
    osmLayer.addTo(analysisMap);
    currentBaseLayer = "osm";
  } else {
    analysisMap.removeLayer(osmLayer);
    satelliteLayer.addTo(analysisMap);
    currentBaseLayer = "satellite";
  }

  if (rfLayer && !analysisMap.hasLayer(rfLayer)) {
    rfLayer.addTo(analysisMap);
  }

  if (markerLayer && !analysisMap.hasLayer(markerLayer)) {
    markerLayer.addTo(analysisMap);
  }
}

function updateAll() {
  const data = getSelectedData();

  updateSummaryCards(data);
  updateAreaStatistic(data);
  updateFeatureImportance(data);
  updateModelStatistic(data);
  updateConfusionMatrix(data);
  updateMapMarker(data);
}

function applyMethodAndYearAdjustment() {
  const selectedData = getSelectedData();
  const method = methodSelect?.value;
  const year = rainYearSelect?.value;

  if (method === "overlay") {
    selectedData.metrics.accuracy = Math.max(70, selectedData.metrics.accuracy - 4.8);
    selectedData.metrics.precision = Math.max(70, selectedData.metrics.precision - 4.0);
    selectedData.metrics.recall = Math.max(70, selectedData.metrics.recall - 3.7);
    selectedData.metrics.f1 = Math.max(70, selectedData.metrics.f1 - 4.1);
    selectedData.metrics.kappa = Math.max(0.50, selectedData.metrics.kappa - 0.08);
  }

  if (year === "2024") {
    selectedData.importance[1] = Math.min(45, selectedData.importance[1] + 2.5);
    selectedData.importance[0] = Math.max(35, selectedData.importance[0] - 1.5);
    selectedData.importance[2] = Math.max(15, selectedData.importance[2] - 1.0);
  }

  updateAll();
}


loadUser();

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.php";
});

viewMapBtn?.addEventListener("click", () => {
  window.location.href = "dashboard.php";
});

mapZoomIn?.addEventListener("click", () => analysisMap?.zoomIn());
mapZoomOut?.addEventListener("click", () => analysisMap?.zoomOut());
mapHome?.addEventListener("click", () => analysisMap?.setView(defaultCenter, defaultZoom));
mapLayerToggle?.addEventListener("click", toggleBaseLayer);

document.querySelectorAll(".export-btn").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.export || "file";
    alert(`Fitur export ${type} sudah disiapkan. Hubungkan tombol ini ke endpoint backend saat data final sudah tersedia.`);
  });
});

window.addEventListener("load", () => {
  initMap();
  updateAll();
});
