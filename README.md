# SplitEase - Bill Splitting App

A simple web application to split bills among friends with discounts and extra expenses.

## Features

- Calculate individual shares when splitting a bill
- Add multiple discounts
- Add multiple extra expenses
- Add multiple people with custom amounts
- Save calculations to database and log file
- Clean, modern UI with Font Awesome icons

## Installation

1. Create a MySQL database named `bill_splitter`
2. Update the database credentials in `process.php`
3. Create a `logs` directory and make it writable
4. Upload all files to your web server

## Requirements

- PHP 7.0 or higher
- MySQL 5.6 or higher
- Web server (Apache, Nginx, etc.)

## Usage

1. Enter the total bill amount
2. Add any discounts (optional)
3. Add any extra expenses (optional)
4. Add all people sharing the bill
5. Click "Calculate Split" to see the results
6. Save the calculation if desired

## Updates

### Update 1
   1. Automatically calculate total based on person contributions
   2. Show all ammounts in proper Rupiah format
   3. Provide suggestions for common discount types, extra expenses, and people names
   4. Display all text in Bahasa