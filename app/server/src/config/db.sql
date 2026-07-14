-- Organisations
INSERT INTO organisations (name, type, address, phone, email) VALUES
('City Pharmacy Belfast', 'pharmacy', '1 High Street, Belfast', '02890001111', 'city@pharmacy.com'),
('Hillview Surgery', 'gp_surgery', '5 Hillview Road, Belfast', '02890002222', 'hillview@gp.com');

-- Link the pharmacy to the surgery
INSERT INTO organisation_links (pharmacy_id, gp_surgery_id) VALUES (1, 2);

-- Users - one of each role
-- All using password: Password123!
INSERT INTO users (organisation_id, first_name, last_name, email, hashed_password, role) VALUES
(1, 'Jane', 'Doe', 'jane@pharmacy.com', '$2b$10$ID.fgdy2KHMibj7bPRO.h.0seaU94SxnwmtN.cL1jYAlA5/0caeLi', 'pharmacy_staff'),
(1, 'Mark', 'Reid', 'mark@pharmacy.com', '$2b$10$ID.fgdy2KHMibj7bPRO.h.0seaU94SxnwmtN.cL1jYAlA5/0caeLi', 'pharmacy_manager'),
(2, 'Sarah', 'Conn', 'sarah@surgery.com', '$2b$10$ID.fgdy2KHMibj7bPRO.h.0seaU94SxnwmtN.cL1jYAlA5/0caeLi', 'practice_staff'),
(2, 'Tom', 'Walsh', 'tom@surgery.com', '$2b$10$ID.fgdy2KHMibj7bPRO.h.0seaU94SxnwmtN.cL1jYAlA5/0caeLi', 'practice_manager'),
(1, 'Admin', 'User', 'admin@loop.com', '$2b$10$ID.fgdy2KHMibj7bPRO.h.0seaU94SxnwmtN.cL1jYAlA5/0caeLi', 'admin');