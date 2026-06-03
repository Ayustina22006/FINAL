<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "gis_db");

if ($conn->connect_error) {
  echo json_encode([
    "status" => "error",
    "message" => "Koneksi database gagal: " . $conn->connect_error
  ]);
  exit;
}
?>