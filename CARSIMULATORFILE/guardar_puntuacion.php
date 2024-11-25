<?php
// Habilitar CORS para solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *"); // Permite solicitudes desde cualquier origen
header("Access-Control-Allow-Headers: Content-Type"); // Permite el encabezado 'Content-Type'
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permite los métodos POST y OPTIONS

// Manejo de preflight (para solicitudes OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Responder con éxito a las solicitudes preflight
    exit(); // Detener la ejecución aquí para las solicitudes OPTIONS
}

// Conexión a la base de datos (ajusta esto con los datos de tu servidor SQL)
$host = "localhost";
$username = "root";
$password = "";
$database = "puntuaciones_db";

// Crear conexión
$conn = new mysqli($host, $username, $password, $database);

// Verificar la conexión
if ($conn->connect_error) {
    die("Error de conexión a la base de datos: " . $conn->connect_error);
}

// Obtener datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

// Validar que los datos sean correctos
if (isset($data['nombre']) && isset($data['puntuacion'])) {
    $nombre = $conn->real_escape_string($data['nombre']);
    $puntuacion = (int)$data['puntuacion'];

    // Insertar datos en la base de datos
    $sql = "INSERT INTO puntuaciones (nombre, puntuacion) VALUES ('$nombre', $puntuacion)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Puntuación guardada correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al guardar la puntuación: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Datos inválidos."]);
}

// Cerrar la conexión
$conn->close();
?>
