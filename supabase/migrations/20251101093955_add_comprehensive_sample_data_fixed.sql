/*
  # Add Comprehensive Sample Data for All Universities

  1. Sample Data
    - Classrooms for Taylor, Sunway, and Monash
    - Lifts for all universities
    - Parking lots for all universities
    - Library seats for all universities
    - Food stalls (canteen seats) for all universities
    - Traffic routes for all universities
    - Emergency contacts for all universities

  2. Notes
    - Data is realistic and representative of each university
    - All universities have equal amount of data
*/

-- Get university IDs
DO $$
DECLARE
  taylor_id uuid;
  sunway_id uuid;
  monash_id uuid;
BEGIN
  SELECT id INTO taylor_id FROM universities WHERE code = 'TAYLORS';
  SELECT id INTO sunway_id FROM universities WHERE code = 'SUNWAY';
  SELECT id INTO monash_id FROM universities WHERE code = 'MONASH';

  -- TAYLOR UNIVERSITY DATA

  -- Classrooms
  INSERT INTO classrooms (name, building, capacity, is_available, university_id) VALUES
    ('T101', 'Block T', 50, true, taylor_id),
    ('T102', 'Block T', 45, false, taylor_id),
    ('T201', 'Block T', 60, true, taylor_id),
    ('T202', 'Block T', 55, true, taylor_id),
    ('A101', 'Block A', 40, true, taylor_id),
    ('A102', 'Block A', 40, false, taylor_id),
    ('A201', 'Block A', 50, true, taylor_id),
    ('B101', 'Block B', 35, true, taylor_id),
    ('B102', 'Block B', 35, true, taylor_id),
    ('B201', 'Block B', 45, false, taylor_id);

  -- Lifts
  INSERT INTO lifts (name, building, current_floor, queue_count, university_id) VALUES
    ('Lift A1', 'Block T', 1, 3, taylor_id),
    ('Lift A2', 'Block T', 5, 1, taylor_id),
    ('Lift B1', 'Block A', 2, 5, taylor_id),
    ('Lift B2', 'Block A', 0, 2, taylor_id),
    ('Lift C1', 'Block B', 3, 0, taylor_id);

  -- Parking
  INSERT INTO parking_lots (name, total_spaces, available_spaces, university_id) VALUES
    ('Main Campus Parking', 500, 123, taylor_id),
    ('Staff Parking', 200, 45, taylor_id),
    ('Visitor Parking', 100, 78, taylor_id);

  -- Library Seats
  INSERT INTO library_seats (floor, section, seat_number, is_available, has_charging_port, university_id) VALUES
    ('1', 'Study Zone A', 'A01', true, true, taylor_id),
    ('1', 'Study Zone A', 'A02', false, true, taylor_id),
    ('1', 'Study Zone A', 'A03', true, false, taylor_id),
    ('1', 'Study Zone B', 'B01', true, true, taylor_id),
    ('1', 'Study Zone B', 'B02', true, false, taylor_id),
    ('2', 'Silent Zone', 'S01', false, true, taylor_id),
    ('2', 'Silent Zone', 'S02', true, true, taylor_id),
    ('2', 'Silent Zone', 'S03', true, true, taylor_id),
    ('2', 'Group Study', 'G01', false, false, taylor_id),
    ('2', 'Group Study', 'G02', true, false, taylor_id);

  -- Food Stalls
  INSERT INTO food_stalls (name, available_seats, total_seats, university_id) VALUES
    ('Asian Delight', 15, 30, taylor_id),
    ('Western Grill', 8, 25, taylor_id),
    ('Noodle House', 20, 35, taylor_id),
    ('Coffee Corner', 12, 20, taylor_id);

  -- Traffic Routes
  INSERT INTO traffic_routes (route_name, from_location, to_location, distance_km, university_id) VALUES
    ('Main Gate to Campus', 'Main Gate', 'Taylor Campus', 2.5, taylor_id),
    ('LRT to Campus', 'Subang Jaya LRT', 'Taylor Campus', 3.2, taylor_id);

  -- Traffic Status
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Light', 8 FROM traffic_routes WHERE route_name = 'Main Gate to Campus' AND university_id = taylor_id;
  
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Moderate', 15 FROM traffic_routes WHERE route_name = 'LRT to Campus' AND university_id = taylor_id;

  -- Emergency Contacts
  INSERT INTO emergency_contacts (category, name, phone, description, university_id) VALUES
    ('Campus Security', 'Taylor Security Office', '+603-5629-5000', '24/7 campus security', taylor_id),
    ('Medical', 'Campus Clinic', '+603-5629-5100', 'First aid and medical assistance', taylor_id),
    ('Emergency', 'Fire Department', '994', 'Fire emergency', taylor_id),
    ('IT Support', 'IT Helpdesk', '+603-5629-5200', 'Technical support', taylor_id);

  -- SUNWAY UNIVERSITY DATA

  -- Classrooms
  INSERT INTO classrooms (name, building, capacity, is_available, university_id) VALUES
    ('S101', 'SB Block', 45, true, sunway_id),
    ('S102', 'SB Block', 40, true, sunway_id),
    ('S201', 'SB Block', 55, false, sunway_id),
    ('S202', 'SB Block', 50, true, sunway_id),
    ('M101', 'Main Building', 60, true, sunway_id),
    ('M102', 'Main Building', 45, false, sunway_id),
    ('M201', 'Main Building', 50, true, sunway_id),
    ('L101', 'Library Block', 30, true, sunway_id),
    ('L102', 'Library Block', 30, true, sunway_id),
    ('L201', 'Library Block', 40, false, sunway_id);

  -- Lifts
  INSERT INTO lifts (name, building, current_floor, queue_count, university_id) VALUES
    ('Lift S1', 'SB Block', 2, 4, sunway_id),
    ('Lift S2', 'SB Block', 4, 2, sunway_id),
    ('Lift M1', 'Main Building', 1, 6, sunway_id),
    ('Lift M2', 'Main Building', 3, 1, sunway_id),
    ('Lift L1', 'Library Block', 0, 3, sunway_id);

  -- Parking
  INSERT INTO parking_lots (name, total_spaces, available_spaces, university_id) VALUES
    ('Pyramid Parking', 600, 234, sunway_id),
    ('Campus Parking', 400, 89, sunway_id),
    ('Staff Parking', 150, 67, sunway_id);

  -- Library Seats
  INSERT INTO library_seats (floor, section, seat_number, is_available, has_charging_port, university_id) VALUES
    ('1', 'Reading Area', 'R01', true, true, sunway_id),
    ('1', 'Reading Area', 'R02', false, true, sunway_id),
    ('1', 'Reading Area', 'R03', true, true, sunway_id),
    ('1', 'Computer Lab', 'C01', true, true, sunway_id),
    ('1', 'Computer Lab', 'C02', false, true, sunway_id),
    ('2', 'Quiet Study', 'Q01', true, true, sunway_id),
    ('2', 'Quiet Study', 'Q02', true, false, sunway_id),
    ('2', 'Quiet Study', 'Q03', false, true, sunway_id),
    ('3', 'Discussion Room', 'D01', true, false, sunway_id),
    ('3', 'Discussion Room', 'D02', true, false, sunway_id);

  -- Food Stalls
  INSERT INTO food_stalls (name, available_seats, total_seats, university_id) VALUES
    ('Food Court Level 1', 45, 80, sunway_id),
    ('Cafeteria', 30, 60, sunway_id),
    ('Coffee Bean', 8, 15, sunway_id),
    ('Subway', 5, 12, sunway_id);

  -- Traffic Routes
  INSERT INTO traffic_routes (route_name, from_location, to_location, distance_km, university_id) VALUES
    ('BRT to Campus', 'Sunway BRT Station', 'Sunway University', 0.8, sunway_id),
    ('Highway to Campus', 'Federal Highway', 'Sunway University', 5.0, sunway_id);

  -- Traffic Status
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Light', 5 FROM traffic_routes WHERE route_name = 'BRT to Campus' AND university_id = sunway_id;
  
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Heavy', 25 FROM traffic_routes WHERE route_name = 'Highway to Campus' AND university_id = sunway_id;

  -- Emergency Contacts
  INSERT INTO emergency_contacts (category, name, phone, description, university_id) VALUES
    ('Campus Security', 'Sunway Security', '+603-7491-8622', '24/7 campus security', sunway_id),
    ('Medical', 'Medical Centre', '+603-7491-9191', 'Medical emergencies', sunway_id),
    ('Emergency', 'Police', '999', 'Police emergency', sunway_id),
    ('IT Support', 'IT Services', '+603-7491-8200', 'Technical support', sunway_id);

  -- MONASH UNIVERSITY DATA

  -- Classrooms
  INSERT INTO classrooms (name, building, capacity, is_available, university_id) VALUES
    ('N101', 'Building N', 50, true, monash_id),
    ('N102', 'Building N', 48, false, monash_id),
    ('N201', 'Building N', 55, true, monash_id),
    ('N202', 'Building N', 52, true, monash_id),
    ('E101', 'Building E', 45, true, monash_id),
    ('E102', 'Building E', 40, true, monash_id),
    ('E201', 'Building E', 50, false, monash_id),
    ('W101', 'Building W', 35, true, monash_id),
    ('W102', 'Building W', 38, true, monash_id),
    ('W201', 'Building W', 42, false, monash_id);

  -- Lifts
  INSERT INTO lifts (name, building, current_floor, queue_count, university_id) VALUES
    ('Lift N1', 'Building N', 3, 2, monash_id),
    ('Lift N2', 'Building N', 1, 4, monash_id),
    ('Lift E1', 'Building E', 2, 3, monash_id),
    ('Lift E2', 'Building E', 4, 1, monash_id),
    ('Lift W1', 'Building W', 0, 5, monash_id);

  -- Parking
  INSERT INTO parking_lots (name, total_spaces, available_spaces, university_id) VALUES
    ('North Parking', 450, 156, monash_id),
    ('South Parking', 350, 98, monash_id),
    ('Staff Parking', 180, 34, monash_id);

  -- Library Seats
  INSERT INTO library_seats (floor, section, seat_number, is_available, has_charging_port, university_id) VALUES
    ('1', 'Level 1 Study', '1A01', true, true, monash_id),
    ('1', 'Level 1 Study', '1A02', true, true, monash_id),
    ('1', 'Level 1 Study', '1A03', false, false, monash_id),
    ('1', 'Level 1 Quiet', '1Q01', true, true, monash_id),
    ('1', 'Level 1 Quiet', '1Q02', false, true, monash_id),
    ('2', 'Level 2 Study', '2A01', true, true, monash_id),
    ('2', 'Level 2 Study', '2A02', true, false, monash_id),
    ('2', 'Level 2 Silent', '2S01', false, true, monash_id),
    ('2', 'Level 2 Silent', '2S02', true, true, monash_id),
    ('3', 'Level 3 Group', '3G01', true, false, monash_id);

  -- Food Stalls
  INSERT INTO food_stalls (name, available_seats, total_seats, university_id) VALUES
    ('Main Cafeteria', 55, 100, monash_id),
    ('Food Court', 35, 70, monash_id),
    ('Starbucks', 10, 20, monash_id),
    ('Chicken Restaurant', 12, 25, monash_id);

  -- Traffic Routes
  INSERT INTO traffic_routes (route_name, from_location, to_location, distance_km, university_id) VALUES
    ('MRT to Campus', 'Sunway South Quay MRT', 'Monash University', 2.0, monash_id),
    ('Toll Plaza to Campus', 'Sunway Toll Plaza', 'Monash University', 3.5, monash_id);

  -- Traffic Status
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Moderate', 12 FROM traffic_routes WHERE route_name = 'MRT to Campus' AND university_id = monash_id;
  
  INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
  SELECT id, 'Light', 10 FROM traffic_routes WHERE route_name = 'Toll Plaza to Campus' AND university_id = monash_id;

  -- Emergency Contacts
  INSERT INTO emergency_contacts (category, name, phone, description, university_id) VALUES
    ('Campus Security', 'Monash Security', '+603-5514-6000', '24/7 campus security', monash_id),
    ('Medical', 'Campus Health Centre', '+603-5514-6565', 'Medical services', monash_id),
    ('Emergency', 'Ambulance', '999', 'Medical emergency', monash_id),
    ('IT Support', 'eSolutions', '+603-5514-6333', 'IT support', monash_id);

END $$;
