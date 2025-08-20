-- Initial data setup
-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@rifaselnegro.com', '$2b$10$rQZ8kqVvJ5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'Administrador El Negro', 'admin');

-- Create initial raffle
INSERT INTO raffles (title, description, ticket_price, first_prize, second_prize, third_prize, draw_date, created_by) VALUES 
('Rifa El Negro - Octubre 2025', 'Gran rifa con premios de $1000 a repartir en 3 premios', 400.00, 700.00, 200.00, 100.00, '2025-10-31', 1);

-- Generate all numbers 000-999 for the raffle
INSERT INTO raffle_numbers (raffle_id, number) 
SELECT 1, LPAD(n, 3, '0') 
FROM (
  SELECT a.N + b.N * 10 + c.N * 100 as n
  FROM 
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
  ORDER BY n
) numbers;

-- Setup payment methods
INSERT INTO payment_methods (method_name, account_info) VALUES 
('pago_movil', '{"bank": "Banesco", "phone": "0414-1234567", "cedula": "12345678", "name": "El Negro Rifas"}'),
('binance', '{"email": "rifas@elnegro.com", "user_id": "elnegro_rifas"}'),
('zelle', '{"email": "rifas@elnegro.com", "name": "El Negro Rifas"}');
