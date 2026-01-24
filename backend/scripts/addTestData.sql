-- Test Data for Rooms and Employee Assignments
-- This script adds sample data to test the rooms feature

USE asset_management;

-- Insert a location for testing (if not exists)
INSERT INTO locations (name, address, description) 
SELECT 'Test Building', '123 Main Street', 'Test Building for Demo' 
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Test Building')
LIMIT 1;

-- Get the location ID
SET @location_id = (SELECT id FROM locations WHERE name = 'Test Building' LIMIT 1);

-- Insert sample rooms
INSERT INTO rooms (name, floor, capacity, description, location_id)
SELECT 'Conference Room A', '1', 20, 'Large conference room', @location_id
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Conference Room A')
LIMIT 1;

INSERT INTO rooms (name, floor, capacity, description, location_id)
SELECT 'Office 101', '1', 4, 'Small office space', @location_id
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Office 101')
LIMIT 1;

INSERT INTO rooms (name, floor, capacity, description, location_id)
SELECT 'Server Room', '2', 2, 'IT Server Room', @location_id
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Server Room')
LIMIT 1;

-- Get room IDs
SET @room_a = (SELECT id FROM rooms WHERE name = 'Conference Room A' LIMIT 1);
SET @room_b = (SELECT id FROM rooms WHERE name = 'Office 101' LIMIT 1);
SET @room_c = (SELECT id FROM rooms WHERE name = 'Server Room' LIMIT 1);

-- Get the Super Admin ID (org_id = 2)
SET @super_admin_id = (SELECT id FROM users WHERE role = 'Super Admin' AND org_id = 2 LIMIT 1);

-- Get or create a Supervisor
SET @supervisor_id = (SELECT id FROM users WHERE role = 'Supervisor' AND org_id = 2 LIMIT 1);

-- Get or create Maintenance staff
SET @maintenance_id = (SELECT id FROM users WHERE role = 'Maintenance' AND org_id = 2 LIMIT 1);

-- Get or create test employees
SET @employee1_id = (SELECT id FROM users WHERE role = 'Employee' AND org_id = 2 LIMIT 1);

-- Insert test employees if they don't exist
INSERT INTO users (name, email, password, role, status, department, phone, ownpk, org_id, loc_id, room_id)
SELECT 'John Employee', 'john.emp@test.com', '$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm', 'Employee', 'Active', 'IT', '9999999999', 'TEST001', 2, @location_id, @room_a
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.emp@test.com')
LIMIT 1;

INSERT INTO users (name, email, password, role, status, department, phone, ownpk, org_id, loc_id, room_id)
SELECT 'Jane Employee', 'jane.emp@test.com', '$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm', 'Employee', 'Active', 'IT', '9999999998', 'TEST002', 2, @location_id, @room_a
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.emp@test.com')
LIMIT 1;

INSERT INTO users (name, email, password, role, status, department, phone, ownpk, org_id, loc_id, room_id)
SELECT 'Bob Employee', 'bob.emp@test.com', '$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm', 'Employee', 'Active', 'Operations', '9999999997', 'TEST003', 2, @location_id, @room_b
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob.emp@test.com')
LIMIT 1;

-- Get newly created employee IDs
SET @emp1_id = (SELECT id FROM users WHERE email = 'john.emp@test.com' LIMIT 1);
SET @emp2_id = (SELECT id FROM users WHERE email = 'jane.emp@test.com' LIMIT 1);
SET @emp3_id = (SELECT id FROM users WHERE email = 'bob.emp@test.com' LIMIT 1);

-- Get category
SET @category_id = (SELECT id FROM categories LIMIT 1);

-- Insert test assets assigned to employees in rooms
INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, assigned_to, assigned_by, created_by)
SELECT 'Laptop Dell XPS', 'Developer Laptop', 'DELL-001-TEST', @category_id, @location_id, @room_a, 'Assigned', 'Hardware', NOW(), @emp1_id, @supervisor_id, @super_admin_id
WHERE NOT EXISTS (SELECT 1 FROM assets WHERE serial_number = 'DELL-001-TEST')
LIMIT 1;

INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, assigned_to, assigned_by, created_by)
SELECT 'Monitor LG 27\"', 'High Resolution Monitor', 'LG-001-TEST', @category_id, @location_id, @room_a, 'Assigned', 'Hardware', NOW(), @emp1_id, @supervisor_id, @super_admin_id
WHERE NOT EXISTS (SELECT 1 FROM assets WHERE serial_number = 'LG-001-TEST')
LIMIT 1;

INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, assigned_to, assigned_by, created_by)
SELECT 'Keyboard Mechanical', 'RGB Mechanical Keyboard', 'KEY-001-TEST', @category_id, @location_id, @room_a, 'Assigned', 'Hardware', NOW(), @emp2_id, @supervisor_id, @super_admin_id
WHERE NOT EXISTS (SELECT 1 FROM assets WHERE serial_number = 'KEY-001-TEST')
LIMIT 1;

INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, assigned_to, assigned_by, created_by)
SELECT 'Office Chair', 'Ergonomic Office Chair', 'CHAIR-001-TEST', @category_id, @location_id, @room_b, 'Assigned', 'Hardware', NOW(), @emp3_id, @supervisor_id, @super_admin_id
WHERE NOT EXISTS (SELECT 1 FROM assets WHERE serial_number = 'CHAIR-001-TEST')
LIMIT 1;

-- Get asset IDs
SET @asset1_id = (SELECT id FROM assets WHERE serial_number = 'DELL-001-TEST' LIMIT 1);
SET @asset2_id = (SELECT id FROM assets WHERE serial_number = 'LG-001-TEST' LIMIT 1);
SET @asset3_id = (SELECT id FROM assets WHERE serial_number = 'KEY-001-TEST' LIMIT 1);

-- Insert maintenance records for some assets
INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status)
SELECT @asset1_id, @maintenance_id, 'Configuration', 'Initial Setup and Configuration', 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_records WHERE asset_id = @asset1_id AND maintenance_type = 'Configuration')
LIMIT 1;

INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status)
SELECT @asset2_id, @maintenance_id, 'Configuration', 'Installed and Tested', 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_records WHERE asset_id = @asset2_id AND maintenance_type = 'Configuration')
LIMIT 1;

-- Output summary
SELECT 'Test Data Summary' as 'Status';
SELECT COUNT(*) as 'Total Rooms' FROM rooms WHERE location_id = @location_id;
SELECT COUNT(*) as 'Total Employees' FROM users WHERE role = 'Employee' AND org_id = 2;
SELECT COUNT(*) as 'Total Assets in Test Building' FROM assets WHERE location_id = @location_id;
SELECT COUNT(*) as 'Total Maintenance Records' FROM maintenance_records;

SELECT CONCAT('Location ID: ', @location_id) as 'Configuration';
SELECT CONCAT('Test Building has ', COUNT(*), ' rooms') FROM rooms WHERE location_id = @location_id;
