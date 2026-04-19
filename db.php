<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "budget_tracker";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>