-- Update payment methods with correct account information
UPDATE payment_methods SET account_info = JSON_OBJECT(
  'bank', 'Mercantil',
  'phone', '04125195422',
  'cedula', '26076681',
  'name', 'Rifas El Negro'
) WHERE method_name = 'pago_movil';

UPDATE payment_methods SET account_info = JSON_OBJECT(
  'email', 'fuscoriccardo11@gmail.com',
  'name', 'Rifas El Negro'
) WHERE method_name = 'zelle';

UPDATE payment_methods SET account_info = JSON_OBJECT(
  'user_id', '435121334',
  'email', 'fuscoriccardo11@gmail.com'
) WHERE method_name = 'binance';

-- Add cash payment method for in-person payments
INSERT INTO payment_methods (method_name, account_info, is_active) VALUES 
('efectivo', JSON_OBJECT(
  'whatsapp', '+58963830808',
  'instructions', 'Contactar por WhatsApp para coordinar pago en efectivo'
), 1);
