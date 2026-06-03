<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - GIS Area Rawan Dampak Pertambangan</title>

  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="dashboard-redesign.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
</head>

<body>
<section id="dashboardPage" class="page active dashboard-redesign">

  <!-- ================= TOPBAR ================= -->
  <header class="topbar">
    <div class="brand-area">
      <img src="assets/logo_konsel.png" alt="Logo Konawe Selatan" class="brand-logo">
      <div>
        <h1>GIS Area Rawan Dampak Pertambangan</h1>
        <p>Kabupaten Konawe Selatan</p>
      </div>
    </div>

    <nav class="top-nav" aria-label="Navigasi utama">
      <a href="dashboard.php" class="active">▥ Dashboard</a>
      <a href="analysis.php">⌁ Statistik</a>
      <a href="about.php">ⓘ Tentang</a>
    </nav>

    <div class="university-area">
      <img src="assets/logo_uho.png" alt="Logo Universitas Halu Oleo" class="uho-logo">
      <span>UNIVERSITAS<br>HALU OLEO</span>
    </div>
  </header>

  <!-- ================= DASHBOARD BODY ================= -->
  <div class="dashboard-layout">

    <!-- ================= LEFT CONTROL PANEL ================= -->
    <aside class="control-panel" id="dataLayer">
      <div class="panel-section">
        <h3>▧ Layer</h3>

        <label class="layer-row">
          <input type="checkbox" id="chkBoundaryKab" checked>
          <span class="layer-symbol boundary"></span>
          <span>Batas Kabupaten</span>
          <button type="button" class="mini-setting" aria-label="Pengaturan batas kabupaten">⚙</button>
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkBoundaryKec" checked>
          <span class="layer-symbol subboundary"></span>
          <span>Batas Kecamatan</span>
          <button type="button" class="mini-setting" aria-label="Pengaturan batas kecamatan">⚙</button>
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkCompany" checked>
          <span class="layer-symbol company"></span>
          <span>Lokasi Perusahaan Tambang</span>
          <button type="button" class="mini-setting" aria-label="Pengaturan lokasi perusahaan">⚙</button>
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkSlope">
          <span class="layer-symbol slope"></span>
          <span>Kemiringan Lereng</span>
          <input type="range" class="mini-range" min="0" max="100" value="70" aria-label="Transparansi slope">
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkRain">
          <span class="layer-symbol rain"></span>
          <span>Curah Hujan</span>
          <input type="range" class="mini-range" min="0" max="100" value="70" aria-label="Transparansi curah hujan">
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkLandcover">
          <span class="layer-symbol landcover"></span>
          <span>Tutupan Lahan</span>
          <input type="range" class="mini-range" min="0" max="100" value="70" aria-label="Transparansi tutupan lahan">
        </label>

        <label class="layer-row">
          <input type="checkbox" id="chkRF">
          <span class="layer-symbol rf"></span>
          <span>Hasil Random Forest</span>
          <input type="range" id="rfOpacityRange" class="mini-range" min="0" max="100" value="70" aria-label="Transparansi hasil random forest">
        </label>
      </div>

      <div class="panel-section">
        <h3>Pilih Perusahaan Tambang</h3>
        <select id="companySelect" class="select-control">
          <option value="PT. Macika Mada Madana">PT. Macika Mada Madana</option>
          <option value="PT. Jagad Rayatama">PT. Jagad Rayatama</option>
        </select>
      </div>

      <div class="panel-section legend-section">
        <h3>Legenda - Hasil Random Forest</h3>
        <div class="legend-item"><span class="box risk-aman"></span>Aman</div>
        <div class="legend-item"><span class="box risk-sedang"></span>Sedang</div>
        <div class="legend-item"><span class="box risk-rawan"></span>Rawan</div>
      </div>

      <div class="panel-section">
        <h3>Transparansi Layer</h3>
        <div class="opacity-row">
          <span>Hasil Random Forest</span>
          <strong id="opacityValue">70%</strong>
        </div>
        <input type="range" id="mainOpacityRange" class="opacity-range" min="0" max="100" value="70">
      </div>

      <div class="panel-section action-section">
        <h3>Aksi</h3>
        <button type="button" id="focusMineBtn" class="primary-action">⌖ Fokus ke Area Tambang</button>
        <button type="button" id="resetMapBtn" class="secondary-action">↻ Reset Peta</button>
      </div>
    </aside>

    <!-- ================= MAP AND RESULT AREA ================= -->
    <main class="map-area">
      <section class="map-stage">
        <div class="map-search">
          <input type="text" placeholder="Cari lokasi..." aria-label="Cari lokasi">
          <button type="button" id="searchBtn" aria-label="Cari lokasi">🔍</button>
        </div>

        <div id="map"></div>

        <aside class="location-card">
          <div class="location-header">
            <h3>Informasi Lokasi</h3>
            <button type="button" id="closeInfoBtn" aria-label="Tutup informasi">×</button>
          </div>

          <p id="detailLatLon" class="coord-text">Lat: - , Lon: -</p>

          <div class="status-box">
            <span class="status-icon">!</span>
            <div>
              <small>Status Kerawanan</small>
              <strong id="detailStatus">-</strong>
            </div>
          </div>

          <div class="parameter-box">
            <h4>Nilai Parameter</h4>
            <div class="param-row"><span>♧ Kemiringan Lereng</span><strong id="detailSlope">-</strong></div>
            <div class="param-row"><span>☁ Curah Hujan (Tahunan)</span><strong id="detailRain">-</strong></div>
            <div class="param-row"><span>♢ Tutupan Lahan</span><strong id="detailLandcover">-</strong></div>
            <div class="param-row"><span>▤ Skor Kerawanan (RF)</span><strong id="detailScore">-</strong></div>
          </div>

          <div class="explain-box">
            <h4>Keterangan</h4>
            <p id="detailDesc">Pilih layer atau klik lokasi pada peta untuk melihat ringkasan informasi.</p>
          </div>

          <button type="button" id="zoomLocationBtn" class="outline-action">⌕ Zoom ke Lokasi</button>
        </aside>

        <div class="map-switcher">
          <button type="button" id="osmBtn" class="active">OSM</button>
          <button type="button" id="satelliteBtn">Satelit</button>
        </div>
      </section>

      <section class="bottom-cards" id="analysisSection">
        <article class="metric-card accuracy-card">
          <article class="metric-card accuracy-card">
  <h3>Akurasi Model</h3>

  <div class="accuracy-content">
    <div class="donut" id="modelAccuracyCircle">
      <span id="modelAccuracyText">-</span>
    </div>

    <div class="metric-list">
      <div><span>Akurasi</span><strong id="accuracyLine">-</strong></div>
      <div><span>Kappa</span><strong id="kappaLine">-</strong></div>
      <div><span>Precision</span><strong id="precisionLine">-</strong></div>
      <div><span>Recall</span><strong id="recallLine">-</strong></div>
      <div><span>F1-Score</span><strong id="f1Line">-</strong></div>
    </div>
  </div>

  <p id="accuracyModelLine">Model: -</p>
  <p id="accuracyNoteLine">Pilih kombinasi parameter untuk melihat evaluasi model.</p>
</article>
          <p>Model: Random Forest</p>
          <p>Data Uji: 30% (78 titik)</p>
        </article>

        <article class="metric-card feature-card">
          <h3>Pengaruh Parameter (Feature Importance)</h3>
          <div class="bar-row"><span>Kemiringan Lereng</span><div class="bar-track"><div id="barSlope" class="bar-fill"></div></div><strong id="barSlopeText">-</strong></div>
          <div class="bar-row"><span>Curah Hujan</span><div class="bar-track"><div id="barRain" class="bar-fill rain-fill"></div></div><strong id="barRainText">-</strong></div>
          <div class="bar-row"><span>Tutupan Lahan</span><div class="bar-track"><div id="barLandcover" class="bar-fill land-fill"></div></div><strong id="barLandcoverText">-</strong></div>
          <div class="bar-axis"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div>
        </article>

        <article class="metric-card stats-card" id="statistikSection">
          <h3>Statistik Kerawanan</h3>
          <div class="stats-content">
            <div class="risk-donut" id="riskDonut"></div>
            <div class="risk-list">
              <div>
                <span><i class="risk-dot risk-aman"></i>Aman</span>
                <strong>
                  <span id="statSafe">-</span>
                  <small id="statSafeArea">-</small>
                </strong>
              </div>
              <div>
                <span><i class="risk-dot risk-sedang"></i>Sedang</span>
                <strong>
                  <span id="statMedium">-</span>
                  <small id="statMediumArea">-</small>
                </strong>
              </div>
              <div>
                <span><i class="risk-dot risk-rawan"></i>Rawan</span>
                <strong>
                  <span id="statHigh">-</span>
                  <small id="statHighArea">-</small>
                </strong>
              </div>
            </div>
          </div>
          <p class="total-area">Total Area Analisis: <strong id="totalAreaText">-</strong></p>
        </article>
      </section>
    </main>
  </div>

  <footer class="dashboard-footer">
    <span>GIS Area Rawan Dampak Pertambangan - Kabupaten Konawe Selatan</span>
    <span>Sumber Data: DEMNAS, CHIRPS, ESA WorldCover, Interpretasi Citra</span>
    <span>© 2024</span>
  </footer>
</section>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="dashboard.js"></script>
</body>
</html>
