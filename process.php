<?php
header('Content-Type: application/json');

// Database configuration
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'bill_splitter';

// Create connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Create tables if they don't exist
$createTables = "
CREATE TABLE IF NOT EXISTS calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_bill DECIMAL(10,2) NOT NULL,
    total_discounts DECIMAL(10,2) NOT NULL,
    total_extras DECIMAL(10,2) NOT NULL,
    final_total DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calculation_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calculation_id INT NOT NULL,
    type ENUM('discount', 'extra', 'person') NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (calculation_id) REFERENCES calculations(id)
);
";

if (!$conn->multi_query($createTables)) {
    die(json_encode(['success' => false, 'message' => 'Error creating tables: ' . $conn->error]));
}

// Wait for multi_query to complete
while ($conn->next_result()) {;}

// Get the input data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    die(json_encode(['success' => false, 'message' => 'Invalid input data']));
}

// Calculate totals
$totalBill = $data['totalBill'];
$totalDiscount = 0;
$totalExtra = 0;

foreach ($data['discounts'] as $discount) {
    $totalDiscount += $discount['amount'];
}

foreach ($data['extras'] as $extra) {
    $totalExtra += $extra['amount'];
}

$finalTotal = $totalBill - $totalDiscount + $totalExtra;

// Save to database
try {
    // Begin transaction
    $conn->begin_transaction();

    // Insert calculation
    $stmt = $conn->prepare("INSERT INTO calculations (total_bill, total_discounts, total_extras, final_total) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("dddd", $totalBill, $totalDiscount, $totalExtra, $finalTotal);
    $stmt->execute();
    $calculationId = $conn->insert_id;
    $stmt->close();

    // Insert discounts
    $stmt = $conn->prepare("INSERT INTO calculation_details (calculation_id, type, description, amount) VALUES (?, 'discount', ?, ?)");
    foreach ($data['discounts'] as $discount) {
        $stmt->bind_param("isd", $calculationId, $discount['desc'], $discount['amount']);
        $stmt->execute();
    }
    $stmt->close();

    // Insert extras
    $stmt = $conn->prepare("INSERT INTO calculation_details (calculation_id, type, description, amount) VALUES (?, 'extra', ?, ?)");
    foreach ($data['extras'] as $extra) {
        $stmt->bind_param("isd", $calculationId, $extra['desc'], $extra['amount']);
        $stmt->execute();
    }
    $stmt->close();

    // Insert people
    $stmt = $conn->prepare("INSERT INTO calculation_details (calculation_id, type, description, amount) VALUES (?, 'person', ?, ?)");
    foreach ($data['people'] as $person) {
        $stmt->bind_param("isd", $calculationId, $person['name'], $person['amount']);
        $stmt->execute();
    }
    $stmt->close();

    // Commit transaction
    $conn->commit();

    // Log to file
    $logData = [
        'timestamp' => $data['timestamp'],
        'total_bill' => $totalBill,
        'total_discounts' => $totalDiscount,
        'total_extras' => $totalExtra,
        'final_total' => $finalTotal,
        'people' => $data['people']
    ];

    $logMessage = json_encode($logData) . PHP_EOL;
    file_put_contents('logs/bill_logs.txt', $logMessage, FILE_APPEND);

    echo json_encode([
        'success' => true, 
        'message' => 'Calculation saved successfully',
        'formatted' => [
            'total' => 'Rp' . number_format($finalTotal, 0, ',', '.'),
            'discount' => 'Rp' . number_format($totalDiscount, 0, ',', '.'),
            'extra' => 'Rp' . number_format($totalExtra, 0, ',', '.')
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error saving calculation: ' . $e->getMessage()]);
}

$conn->close();
?>