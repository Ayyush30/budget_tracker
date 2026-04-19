<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$title = $data["title"];
$amount = $data["amount"];
$date = $data["date"];
$category = $data["category"];
$type = $data["type"];

$sql = "INSERT INTO transactions (title, amount, date, category, type)
VALUES ('$title', '$amount', '$date', '$category', '$type')";

$conn->query($sql);
?>