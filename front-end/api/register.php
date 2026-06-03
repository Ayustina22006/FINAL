<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->name) || empty($data->email) || empty($data->password)) {
  echo json_encode([
    "status" => "error",
    "message" => "Semua field wajib diisi"
  ]);
  exit;
}

$name = trim($data->name);
$email = trim($data->email);
$password = $data->password;

if (strlen($password) < 6) {
  echo json_encode([
    "status" => "error",
    "message" => "Password minimal 6 karakter"
  ]);
  exit;
}

$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {
  echo json_encode([
    "status" => "error",
    "message" => "Email sudah terdaftar"
  ]);
  exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

if ($stmt->execute()) {
  echo json_encode([
    "status" => "success",
    "message" => "Registrasi berhasil"
  ]);
} else {
  echo json_encode([
    "status" => "error",
    "message" => "Registrasi gagal"
  ]);
}
?>