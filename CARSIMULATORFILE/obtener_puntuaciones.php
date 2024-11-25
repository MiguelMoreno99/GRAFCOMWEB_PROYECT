<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Conexión a la base de datos
$host = "localhost";
$username = "root";
$password = "";
$database = "puntuaciones_db";

// Crear conexión
$conn = new mysqli($host, $username, $password, $database);

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
    exit();
}

// Consultar las 5 mejores puntuaciones
$sql = "SELECT nombre, puntuacion FROM puntuaciones ORDER BY puntuacion DESC LIMIT 5";
$result = $conn->query($sql);

$puntuaciones = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $puntuaciones[] = $row;
    }
}

// Devolver los datos como JSON
echo json_encode(["status" => "success", "data" => $puntuaciones]);

// Cerrar la conexión
$conn->close();
?>
