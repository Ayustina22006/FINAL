// =======================================================
// DASHBOARD.JS
// Sistem Informasi Geografis Area Rawan Dampak Pertambangan
// Kabupaten Konawe Selatan
// =======================================================


// =======================================================
// 1. CEK LOGIN
// =======================================================

const userLogin = localStorage.getItem("user");

if (!userLogin) {
  window.location.href = "login.php";
}


// =======================================================
// 2. ELEMENT HTML
// =======================================================

const logoutBtns = document.querySelectorAll(".logoutBtn");
const toggle = document.getElementById("themeToggle");

const chkSlope = document.getElementById("chkSlope");
const chkRain = document.getElementById("chkRain");
const chkLandcover = document.getElementById("chkLandcover");
const chkRF = document.getElementById("chkRF");
const chkCompany = document.getElementById("chkCompany");
const chkBoundaryKab = document.getElementById("chkBoundaryKab");
const chkBoundaryKec = document.getElementById("chkBoundaryKec");

const userDisplay = document.querySelector(".user");
const searchInput = document.querySelector(".map-search input") || document.querySelector(".search input");
const searchBtn = document.getElementById("searchBtn");

const companySelect = document.getElementById("companySelect");
const focusMineBtn = document.getElementById("focusMineBtn");
const resetMapBtn = document.getElementById("resetMapBtn");
const mainOpacityRange = document.getElementById("mainOpacityRange");
const rfOpacityRange = document.getElementById("rfOpacityRange");
const opacityValue = document.getElementById("opacityValue");
const osmBtn = document.getElementById("osmBtn");
const satelliteBtn = document.getElementById("satelliteBtn");
const closeInfoBtn = document.getElementById("closeInfoBtn");
const zoomLocationBtn = document.getElementById("zoomLocationBtn");

const accuracyText = document.getElementById("accuracyText");
const accuracyBadge = document.getElementById("accuracyBadge");

const statusText = document.getElementById("statusText");
const villageText = document.getElementById("villageText");
const factorText = document.getElementById("factorText");
const adviceText = document.getElementById("adviceText");

const statusCard = document.getElementById("statusCard");
const factorCard = document.getElementById("factorCard");
const adviceCard = document.getElementById("adviceCard");

// Elemen tambahan untuk desain dashboard baru
const detailLatLon = document.getElementById("detailLatLon");
const detailStatus = document.getElementById("detailStatus");
const detailSlope = document.getElementById("detailSlope");
const detailRain = document.getElementById("detailRain");
const detailLandcover = document.getElementById("detailLandcover");
const detailScore = document.getElementById("detailScore");
const detailDesc = document.getElementById("detailDesc");

const modelAccuracyCircle = document.getElementById("modelAccuracyCircle");
const modelAccuracyText = document.getElementById("modelAccuracyText");
const accuracyLine = document.getElementById("accuracyLine");
const kappaLine = document.getElementById("kappaLine");
const precisionLine = document.getElementById("precisionLine");
const recallLine = document.getElementById("recallLine");
const f1Line = document.getElementById("f1Line");
const accuracyModelLine = document.getElementById("accuracyModelLine");
const accuracyNoteLine = document.getElementById("accuracyNoteLine");

const barSlope = document.getElementById("barSlope");
const barRain = document.getElementById("barRain");
const barLandcover = document.getElementById("barLandcover");
const barSlopeText = document.getElementById("barSlopeText");
const barRainText = document.getElementById("barRainText");
const barLandcoverText = document.getElementById("barLandcoverText");

const riskDonut = document.getElementById("riskDonut");
const statSafe = document.getElementById("statSafe");
const statMedium = document.getElementById("statMedium");
const statHigh = document.getElementById("statHigh");
const statSafeArea = document.getElementById("statSafeArea");
const statMediumArea = document.getElementById("statMediumArea");
const statHighArea = document.getElementById("statHighArea");
const statLow = document.getElementById("statLow");
const statVeryHigh = document.getElementById("statVeryHigh");
const totalAreaText = document.getElementById("totalAreaText");


// =======================================================
// 3. TAMPILKAN NAMA USER
// =======================================================

function showUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && userDisplay) {
      userDisplay.textContent = "👤 " + user.name;
    }

  } catch (error) {
    if (userDisplay) {
      userDisplay.textContent = "👤 User";
    }
  }
}

showUser();


// =======================================================
// 4. LOGOUT
// =======================================================

logoutBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();

    localStorage.removeItem("user");

    window.location.href = "index.php";
  });
});


// =======================================================
// 5. TEMA PUTIH
// =======================================================

function loadTheme() {
  localStorage.setItem("theme", "light");
  document.body.classList.remove("dark");

  if (toggle) {
    toggle.textContent = "🌙";
  }
}

loadTheme();

toggle?.addEventListener("click", () => {
  localStorage.setItem("theme", "light");
  document.body.classList.remove("dark");
  toggle.textContent = "🌙";
});


// =======================================================
// 6. VARIABEL MAP
// =======================================================

let map = null;
let osmBaseLayer = null;
let satelliteBaseLayer = null;
let lastFocusedLatLng = null;

let slopeLayer = null;
let rainLayer = null;
let landcoverLayer = null;

let slopeRainLayer = null;
let slopeLandcoverLayer = null;
let rainLandcoverLayer = null;

let rfLayer = null;

let hotspotLayer = null;
let villageMarkerLayer = null;
let boundaryKabLayer = null;
let boundaryKecLayer = null;
let boundaryLabelLayer = null;


// =======================================================
// 7. TITIK TENGAH AREA PENELITIAN
// =======================================================

const defaultCenter = [-4.4078, 122.3755];
const defaultZoom = 12;

// Backend API Node.js untuk membaca nilai titik dari Google Earth Engine.
// Pastikan server.js sudah berjalan dengan perintah: npm start
const GEE_API_BASE_URL = "http://localhost:3000";


// =======================================================
// 8. BATAS AREA PENELITIAN
// =======================================================

const hazardBoundsCoords = [
  [-4.4300, 122.3500],
  [-4.3800, 122.4000]
];

// Layer batas dibuat agar checkbox Batas Kabupaten dan Batas Kecamatan aktif.
// Koordinat berikut adalah batas sederhana untuk kebutuhan tampilan Web GIS.
// Jika sudah memiliki data resmi SHP/GeoJSON, ganti koordinat ini dengan data batas administrasi resmi.
const kabupatenBoundaryGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Kabupaten Konawe Selatan" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [122.318, -4.430],
          [122.340, -4.382],
          [122.382, -4.350],
          [122.435, -4.360],
          [122.476, -4.392],
          [122.468, -4.444],
          [122.415, -4.472],
          [122.355, -4.462],
          [122.318, -4.430]
        ]]
      }
    }
  ]
};

const kecamatanBoundaryGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Barat" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.335, -4.455],
          [122.365, -4.420],
          [122.390, -4.382],
          [122.407, -4.355]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Tengah" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.365, -4.462],
          [122.397, -4.430],
          [122.430, -4.392],
          [122.452, -4.365]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Timur" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.405, -4.470],
          [122.425, -4.438],
          [122.448, -4.405],
          [122.468, -4.383]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Selatan" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.332, -4.420],
          [122.375, -4.412],
          [122.425, -4.420],
          [122.465, -4.408]
        ]
      }
    }
  ]
};


// =======================================================
// 9. DATA HOTSPOT AREA TAMBANG / PERUSAHAAN
// =======================================================
// Popup perusahaan hanya menampilkan:
// 1. Nama perusahaan
// 2. Jenis lokasi
// 3. Titik koordinat
// 4. Luas area perusahaan
// 5. Wilayah/desa sekitar
//
// Catatan:
// Silakan ganti luasArea sesuai data resmi/hasil digitasi area perusahaan.

const hotspotData = [
  {
    name: "PT. Macika Mada Madana",
    coords: [-4.4075, 122.3642],

    jenisLokasi: "Area perusahaan tambang",
    luasArea: "± 706.212244 ha",
    wilayahSekitar: "Lalowua, Ululakara, Waturapa",
    slopeValue: "27.4°",
    rainValue: "2.430 mm",
    landcoverValue: "Lahan Terbuka",
    riskScore: "0.78",
    statusKerawanan: "TINGGI",

    markerColor: "#8b5cf6"
  },
  {
    name: "PT. Jagad Rayatama",
    coords: [-4.3989, 122.3803],

    jenisLokasi: "Area perusahaan tambang",
    luasArea: "± 121,71 ha",
    wilayahSekitar: "Lalowua, Koeono, Waturapa",
    slopeValue: "18.6°",
    rainValue: "2.430 mm",
    landcoverValue: "Vegetasi / Lahan Terbuka",
    riskScore: "0.63",
    statusKerawanan: "SEDANG",

    markerColor: "#8b5cf6"
  }
];


// =======================================================
// 10. DATA DESA UNTUK FITUR SEARCH
// =======================================================

const villageData = [
  {
    name: "Lalowua",
    coords: [-4.4078, 122.3755]
  },
  {
    name: "Ululakara",
    coords: [-4.3975, 122.3638]
  },
  {
    name: "Waturapa",
    coords: [-4.4144, 122.3602]
  },
  {
    name: "Koeono",
    coords: [-4.3859, 122.3617]
  },
];


// =======================================================
// 11. DATA INFORMASI CARD DARI GEE
// =======================================================
// Data ini dipakai untuk card dashboard, bukan untuk popup perusahaan.

const dashboardInfo = {
  slope: {
    label: "Kemiringan Lereng",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Kemiringan Lereng",
    imbauan: "Relatif aman, Tetap berhati-hati saat beraktivitas di area miring, terutama saat hujan.",

    totalArea: 8243989.864481583,
    persenAman: 37.341134586585525,
    persenRawanSedang: 37.60979060247438,
    persenRawanTinggi: 25.049074810940414
  },

  rain: {
    label: "Curah Hujan",
    statusWilayah: "Rawan Sedang",
    faktorDominan: "Curah Hujan",
    imbauan: "Waspadai peningkatan curah hujan dan perubahan kondisi cuaca.",

    totalArea: 8243989.864481583,
    luasAmanHa: 0,
    luasRawanSedangHa: 824.3989864481583,
    luasRawanTinggiHa: 0,

    persenAman: 0,
    persenRawanSedang: 100,
    persenRawanTinggi: 0
  },

  landcover: {
    label: "Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi tutupan lahan relatif aman, namun tetap perlu pemantauan berkala.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.73295153876934,
    persenRawanSedang: 9.387760645196797,
    persenRawanTinggi: 14.100553992934028
  },

  slopeRain: {
    label: "Kemiringan Lereng + Curah Hujan",
    statusWilayah: "Rawan Tinggi",
    faktorDominan: "Kemiringan Lereng",
    imbauan: "Hindari aktivitas pada area lereng curam saat intensitas hujan tinggi.",

    totalArea: 824.3989864481587,

    luasAmanHa: 0,
    luasRawanSedangHa: 310.0547325320735,
    luasRawanTinggiHa: 514.3442539160852,

    persenAman: 0,
    persenRawanSedang: 37.60979060247438,
    persenRawanTinggi: 62.390209397525666,

    skorSlope: 1.8770774234309835,
    skorRain: 2,

    akurasiFeatureImportance: 0.48,
    kappaFeatureImportance: 0,

    importanceSlope: 19.959264615915046,
    importanceSlopePercent: 100,

    importanceRain: 0,
    importanceRainPercent: 0
  },

  slopeLandcover: {
    label: "Kemiringan Lereng + Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi relatif aman, namun tetap lakukan pemantauan pada lereng dan tutupan lahan.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.56354231578801,
    persenRawanSedang: 9.36703456592388,
    persenRawanTinggi: 14.069423118288313,

    skorSlope: 1.8770774234309835,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 1,
    kappaFeatureImportance: 1,

    importanceSlope: 0.38614698134602415,
    importanceSlopePercent: 0.5832351532144102,

    importanceLandcover: 65.82162174072685,
    importanceLandcoverPercent: 99.41676484678558
  },

  rainLandcover: {
    label: "Curah Hujan + Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi relatif aman, namun tetap perhatikan perubahan cuaca dan tutupan lahan.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.56354231578801,
    persenRawanSedang: 9.36703456592388,
    persenRawanTinggi: 14.069423118288313,

    skorRain: 2,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 0.6468401486988847,
    kappaFeatureImportance: 0.4832780653510191,

    importanceRain: 0,
    importanceRainPercent: 0,

    importanceLandcover: 33.3389192238216,
    importanceLandcoverPercent: 100
  },

  all: {
    label: "Kemiringan Lereng + Curah Hujan + Tutupan Lahan",
    statusWilayah: "Rawan Sedang",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Waspadai perubahan cuaca, kondisi lereng, dan perubahan tutupan lahan di sekitar wilayah penelitian.",

    totalArea: 820.965531845319,

    luasAmanHa: 230.22836199592132,
    luasRawanSedangHa: 527.4267027857392,
    luasRawanTinggiHa: 63.310467063658464,

    persenAman: 28.043608783236934,
    persenRawanSedang: 64.24468291625114,
    persenRawanTinggi: 7.711708300512074,

    skorSlope: 1.8770774234309835,
    skorRain: 2,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 1,
    kappaFeatureImportance: 1,

    importanceSlope: 18.043072191127703,
    importanceSlopePercent: 48.384992524038154,

    importanceRain: 0,
    importanceRainPercent: 0,

    importanceLandcover: 19.247565359686675,
    importanceLandcoverPercent: 51.61500747596184
  }
};


// =======================================================
// 12. INISIALISASI MAP
// =======================================================

function initMap() {
  if (typeof L === "undefined") {
    alert("Leaflet tidak terbaca. Periksa koneksi internet atau file leaflet.js.");
    return;
  }

  const mapElement = document.getElementById("map");

  if (!mapElement) {
    alert("Elemen #map tidak ditemukan di dashboard.php.");
    return;
  }

  if (map !== null) {
    return;
  }

  map = L.map("map", {
    zoomControl: true
  }).setView(defaultCenter, defaultZoom);

  map.on("moveend zoomend", saveDashboardMapState);

  osmBaseLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  );

  satelliteBaseLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles © Esri" }
  );

  satelliteBaseLayer.addTo(map);

  hotspotLayer = L.layerGroup();
  villageMarkerLayer = L.layerGroup();

  createLayers();
  createBoundaryLayers();
  createHotspotPopup();
  loadAllGeeTileLayersFromBackend();

  hotspotLayer.addTo(map);
  villageMarkerLayer.addTo(map);

  map.on("click", e => {
    const selectedLayer = getSelectedAreaStatsLayer();

    if (!selectedLayer) {
      resetLocationPanel();
      return;
    }

    updateLocationPanel(null, e.latlng);
    identifyPointFromGee(e.latlng);
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}


// =======================================================
// 13. MEMBUAT LAYER BATAS ADMINISTRASI
// =======================================================

function createBoundaryLayers() {
  if (typeof L === "undefined") return;

  boundaryKabLayer = L.geoJSON(kabupatenBoundaryGeoJson, {
    style: {
      color: "#ffffff",
      weight: 2.4,
      opacity: 1,
      fillOpacity: 0,
      dashArray: "7 5"
    },
    interactive: false
  });

  boundaryKecLayer = L.geoJSON(kecamatanBoundaryGeoJson, {
    style: {
      color: "#93c5fd",
      weight: 1.7,
      opacity: 0.95,
      fillOpacity: 0,
      dashArray: "4 6"
    },
    interactive: false
  });

  boundaryLabelLayer = L.layerGroup([
    L.marker([-4.407, 122.392], {
      interactive: false,
      icon: L.divIcon({
        className: "boundary-label",
        html: "KONAWE SELATAN",
        iconSize: [118, 24],
        iconAnchor: [59, 12]
      })
    })
  ]);
}

function updateBoundaryLayers() {
  if (!map) return;

  if (chkBoundaryKab && boundaryKabLayer) {
    if (chkBoundaryKab.checked) {
      if (!map.hasLayer(boundaryKabLayer)) boundaryKabLayer.addTo(map);
      if (boundaryLabelLayer && !map.hasLayer(boundaryLabelLayer)) boundaryLabelLayer.addTo(map);
      boundaryKabLayer.bringToFront?.();
    } else {
      if (map.hasLayer(boundaryKabLayer)) map.removeLayer(boundaryKabLayer);
      if (boundaryLabelLayer && map.hasLayer(boundaryLabelLayer)) map.removeLayer(boundaryLabelLayer);
    }
  }

  if (chkBoundaryKec && boundaryKecLayer) {
    if (chkBoundaryKec.checked) {
      if (!map.hasLayer(boundaryKecLayer)) boundaryKecLayer.addTo(map);
      boundaryKecLayer.bringToFront?.();
    } else if (map.hasLayer(boundaryKecLayer)) {
      map.removeLayer(boundaryKecLayer);
    }
  }
}


// =======================================================
// 14. MEMBUAT LAYER PETA DARI GOOGLE EARTH ENGINE
// =======================================================
// Layer klasifikasi sekarang dimuat dari backend Node.js agar tile peta
// dan popup identify membaca asset GEE yang sama dari file .env.
// Mapping:
// - Parameter dasar: 1=Aman, 2=Sedang, 3=Tinggi
// - Random Forest: 0=Aman, 1=Sedang, 2=Tinggi

function createLayers() {
  slopeLayer = null;
  rainLayer = null;
  landcoverLayer = null;
  slopeRainLayer = null;
  slopeLandcoverLayer = null;
  rainLandcoverLayer = null;
  rfLayer = null;
}

async function fetchGeeTileLayer(layerKey) {
  const response = await fetch(`${GEE_API_BASE_URL}/api/tile/${layerKey}`);
  const result = await response.json();

  if (!response.ok || result.status !== "success") {
    throw new Error(result.detail || result.message || `Gagal memuat tile ${layerKey}`);
  }

  const opacity = Number(mainOpacityRange?.value || rfOpacityRange?.value || 70) / 100;

  return L.tileLayer(result.tile_url, {
    opacity,
    transparent: true,
  });
}

async function loadAllGeeTileLayersFromBackend() {
  const layerJobs = [
    ["slope_class", layer => { slopeLayer = layer; }],
    ["rain_class", layer => { rainLayer = layer; }],
    ["landcover_class", layer => { landcoverLayer = layer; }],
    ["rf_slope_rain", layer => { slopeRainLayer = layer; }],
    ["rf_slope_landcover", layer => { slopeLandcoverLayer = layer; }],
    ["rf_rain_landcover", layer => { rainLandcoverLayer = layer; }],
    ["rf_all", layer => { rfLayer = layer; }],
  ];

  for (const [layerKey, setLayer] of layerJobs) {
    try {
      const layer = await fetchGeeTileLayer(layerKey);
      setLayer(layer);
      console.log(`Tile ${layerKey} berhasil dimuat dari backend.`);
    } catch (error) {
      console.warn(`Tile ${layerKey} belum bisa dimuat:`, error.message);
    }
  }

  applyLayerOpacity();
  updateLayer();
}

// =======================================================
// 14. HOTSPOT POPUP AREA TAMBANG / PERUSAHAAN
// =======================================================

function createHotspotPopup() {
  if (!hotspotLayer) return;

  hotspotLayer.clearLayers();

  hotspotData.forEach(data => {
    const marker = L.marker(data.coords, {
      icon: L.divIcon({
        className: "mine-div-icon",
        html: `<span class="mine-pin">●</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    });

    marker.bindTooltip(data.name, {
      permanent: true,
      direction: "right",
      offset: [10, 0],
      className: "mine-label"
    });

    marker.bindPopup(getHotspotPopupContent(data));

    marker.on("click", function () {
      lastFocusedLatLng = L.latLng(data.coords[0], data.coords[1]);
      updateLocationPanel(data, lastFocusedLatLng);
      this.openPopup();
    });

    hotspotLayer.addLayer(marker);
  });
}


function getHotspotPopupContent(data) {
  return `
    <div style="
      min-width:260px;
      max-width:300px;
      font-family:Arial, sans-serif;
      color:#2d3436;
    ">
      <h3 style="
        margin:0 0 6px 0;
        color:#d63031;
        font-size:18px;
        font-weight:700;
      ">
        ${data.name}
      </h3>

      <p style="
        margin:0 0 10px 0;
        color:#636e72;
        font-size:13px;
      ">
        Informasi umum lokasi perusahaan
      </p>

      <hr style="
        border:none;
        border-top:1px solid #ddd;
        margin:10px 0;
      ">

      <p style="margin:7px 0;">
        <b>Jenis Lokasi:</b><br>
        ${data.jenisLokasi || "-"}
      </p>

      <p style="margin:7px 0;">
        <b>Luas Area Perusahaan:</b><br>
        ${data.luasArea || "-"}
      </p>

      <p style="margin:7px 0;">
        <b>Wilayah/Desa Sekitar:</b><br>
        ${data.wilayahSekitar || "-"}
      </p>

      <p style="
        margin:7px 0;
        padding:8px;
        background:#f8f9fa;
        border-left:4px solid #2f5d8c;
        border-radius:6px;
        line-height:1.4;
      ">
        <b>Titik Koordinat:</b><br>
        Latitude: ${data.coords[0]}<br>
        Longitude: ${data.coords[1]}
      </p>
    </div>
  `;
}


// =======================================================
// 15. RESET SEMUA LAYER KLASIFIKASI
// =======================================================

function resetLayers() {
  if (!map) return;

  const layers = [
    slopeLayer,
    rainLayer,
    landcoverLayer,
    slopeRainLayer,
    slopeLandcoverLayer,
    rainLandcoverLayer,
    rfLayer
  ];

  layers.forEach(layer => {
    if (layer && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}


// =======================================================
// 16. ZOOM KE AREA PENELITIAN
// =======================================================

function zoomToHazard() {
  if (!map || typeof L === "undefined") return;

  const hazardBounds = L.latLngBounds(hazardBoundsCoords);

  map.fitBounds(hazardBounds);
}


// =======================================================
// 17. KEMBALI KE TAMPILAN DEFAULT
// =======================================================

function backToDefaultView() {
  if (!map) return;

  map.setView(defaultCenter, defaultZoom);
}

const modelAccuracyData = {
  slope: {
    available: false,
    model: "Parameter Kemiringan Lereng",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },

  rain: {
    available: false,
    model: "Parameter Curah Hujan",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },

  landcover: {
    available: false,
    model: "Parameter Tutupan Lahan",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },

  slope_rain: {
    available: true,
    model: "Random Forest Kemiringan Lereng + Curah Hujan",
    accuracy: 0.58,
    kappa: 0.4253,
    precision: 0.4644,
    recall: 0.66,
    f1: 0.5215,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng dan curah hujan."
  },

  slope_landcover: {
    available: true,
    model: "Random Forest Kemiringan Lereng + Tutupan Lahan",
    accuracy: 0.95,
    kappa: 0.92,
    precision: 0.9493,
    recall: 0.94886,
    f1: 0.9489,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng dan tutupan lahan."
  },

  rain_landcover: {
    available: true,
    model: "Random Forest Curah Hujan + Tutupan Lahan",
    accuracy: 0.94,
    kappa: 0.90999,
    precision: 0.94100,
    recall: 0.94,
    f1: 0.93,
    note: "Evaluasi model berdasarkan kombinasi parameter curah hujan dan tutupan lahan."
  },

  rf_all: {
    available: true,
    model: "Random Forest Semua Parameter",
    accuracy: 0.84,
    kappa: 0.7695,
    precision: 0.8728,
    recall: 0.84493,
    f1: 0.841260,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng, curah hujan, dan tutupan lahan."
  }
};
function formatEvaluationPercent(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return `${(numberValue * 100).toFixed(2)}%`;
}

function formatEvaluationNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return numberValue.toFixed(4);
}

function getSelectedAccuracyModelKey() {
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf || (slope && rain && land)) {
    return "rf_all";
  }

  if (slope && rain && !land) {
    return "slope_rain";
  }

  if (slope && !rain && land) {
    return "slope_landcover";
  }

  if (!slope && rain && land) {
    return "rain_landcover";
  }

  if (slope && !rain && !land) {
    return "slope";
  }

  if (!slope && rain && !land) {
    return "rain";
  }

  if (!slope && !rain && land) {
    return "landcover";
  }

  return null;
}

// =======================================================
// 18. UPDATE AKURASI BERDASARKAN CHECKBOX
// =======================================================

function updateAccuracy() {
  const selectedKey = getSelectedAccuracyModelKey();

  if (!selectedKey) {
    updateModelMetricCard(null);
    return;
  }

  const data = modelAccuracyData[selectedKey] || null;
  updateModelMetricCard(data);
}

// =======================================================
// 19. FUNGSI CARD DINAMIS BERDASARKAN CHECKBOX
// =======================================================

function getDashboardInfoByCheckbox() {
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf) {
    return dashboardInfo.all;
  }

  if (!slope && !rain && !land) {
    return null;
  }

  if (slope && !rain && !land) {
    return dashboardInfo.slope;
  }

  if (!slope && rain && !land) {
    return dashboardInfo.rain;
  }

  if (!slope && !rain && land) {
    return dashboardInfo.landcover;
  }

  if (slope && rain && !land) {
    return dashboardInfo.slopeRain;
  }

  if (slope && !rain && land) {
    return dashboardInfo.slopeLandcover;
  }

  if (!slope && rain && land) {
    return dashboardInfo.rainLandcover;
  }

  if (slope && rain && land) {
    return dashboardInfo.all;
  }

  return null;
}



function getSelectedAreaStatsLayer() {
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf || (slope && rain && land)) {
    return "rf_all";
  }

  if (slope && rain && !land) {
    return "rf_slope_rain";
  }

  if (slope && !rain && land) {
    return "rf_slope_landcover";
  }

  if (!slope && rain && land) {
    return "rf_rain_landcover";
  }

  if (slope && !rain && !land) {
    return "slope_class";
  }

  if (!slope && rain && !land) {
    return "rain_class";
  }

  if (!slope && !rain && land) {
    return "landcover_class";
  }

  return null;
}

function saveDashboardMapState() {
  if (!map) return;

  const selectedLayer = getSelectedAreaStatsLayer();

  const center = map.getCenter();

  const mapState = {
    layer: selectedLayer || "rf_all",
    center: {
      lat: center.lat,
      lng: center.lng
    },
    zoom: map.getZoom()
  };

  localStorage.setItem("dashboardMapState", JSON.stringify(mapState));
}

function isDashboardInfoFilled(info) {
  if (!info) {
    return false;
  }

  return Boolean(
    info.statusWilayah &&
    info.faktorDominan &&
    info.imbauan
  );
}


function getStatusClassFromLabel(statusLabel) {
  if (statusLabel === "Rawan Tinggi" || statusLabel === "Sangat Rawan") {
    return 3;
  }

  if (statusLabel === "Rawan Sedang" || statusLabel === "Sedang") {
    return 2;
  }

  if (statusLabel === "Relatif Aman" || statusLabel === "Aman") {
    return 1;
  }

  return 0;
}


// =======================================================
// FITUR IDENTIFY POINT GEE - MEMBACA 7 ASSET
// =======================================================

function getGeeItemValue(data, key) {
  if (!data || data[key] === null || data[key] === undefined) {
    return "-";
  }

  const item = data[key];

  if (typeof item === "object" && item !== null) {
    return item.nilai ?? "-";
  }

  return item ?? "-";
}

function getGeeItemClass(data, key) {
  if (!data || data[key] === null || data[key] === undefined) {
    return "-";
  }

  const item = data[key];

  if (typeof item === "object" && item !== null) {
    const nilai = item.nilai;
    const kelas = item.kelas;

    if (kelas && kelas !== "Tidak ada data") {
      return kelas;
    }

    if (key.startsWith("rf_")) {
      if (Number(nilai) === 0) return "Aman";
      if (Number(nilai) === 1) return "Sedang";
      if (Number(nilai) === 2) return "Tinggi";
    }

    return kelas ?? nilai ?? "-";
  }

  if (key.startsWith("rf_")) {
    if (Number(item) === 0) return "Aman";
    if (Number(item) === 1) return "Sedang";
    if (Number(item) === 2) return "Tinggi";
  }

  return item ?? "-";
}

function getRiskBadgeStyle(kelas) {
  const text = String(kelas || "").toLowerCase();

  if (text.includes("tinggi") || text.includes("rawan")) {
    return `
      background:#fee2e2;
      color:#991b1b;
      border:1px solid #fecaca;
    `;
  }

  if (text.includes("sedang")) {
    return `
      background:#fef3c7;
      color:#92400e;
      border:1px solid #fde68a;
    `;
  }

  if (text.includes("aman")) {
    return `
      background:#dcfce7;
      color:#166534;
      border:1px solid #bbf7d0;
    `;
  }

  return `
    background:#f1f5f9;
    color:#334155;
    border:1px solid #cbd5e1;
  `;
}

function getIdentifyPopupContent(latlng, data, note = "") {
  const rainValue = getGeeItemValue(data, "rain_class");
  const slopeValue = getGeeItemValue(data, "slope_class");
  const landcoverValue = getGeeItemValue(data, "landcover_class");

  const rfAllValue = getGeeItemValue(data, "rf_all");
  const rfAllClass = getGeeItemClass(data, "rf_all");

  const rfSlopeRainValue = getGeeItemValue(data, "rf_slope_rain");
  const rfSlopeRainClass = getGeeItemClass(data, "rf_slope_rain");

  const rfSlopeLandcoverValue = getGeeItemValue(data, "rf_slope_landcover");
  const rfSlopeLandcoverClass = getGeeItemClass(data, "rf_slope_landcover");

  const rfRainLandcoverValue = getGeeItemValue(data, "rf_rain_landcover");
  const rfRainLandcoverClass = getGeeItemClass(data, "rf_rain_landcover");

  const oldNilaiKelas = data?.nilai_kelas ?? "-";
  const oldKelasKerawanan = data?.kelas_kerawanan ?? "-";

  const finalRfAllValue = rfAllValue !== "-" ? rfAllValue : oldNilaiKelas;
  let finalRfAllClass = rfAllClass !== "-" ? rfAllClass : oldKelasKerawanan;

  if (
    finalRfAllClass === "Tidak ada data" ||
    finalRfAllClass === "-" ||
    finalRfAllClass === undefined ||
    finalRfAllClass === null
  ) {
    if (Number(finalRfAllValue) === 0) finalRfAllClass = "Aman";
    else if (Number(finalRfAllValue) === 1) finalRfAllClass = "Sedang";
    else if (Number(finalRfAllValue) === 2) finalRfAllClass = "Tinggi";
  }

  return `
    <div style="font-family:Arial, sans-serif; color:#1f2937; line-height:1.35;">
      <h3 style="margin:0 0 6px 0; color:#1e40af; font-size:14px; font-weight:700;">
        Informasi Titik
      </h3>

      <p style="margin:5px 0; font-size:12px;">
        <b>Koordinat</b><br>
        ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:7px 0;">

      <p style="margin:5px 0; font-size:12px;">
        <b>Parameter Dasar</b><br>
        Curah Hujan: ${rainValue}<br>
        Kemiringan Lereng: ${slopeValue}<br>
        Tutupan Lahan: ${landcoverValue}
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:7px 0;">

      <p style="margin:5px 0; font-size:12px;">
        <b>Random Forest</b><br>
        Semua Parameter: <b>${finalRfAllClass}</b> (${finalRfAllValue})<br>
        Slope + Rain: ${rfSlopeRainClass} (${rfSlopeRainValue})<br>
        Slope + Landcover: ${rfSlopeLandcoverClass} (${rfSlopeLandcoverValue})<br>
        Rain + Landcover: ${rfRainLandcoverClass} (${rfRainLandcoverValue})
      </p>

      ${note ? `
        <p style="margin:6px 0 0 0; font-size:11px; color:#b45309;">
          ${note}
        </p>
      ` : ""}
    </div>
  `;
}

function updateLocationPanelFromGee(latlng, data) {
  const selectedLayer = getSelectedAreaStatsLayer();

  if (!selectedLayer) {
    resetLocationPanel();
    return;
  }

  lastFocusedLatLng = latlng;

  const rainValue = getGeeItemValue(data, "rain_class");
  const slopeValue = getGeeItemValue(data, "slope_class");
  const landcoverValue = getGeeItemValue(data, "landcover_class");

  const selectedValue = getGeeItemValue(data, selectedLayer);
  let selectedClass = getGeeItemClass(data, selectedLayer);

  if (
    selectedClass === "Tidak ada data" ||
    selectedClass === "-" ||
    selectedClass === undefined ||
    selectedClass === null
  ) {
    selectedClass = "Tidak ada data";
  }

  if (detailLatLon) {
    detailLatLon.textContent = `Lat: ${latlng.lat.toFixed(5)} , Lon: ${latlng.lng.toFixed(5)}`;
  }

  if (detailStatus) {
    detailStatus.textContent = String(selectedClass || "Tidak ada data").toUpperCase();
  }

  if (detailSlope) detailSlope.textContent = slopeValue;
  if (detailRain) detailRain.textContent = rainValue;
  if (detailLandcover) detailLandcover.textContent = landcoverValue;
  if (detailScore) detailScore.textContent = selectedValue;

  if (detailDesc) {
  detailDesc.textContent =
    data?.[selectedLayer]?.keterangan ||
    "Keterangan belum tersedia dari backend API.";
}
}

async function identifyPointFromGee(latlng) {
  if (!map || !latlng) return;

  const loadingPopup = L.popup({
    maxWidth: 260,
    minWidth: 220,
    className: "small-gee-popup",
    autoPan: true,
    keepInView: true,
  })
    .setLatLng(latlng)
    .setContent(`
      <div style="font-family:Arial, sans-serif; min-width:220px;">
        <b>Membaca nilai titik...</b><br>
        <small>Menghubungi backend API Google Earth Engine.</small>
      </div>
    `)
    .openOn(map);

  try {
    const url = `${GEE_API_BASE_URL}/api/identify?lat=${encodeURIComponent(latlng.lat)}&lng=${encodeURIComponent(latlng.lng)}&layer=all`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      const detail = result.detail || result.message || "Backend API belum siap.";

      loadingPopup.setContent(`
        <div style="font-family:Arial, sans-serif; min-width:250px; color:#991b1b; line-height:1.4;">
          <b>Gagal membaca nilai titik</b><br>
          <small>${detail}</small><br><br>
          <small>
            Pastikan backend Node.js berjalan, service-account-key.json valid,
            dan semua asset GEE sudah di-share ke service account.
          </small>
        </div>
      `);
      return;
    }

    updateLocationPanelFromGee(latlng, result.data);
    loadingPopup.setContent(getIdentifyPopupContent(latlng, result.data, result.catatan));
  } catch (error) {
    console.error("Gagal membaca nilai titik dari backend GEE:", error);

    loadingPopup.setContent(`
      <div style="font-family:Arial, sans-serif; min-width:240px; color:#991b1b;">
        <b>Backend API tidak terhubung</b><br>
        <small>Jalankan dulu server Node.js dengan perintah <b>npm start</b> atau <b>node server.js</b>.</small>
      </div>
    `);
  }
}

function updateCardStyle(statusClass) {
  if (!statusCard || !factorCard || !adviceCard) return;

  statusCard.classList.remove("safe", "warning", "danger");
  factorCard.classList.remove("safe", "warning", "danger");
  adviceCard.classList.remove("safe", "warning", "danger");

  let className = "";

  if (statusClass === 3) {
    className = "danger";
  }

  else if (statusClass === 2) {
    className = "warning";
  }

  else if (statusClass === 1) {
    className = "safe";
  }

  if (className !== "") {
    statusCard.classList.add(className);
    factorCard.classList.add(className);
    adviceCard.classList.add(className);
  }
}


function updateDashboardCards() {
  const info = getDashboardInfoByCheckbox();

  if (villageText) {
    villageText.textContent = villageData.length + " Desa";
  }

  if (!info) {
    if (statusText) {
      statusText.textContent = "-";
    }

    if (factorText) {
      factorText.textContent = "-";
    }

    if (adviceText) {
      adviceText.textContent = "Pilih parameter analisis terlebih dahulu";
    }

    updateCardStyle(0);
    updateLocationPanel(null, lastFocusedLatLng);
    updateFeatureImportanceCard(null);
    updateRiskStatisticCard(null);
    return;
  }

  if (!isDashboardInfoFilled(info)) {
    if (statusText) {
      statusText.textContent = "-";
    }

    if (factorText) {
      factorText.textContent = "-";
    }

    if (adviceText) {
      adviceText.textContent = "Data GEE untuk kombinasi ini belum ditambahkan";
    }

    updateCardStyle(0);
    return;
  }

  if (statusText) {
    statusText.textContent = info.statusWilayah;
  }

  if (factorText) {
    factorText.textContent = info.faktorDominan;
  }

  if (adviceText) {
    adviceText.textContent = info.imbauan;
  }

  const statusClass = getStatusClassFromLabel(info.statusWilayah);
  updateCardStyle(statusClass);

  updateLocationPanel(null, lastFocusedLatLng);
  updateFeatureImportanceCard(info);
  updateRiskStatisticCard(info);
}


// =======================================================
// 20. UPDATE LAYER BERDASARKAN CHECKBOX
// =======================================================

function updateLayer() {
  if (!map) return;

  resetLayers();
  updateAccuracy();
  updateDashboardCards();
  fetchAreaStatsFromBackend();
  applyLayerOpacity();

  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  saveDashboardMapState();

  if (chkCompany && hotspotLayer) {
    if (chkCompany.checked) {
      if (!map.hasLayer(hotspotLayer)) hotspotLayer.addTo(map);
    } else {
      if (map.hasLayer(hotspotLayer)) map.removeLayer(hotspotLayer);
    }
  }

  if (rf) {
    if (rfLayer) rfLayer.addTo(map);
    updateBoundaryLayers();
    zoomToHazard();
    return;
  }

  if (!slope && !rain && !land) {
    updateBoundaryLayers();
    backToDefaultView();
    return;
  }

  if (slope && !rain && !land) {
    if (slopeLayer) slopeLayer.addTo(map);
  }

  else if (!slope && rain && !land) {
    if (rainLayer) rainLayer.addTo(map);
  }

  else if (!slope && !rain && land) {
    if (landcoverLayer) landcoverLayer.addTo(map);
  }

  else if (slope && rain && !land) {
    if (slopeRainLayer) slopeRainLayer.addTo(map);
  }

  else if (slope && !rain && land) {
    if (slopeLandcoverLayer) slopeLandcoverLayer.addTo(map);
  }

  else if (!slope && rain && land) {
    if (rainLandcoverLayer) rainLandcoverLayer.addTo(map);
  }

  else if (slope && rain && land) {
    if (rfLayer) rfLayer.addTo(map);
  }

  updateBoundaryLayers();
  zoomToHazard();
}


// =======================================================
// 21. EVENT CHECKBOX
// =======================================================

chkSlope?.addEventListener("change", updateLayer);
chkRain?.addEventListener("change", updateLayer);
chkLandcover?.addEventListener("change", updateLayer);
chkRF?.addEventListener("change", updateLayer);
chkCompany?.addEventListener("change", updateLayer);
chkBoundaryKab?.addEventListener("change", updateBoundaryLayers);
chkBoundaryKec?.addEventListener("change", updateBoundaryLayers);


// =======================================================
// 22. FITUR SEARCH DESA
// =======================================================

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}


function getVillagePopupContent(village) {
  const info = getDashboardInfoByCheckbox();

  let statusPopup = "-";
  let faktorPopup = "-";
  let imbauanPopup = "Pilih parameter analisis terlebih dahulu.";

  if (info && isDashboardInfoFilled(info)) {
    statusPopup = info.statusWilayah;
    faktorPopup = info.faktorDominan;
    imbauanPopup = info.imbauan;
  } else if (info && !isDashboardInfoFilled(info)) {
    imbauanPopup = "Data GEE untuk kombinasi ini belum ditambahkan.";
  }

  return `
    <div style="font-family: Arial, sans-serif; min-width:230px;">
      <h3 style="margin-bottom: 8px;">
        Desa ${village.name}
      </h3>

      <hr>

      <p><b>Status Wilayah:</b> ${statusPopup}</p>
      <p><b>Faktor Dominan:</b> ${faktorPopup}</p>
      <p><b>Imbauan:</b> ${imbauanPopup}</p>

      <hr>

      <p>
        <b>Koordinat:</b><br>
        ${village.coords[0]}, ${village.coords[1]}
      </p>
    </div>
  `;
}


function searchVillage(keyword) {
  if (!map || !villageMarkerLayer) return;

  const cleanKeyword = normalizeText(keyword);

  if (cleanKeyword === "") {
    villageMarkerLayer.clearLayers();
    updateDashboardCards();
    return;
  }

  const foundVillage = villageData.find(village => {
    return normalizeText(village.name).includes(cleanKeyword);
  });

  if (!foundVillage) {
    villageMarkerLayer.clearLayers();

    L.popup()
      .setLatLng(defaultCenter)
      .setContent(`
        <b>Desa tidak ditemukan</b><br>
        Silakan cari desa di area penelitian.
      `)
      .openOn(map);

    return;
  }

  villageMarkerLayer.clearLayers();

  const marker = L.marker(foundVillage.coords)
    .bindPopup(getVillagePopupContent(foundVillage));

  villageMarkerLayer.addLayer(marker);

  map.setView(foundVillage.coords, 15);

  marker.openPopup();

  updateDashboardCards();
}


// Search saat menekan Enter
searchInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchVillage(searchInput.value);
  }
});

searchBtn?.addEventListener("click", () => {
  searchVillage(searchInput?.value || "");
});


// Search otomatis setelah minimal 3 huruf
searchInput?.addEventListener("input", () => {
  const keyword = searchInput.value.trim();

  if (keyword.length >= 3) {
    const foundVillage = villageData.find(village => {
      return normalizeText(village.name).includes(normalizeText(keyword));
    });

    if (foundVillage) {
      searchVillage(keyword);
    }
  }

  if (keyword.length === 0) {
    if (villageMarkerLayer) {
      villageMarkerLayer.clearLayers();
    }

    updateDashboardCards();
  }
});




// =======================================================
// 23. FUNGSI TAMBAHAN UNTUK DESAIN BARU
// =======================================================

function selectedCompanyData() {
  const selectedName = companySelect?.value;
  return hotspotData.find(item => item.name === selectedName) || hotspotData[0] || null;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(1)}%`;
}

function formatHa(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return `${numberValue.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ha`;
}


function setWidth(element, value) {
  if (!element) return;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  element.style.width = safeValue + "%";
}

function updateModelMetricCard(data) {
  if (!data || !data.available) {
    if (modelAccuracyCircle) {
      modelAccuracyCircle.style.background = `conic-gradient(#1f73d6 0 0%, #e9eef7 0% 100%)`;
    }

    if (modelAccuracyText) modelAccuracyText.textContent = "-";
    if (accuracyLine) accuracyLine.textContent = "-";
    if (kappaLine) kappaLine.textContent = "-";
    if (precisionLine) precisionLine.textContent = "-";
    if (recallLine) recallLine.textContent = "-";
    if (f1Line) f1Line.textContent = "-";

    if (accuracyModelLine) {
      accuracyModelLine.textContent = data?.model ? `Model: ${data.model}` : "Model: -";
    }

    if (accuracyNoteLine) {
      accuracyNoteLine.textContent = data?.note || "Pilih kombinasi parameter untuk melihat evaluasi model.";
    }

    return;
  }

  const accuracyPercent = data.accuracy * 100;

  if (modelAccuracyCircle) {
    modelAccuracyCircle.style.background = `conic-gradient(#1f73d6 0 ${accuracyPercent}%, #e9eef7 ${accuracyPercent}% 100%)`;
  }

  if (modelAccuracyText) {
    modelAccuracyText.textContent = formatEvaluationPercent(data.accuracy);
  }

  if (accuracyLine) {
    accuracyLine.textContent = formatEvaluationPercent(data.accuracy);
  }

  if (kappaLine) {
    kappaLine.textContent = formatEvaluationNumber(data.kappa);
  }

  if (precisionLine) {
    precisionLine.textContent = formatEvaluationPercent(data.precision);
  }

  if (recallLine) {
    recallLine.textContent = formatEvaluationPercent(data.recall);
  }

  if (f1Line) {
    f1Line.textContent = formatEvaluationPercent(data.f1);
  }

  if (accuracyModelLine) {
    accuracyModelLine.textContent = `Model: ${data.model}`;
  }

  if (accuracyNoteLine) {
    accuracyNoteLine.textContent = data.note || "-";
  }
}

function updateFeatureImportanceCard(info) {
  if (!info) {
    setWidth(barSlope, 0);
    setWidth(barRain, 0);
    setWidth(barLandcover, 0);
    if (barSlopeText) barSlopeText.textContent = "-";
    if (barRainText) barRainText.textContent = "-";
    if (barLandcoverText) barLandcoverText.textContent = "-";
    return;
  }

  const slopeVal = info.importanceSlopePercent ?? (chkSlope?.checked ? 100 : 0);
  const rainVal = info.importanceRainPercent ?? (chkRain?.checked ? 100 : 0);
  const landVal = info.importanceLandcoverPercent ?? (chkLandcover?.checked ? 100 : 0);

  setWidth(barSlope, slopeVal);
  setWidth(barRain, rainVal);
  setWidth(barLandcover, landVal);

  if (barSlopeText) barSlopeText.textContent = formatPercent(slopeVal);
  if (barRainText) barRainText.textContent = formatPercent(rainVal);
  if (barLandcoverText) barLandcoverText.textContent = formatPercent(landVal);
}

function resetRiskStatisticCard() {
  if (statSafe) statSafe.textContent = "-";
  if (statMedium) statMedium.textContent = "-";
  if (statHigh) statHigh.textContent = "-";

  if (statSafeArea) statSafeArea.textContent = "-";
  if (statMediumArea) statMediumArea.textContent = "-";
  if (statHighArea) statHighArea.textContent = "-";

  if (statLow) statLow.textContent = "-";
  if (statVeryHigh) statVeryHigh.textContent = "-";
  if (totalAreaText) totalAreaText.textContent = "-";

  if (riskDonut) {
    riskDonut.style.background = "#e5e7eb";
  }
}

function setRiskDonut(aman, sedang, rawan) {
  const batasAman = aman;
  const batasSedang = aman + sedang;

  if (riskDonut) {
    riskDonut.style.background = `conic-gradient(
      var(--safe) 0 ${batasAman}%,
      var(--medium) ${batasAman}% ${batasSedang}%,
      var(--danger) ${batasSedang}% 100%
    )`;
  }
}

function updateRiskStatisticCard(info) {
  if (!info) {
    resetRiskStatisticCard();
    return;
  }

  const aman = Number(info.persenAman || 0);
  const sedang = Number(info.persenRawanSedang || 0);
  const rawan = Number(info.persenRawanTinggi || 0);

  setRiskDonut(aman, sedang, rawan);

  if (statSafe) statSafe.textContent = formatPercent(aman);
  if (statMedium) statMedium.textContent = formatPercent(sedang);
  if (statHigh) statHigh.textContent = formatPercent(rawan);

  if (statSafeArea) statSafeArea.textContent = "Menghitung...";
  if (statMediumArea) statMediumArea.textContent = "Menghitung...";
  if (statHighArea) statHighArea.textContent = "Menghitung...";

  if (statLow) statLow.textContent = "";
  if (statVeryHigh) statVeryHigh.textContent = "";
  if (totalAreaText) totalAreaText.textContent = "Menghitung...";
}

function updateRiskStatisticCardFromApi(data) {
  if (!data || !data.kelas) {
    resetRiskStatisticCard();
    return;
  }

  const aman = data.kelas.aman || {};
  const sedang = data.kelas.sedang || {};
  const rawan = data.kelas.rawan || {};

  const persenAman = Number(aman.persen || 0);
  const persenSedang = Number(sedang.persen || 0);
  const persenRawan = Number(rawan.persen || 0);

  setRiskDonut(persenAman, persenSedang, persenRawan);

  if (statSafe) statSafe.textContent = formatPercent(persenAman);
  if (statMedium) statMedium.textContent = formatPercent(persenSedang);
  if (statHigh) statHigh.textContent = formatPercent(persenRawan);

  if (statSafeArea) statSafeArea.textContent = formatHa(aman.luas_ha);
  if (statMediumArea) statMediumArea.textContent = formatHa(sedang.luas_ha);
  if (statHighArea) statHighArea.textContent = formatHa(rawan.luas_ha);

  if (statLow) statLow.textContent = "";
  if (statVeryHigh) statVeryHigh.textContent = "";

  if (totalAreaText) {
    totalAreaText.textContent = formatHa(data.total?.luas_ha);
  }
}

async function fetchAreaStatsFromBackend() {
  const selectedLayer = getSelectedAreaStatsLayer();

  if (!selectedLayer) {
    resetRiskStatisticCard();
    return;
  }

  try {
    const url = `${GEE_API_BASE_URL}/api/area-stats?layer=${encodeURIComponent(selectedLayer)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      console.error("Gagal mengambil statistik luas:", result.message || result.detail || result);
      resetRiskStatisticCard();
      return;
    }

    updateRiskStatisticCardFromApi(result);
  } catch (error) {
    console.error("Error fetch statistik luas dari backend:", error);
    resetRiskStatisticCard();
  }
}

function resetLocationPanel() {
  if (detailLatLon) detailLatLon.textContent = "Lat: - , Lon: -";
  if (detailStatus) detailStatus.textContent = "-";
  if (detailSlope) detailSlope.textContent = "-";
  if (detailRain) detailRain.textContent = "-";
  if (detailLandcover) detailLandcover.textContent = "-";
  if (detailScore) detailScore.textContent = "-";

  if (detailDesc) {
    detailDesc.textContent = "Pilih parameter analisis terlebih dahulu.";
  }
}

function updateLocationPanel(sourceData = null, latlng = null) {
  const selectedLayer = getSelectedAreaStatsLayer();
  const info = getDashboardInfoByCheckbox();

  if (!selectedLayer || !info || !isDashboardInfoFilled(info)) {
    resetLocationPanel();
    return;
  }

  const company = sourceData || null;
  const targetLatLng = latlng || (company ? L.latLng(company.coords[0], company.coords[1]) : null);

  if (targetLatLng) {
    lastFocusedLatLng = targetLatLng;
    if (detailLatLon) {
      detailLatLon.textContent = `Lat: ${targetLatLng.lat.toFixed(5)} , Lon: ${targetLatLng.lng.toFixed(5)}`;
    }
  }

  const status = info?.statusWilayah || "-";
  if (detailStatus) detailStatus.textContent = String(status).toUpperCase();
  if (detailSlope) detailSlope.textContent = info?.skorSlope ? Number(info.skorSlope).toFixed(2) : "-";
  if (detailRain) detailRain.textContent = info?.skorRain ? Number(info.skorRain).toFixed(2) : "-";
  if (detailLandcover) detailLandcover.textContent = info?.skorLandcover ? Number(info.skorLandcover).toFixed(2) : "-";
  if (detailScore) detailScore.textContent = "-";
  if (detailDesc) {
    detailDesc.textContent = info?.imbauan || "Pilih layer atau klik lokasi pada peta untuk melihat ringkasan informasi.";
  }
}

function applyLayerOpacity() {
  const value = Number(mainOpacityRange?.value || rfOpacityRange?.value || 70) / 100;
  const label = Math.round(value * 100) + "%";

  if (opacityValue) opacityValue.textContent = label;

  [
    slopeLayer,
    rainLayer,
    landcoverLayer,
    slopeRainLayer,
    slopeLandcoverLayer,
    rainLandcoverLayer,
    rfLayer
  ].forEach(layer => {
    if (layer && typeof layer.setOpacity === "function") {
      layer.setOpacity(value);
    }
  });
}

function setBasemap(type) {
  if (!map || !osmBaseLayer || !satelliteBaseLayer) return;

  if (map.hasLayer(osmBaseLayer)) map.removeLayer(osmBaseLayer);
  if (map.hasLayer(satelliteBaseLayer)) map.removeLayer(satelliteBaseLayer);

  if (type === "osm") {
    osmBaseLayer.addTo(map);
    osmBtn?.classList.add("active");
    satelliteBtn?.classList.remove("active");
  } else {
    satelliteBaseLayer.addTo(map);
    satelliteBtn?.classList.add("active");
    osmBtn?.classList.remove("active");
  }
}

function focusSelectedCompany() {
  const company = selectedCompanyData();
  if (!map || !company) return;

  const latlng = L.latLng(company.coords[0], company.coords[1]);
  lastFocusedLatLng = latlng;
  map.setView(latlng, 15);
  updateLocationPanel(company, latlng);
}

function initRedesignControls() {
  updateLocationPanel(null);
  updateFeatureImportanceCard(getDashboardInfoByCheckbox());
  updateRiskStatisticCard(getDashboardInfoByCheckbox());
  fetchAreaStatsFromBackend();
  applyLayerOpacity();
}

companySelect?.addEventListener("change", focusSelectedCompany);
focusMineBtn?.addEventListener("click", focusSelectedCompany);
resetMapBtn?.addEventListener("click", () => {
  backToDefaultView();
  if (villageMarkerLayer) villageMarkerLayer.clearLayers();
  updateLocationPanel(null);
});

mainOpacityRange?.addEventListener("input", () => {
  if (rfOpacityRange) rfOpacityRange.value = mainOpacityRange.value;
  applyLayerOpacity();
});

rfOpacityRange?.addEventListener("input", () => {
  if (mainOpacityRange) mainOpacityRange.value = rfOpacityRange.value;
  applyLayerOpacity();
});

osmBtn?.addEventListener("click", () => setBasemap("osm"));
satelliteBtn?.addEventListener("click", () => setBasemap("satellite"));
closeInfoBtn?.addEventListener("click", () => {
  document.querySelector(".location-card")?.classList.toggle("is-hidden");
});
zoomLocationBtn?.addEventListener("click", () => {
  if (map && lastFocusedLatLng) map.setView(lastFocusedLatLng, 15);
});


// =======================================================
// 23. JALANKAN MAP SAAT DASHBOARD DIBUKA
// =======================================================

window.addEventListener("load", () => {
  initMap();

  if (chkSlope) chkSlope.checked = false;
  if (chkRain) chkRain.checked = false;
  if (chkLandcover) chkLandcover.checked = false;
  if (chkRF) chkRF.checked = false;
  if (chkBoundaryKab) chkBoundaryKab.checked = true;
  if (chkBoundaryKec) chkBoundaryKec.checked = true;

  resetLayers();
  updateLayer();
  updateAccuracy();
  updateDashboardCards();
  initRedesignControls();
});