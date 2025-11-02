/*
  # Adjust Grab Fees to Match Reference Prices

  1. Reference Points (User-specified)
    - Sunway Geo Avenue: 6 min → RM 18.00
    - Sunway Mentari: 25 min → RM 20.00
  
  2. Calculate Pricing Model
    - Using linear interpolation between these two points
    - For 6 min to 25 min range: slope = (20 - 18) / (25 - 6) = 2/19 ≈ 0.105 RM/min
    - Intercept: 18 = base + (6 × 0.105) → base ≈ 17.37
    
  3. Adjusted Model for Better Fit
    - Base fare component: RM 17.37
    - Additional rate: RM 0.105 per minute
    - Formula: estimated_grab_fee = 17.37 + (commute_time_minutes × 0.105)
    
  4. Verification
    - 6 min: 17.37 + (6 × 0.105) = 18.00 ✓
    - 25 min: 17.37 + (25 × 0.105) = 20.00 ✓
*/

-- Update all grab fees using linear model based on user's reference prices
UPDATE poi_traffic
SET estimated_grab_fee = ROUND(
  17.37 + (commute_time_minutes * 0.105),
  2
);

-- Ensure minimum fare of RM 8.00 for very short trips
UPDATE poi_traffic
SET estimated_grab_fee = 8.00
WHERE estimated_grab_fee < 8.00;