PANDUAN INSTALASI APLIKASI WEB GIS AREA RAWAN DAMPAK PERTAMBANGAN

A. MENJALANKAN WEBSITE PHP DI XAMPP
1. Ekstrak folder project ke:
   C:\xampp\htdocs\WEB_TA_APLIKASI_FINAL_REVISI
2. Jalankan Apache dan MySQL melalui XAMPP Control Panel.
3. Buka phpMyAdmin, buat database, lalu import:
   database/gis_db.sql
4. Cek koneksi database pada:
   api/db.php
5. Buka website:
   http://localhost/WEB_TA_APLIKASI_FINAL_REVISI/

B. MENJALANKAN BACKEND API GOOGLE EARTH ENGINE
Backend ini dipakai untuk membaca nilai per titik dan membuat tile layer dari asset GEE yang sama.
Tujuannya agar warna peta dan keterangan popup tidak berbeda.

1. Buka CMD, masuk ke folder project:
   cd C:\xampp\htdocs\WEB_TA_APLIKASI_FINAL_REVISI

2. Install package jika node_modules belum ada:
   npm install

3. Siapkan file service account Google Cloud:
   - Download key JSON dari Google Cloud Service Account.
   - Rename file hasil download menjadi:
     service-account-key.json
   - Simpan di folder project yang sama dengan server.js.

4. PENTING:
   File service-account-key.json di paket ini dikosongkan demi keamanan.
   Kamu wajib menggantinya dengan JSON asli dari Google Cloud.
   Jangan membagikan isi file service-account-key.json ke siapa pun.

5. Share SEMUA asset GEE ke email service account.
   Buka file service-account-key.json, cari bagian:
   "client_email": "..."
   Email tersebut harus diberi akses Reader pada semua asset yang dipakai di file .env.

6. Cek konfigurasi pada file .env.
   Aturan kelas yang dipakai:
   - Random Forest: 0=Aman, 1=Sedang, 2=Tinggi
   - Parameter dasar: 1=Aman, 2=Sedang, 3=Tinggi

   Bagian penting RF All:
   GEE_RF_ALL_ASSET=users/annisanurfadilah_e1e122004/RF_KERAWANAN_MASKED_NEW
   GEE_RF_ALL_BAND=0

7. Jalankan backend:
   npm start
   atau:
   node server.js

8. Tes backend di browser:
   http://localhost:3000/api/status

9. Tes asset GEE:
   http://localhost:3000/api/debug-assets

10. Tes tile RF All:
   http://localhost:3000/api/tile/rf_all

11. Tes baca nilai titik:
   http://localhost:3000/api/identify?lat=-4.4078&lng=122.3755&layer=all

C. CATATAN PERBAIKAN DI ZIP INI
1. server.js sudah diperbaiki:
   - Menghapus fungsi dobel.
   - Mapping RF tetap 0=Aman, 1=Sedang, 2=Tinggi.
   - Mapping parameter dasar 1=Aman, 2=Sedang, 3=Tinggi.
   - Menambahkan endpoint /api/tile/:layer agar peta dan popup membaca asset yang sama.

2. dashboard.js sudah diperbaiki:
   - Tidak lagi menganggap nilai 0 sebagai data kosong.
   - Popup membaca /api/identify?layer=all.
   - Tile layer dimuat dari backend /api/tile/:layer, bukan hanya dari tile URL lama yang hard-code.
   - Popup dibuat lebih ringkas.

D. ERROR YANG SERING MUNCUL
1. ENOENT service-account-key.json
   Artinya file key belum ada di folder project.

2. File service account ditemukan tetapi masih kosong
   Artinya file service-account-key.json ukurannya 0 byte. Ganti dengan JSON asli dari Google Cloud.

3. Permission denied / asset tidak bisa dibaca
   Artinya asset GEE belum di-share ke email client_email dari service account.

4. Nilai popup tidak sesuai warna peta
   Penyebab lama biasanya tile peta dan backend membaca asset berbeda.
   Pada versi ini tile dibuat dari endpoint /api/tile/:layer agar memakai asset yang sama dengan backend identify.

5. Nilai titik null / Tidak ada data
   Kemungkinan titik berada di luar area asset, pixel terkena mask, band salah, atau scale belum sesuai.
   Cek nama band di:
   http://localhost:3000/api/debug-assets

E. HALAMAN UTAMA
- index.php
- login.php
- register.php
- dashboard.php
- analysis.php
- about.php
