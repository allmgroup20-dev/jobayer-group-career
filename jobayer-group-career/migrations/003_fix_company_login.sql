-- Fix company login: replace old credentials with correct ones
-- Username: Jobayer Group, Password: 09876543
DELETE FROM company_users WHERE LOWER(username) = LOWER('Jobayer Group');
INSERT INTO company_users (username, password, name, role)
VALUES ('Jobayer Group', '52d1d87c3b2027f3f2660015ddf6463e97430b4e60099217143ac75a45646aa1', 'Jobayer Group', 'superadmin');
