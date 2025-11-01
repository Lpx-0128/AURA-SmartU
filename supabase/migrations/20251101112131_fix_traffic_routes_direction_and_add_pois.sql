/*
  # Fix traffic routes and add proper POI destinations

  1. Changes
    - Clear existing traffic routes data
    - Restructure routes so university is the origin (from_location)
    - POIs (malls, stations, landmarks) are destinations (to_location)
    - Add proper coordinates for common POIs near each university
  
  2. New POI Destinations
    - Taylor's: Sunway Pyramid, Subang Parade, SS15, Subang Jaya LRT
    - Sunway: Sunway Pyramid, BRT Station, Sunway Medical Centre
    - Monash: Sunway Pyramid, Sunway South Quay MRT, Sunway Medical Centre
*/

DELETE FROM traffic_status;
DELETE FROM traffic_routes;

INSERT INTO traffic_routes (route_name, from_location, to_location, destination_latitude, destination_longitude, distance_km, university_id)
SELECT 
  'Campus to ' || destination,
  'Taylor University Campus',
  destination,
  lat,
  lng,
  dist,
  u.id
FROM universities u
CROSS JOIN (
  VALUES 
    ('Sunway Pyramid', 3.0732, 101.6074, 3.5),
    ('Subang Parade', 3.0507, 101.5822, 1.2),
    ('SS15 Food Court', 3.0761, 101.5881, 2.8),
    ('Subang Jaya LRT Station', 3.0495, 101.5813, 1.5)
) AS destinations(destination, lat, lng, dist)
WHERE u.code = 'TAYLORS';

INSERT INTO traffic_routes (route_name, from_location, to_location, destination_latitude, destination_longitude, distance_km, university_id)
SELECT 
  'Campus to ' || destination,
  'Sunway University Campus',
  destination,
  lat,
  lng,
  dist,
  u.id
FROM universities u
CROSS JOIN (
  VALUES 
    ('Sunway Pyramid', 3.0732, 101.6074, 1.0),
    ('BRT Sunway Lagoon Station', 3.0682, 101.6066, 0.5),
    ('Sunway Medical Centre', 3.0719, 101.6046, 0.8),
    ('Sunway Giza Mall', 3.0658, 101.6015, 1.2)
) AS destinations(destination, lat, lng, dist)
WHERE u.code = 'SUNWAY';

INSERT INTO traffic_routes (route_name, from_location, to_location, destination_latitude, destination_longitude, distance_km, university_id)
SELECT 
  'Campus to ' || destination,
  'Monash University Campus',
  destination,
  lat,
  lng,
  dist,
  u.id
FROM universities u
CROSS JOIN (
  VALUES 
    ('Sunway Pyramid', 3.0732, 101.6074, 1.2),
    ('Sunway South Quay MRT', 3.0654, 101.5995, 0.8),
    ('Sunway Medical Centre', 3.0719, 101.6046, 1.0),
    ('Sunway Velocity Mall', 3.0691, 101.6089, 1.5)
) AS destinations(destination, lat, lng, dist)
WHERE u.code = 'MONASH';

INSERT INTO traffic_status (route_id, status, estimated_time_minutes)
SELECT 
  tr.id,
  CASE (RANDOM() * 3)::int
    WHEN 0 THEN 'Light'
    WHEN 1 THEN 'Moderate'
    WHEN 2 THEN 'Heavy'
    ELSE 'Light'
  END,
  (5 + RANDOM() * 20)::int
FROM traffic_routes tr;
