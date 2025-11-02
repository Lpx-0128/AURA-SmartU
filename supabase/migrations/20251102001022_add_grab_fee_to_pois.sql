/*
  # Add Estimated Grab Fee to POIs

  1. Changes
    - Add `estimated_grab_fee` column to `pois` table
    - Store the estimated Grab ride cost from university to each POI destination
    - Uses NUMERIC type for precise currency values
  
  2. Notes
    - Fee is stored in Malaysian Ringgit (RM)
    - Default value is NULL, will be populated with realistic estimates
    - Values represent approximate base fare without surge pricing
*/

-- Add estimated_grab_fee column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pois' AND column_name = 'estimated_grab_fee'
  ) THEN
    ALTER TABLE pois ADD COLUMN estimated_grab_fee NUMERIC(6,2);
  END IF;
END $$;

-- Update with realistic Grab fee estimates based on typical distances
-- Short distance (< 5km): RM 7-12
-- Medium distance (5-10km): RM 12-20
-- Long distance (> 10km): RM 20-35

UPDATE pois SET estimated_grab_fee = 
  CASE 
    -- Common destinations around Subang Jaya area
    WHEN name ILIKE '%Sunway Pyramid%' THEN 8.50
    WHEN name ILIKE '%Sunway Lagoon%' THEN 9.00
    WHEN name ILIKE '%KTM Station%' OR name ILIKE '%Subang Jaya%Station%' THEN 12.00
    WHEN name ILIKE '%Paradigm Mall%' THEN 10.50
    WHEN name ILIKE '%SS15%' THEN 11.00
    WHEN name ILIKE '%Subang Airport%' THEN 18.00
    WHEN name ILIKE '%IOI City%' THEN 15.00
    WHEN name ILIKE '%Mines%' THEN 16.50
    WHEN name ILIKE '%Puchong%' THEN 13.00
    WHEN name ILIKE '%BRT%' THEN 7.00
    
    ELSE 12.00
  END
WHERE estimated_grab_fee IS NULL;