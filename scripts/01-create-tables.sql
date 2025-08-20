-- Creating database schema for raffle system
-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ticket_price DECIMAL(10, 2) NOT NULL,
  first_prize DECIMAL(10, 2) NOT NULL,
  second_prize DECIMAL(10, 2) NOT NULL,
  third_prize DECIMAL(10, 2) NOT NULL,
  draw_date DATE NOT NULL,
  status ENUM('active', 'closed', 'drawn') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Raffle numbers (000-999)
CREATE TABLE IF NOT EXISTS raffle_numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raffle_id INT NOT NULL,
  number VARCHAR(3) NOT NULL,
  user_id INT,
  status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
  reserved_at TIMESTAMP NULL,
  sold_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_raffle_number (raffle_id, number)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raffle_number_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_method ENUM('pago_movil', 'binance', 'zelle') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reference_number VARCHAR(255),
  payment_proof TEXT,
  status ENUM('pending', 'validated', 'rejected') DEFAULT 'pending',
  validated_by INT,
  validated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (raffle_number_id) REFERENCES raffle_numbers(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (validated_by) REFERENCES users(id)
);

-- Payment methods configuration
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  method_name ENUM('pago_movil', 'binance', 'zelle') NOT NULL,
  account_info JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
