/*
  # Move Estimated Grab Fee to POI Traffic Table

  1. Changes
    - Add `estimated_grab_fee` column to `poi_traffic` table
    - Copy existing fee data from `pois` to `poi_traffic`
    - Remove `estimated_grab_fee` column from `pois` table
  
  2. Rationale
    - Grab fees are dynamic and context-specific (depend on traffic, time, etc.)
    - Better placed in `poi_traffic` table which tracks real-time traffic data
    - Keeps `pois` table focused on static location information
*/

-- Add estimated_grab_fee column to poi_traffic
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'poi_traffic' AND column_name = 'estimated_grab_fee'
  ) THEN
    ALTER TABLE poi_traffic ADD COLUMN estimated_grab_fee NUMERIC(6,2);
  END IF;
END $$;

-- Copy fees from pois to poi_traffic (if any exist)
UPDATE poi_traffic pt
SET estimated_grab_fee = p.estimated_grab_fee
FROM pois p
WHERE pt.poi_id = p.id 
  AND p.estimated_grab_fee IS NOT NULL
  AND pt.estimated_grab_fee IS NULL;

-- Set default fees for poi_traffic records based on POI names
UPDATE poi_traffic pt
SET estimated_grab_fee = 
  CASE 
    WHEN p.name ILIKE '%Sunway Pyramid%' THEN 8.50
    WHEN p.name ILIKE '%Sunway Lagoon%' THEN 9.00
    WHEN p.name ILIKE '%KTM Station%' OR p.name ILIKE '%Subang Jaya%Station%' THEN 12.00
    WHEN p.name ILIKE '%Paradigm Mall%' THEN 10.50
    WHEN p.name ILIKE '%SS15%' THEN 11.00
    WHEN p.name ILIKE '%Subang Airport%' THEN 18.00
    WHEN p.name ILIKE '%IOI City%' THEN 15.00
    WHEN p.name ILIKE '%Mines%' THEN 16.50
    WHEN p.name ILIKE '%Puchong%' THEN 13.00
    WHEN p.name ILIKE '%BRT%' THEN 7.00
    ELSE 12.00
  END
FROM pois p
WHERE pt.poi_id = p.id 
  AND pt.estimated_grab_fee IS NULL;

-- Remove estimated_grab_fee column from pois
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pois' AND column_name = 'estimated_grab_fee'
  ) THEN
    ALTER TABLE pois DROP COLUMN estimated_grab_fee;
  END IF;
END $$;