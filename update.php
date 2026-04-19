<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];
$title = $data["title"];
$amount = $data["amount"];
$date = $data["date"];
$category = $data["category"];
$type = $data["type"];

$sql = "UPDATE transactions SET
title='$title',
amount='$amount',
date='$date',
category='$category',
type='$type'
WHERE id=$id";

$conn->query($sql);
?>