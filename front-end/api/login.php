<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->email) || empty($data->password)) {
  echo json_encode([
    "status" => "error",
    "message" => "Email dan password wajib diisi"
  ]);
  exit;
}

$email = trim($data->email);
$password = $data->password;

$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
  echo json_encode([
    "status" => "error",
    "message" => "Email tidak ditemukan"
  ]);
  exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user["password"])) {
  echo json_encode([
    "status" => "error",
    "message" => "Password salah"
  ]);
  exit;
}

echo json_encode([
  "status" => "success",
  "user" => [
    "id" => $user["id"],
    "name" => $user["name"],
    "email" => $user["email"]
  ]
]);
?>