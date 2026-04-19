<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];

$conn->query("DELETE FROM transactions WHERE id=$id");
?>