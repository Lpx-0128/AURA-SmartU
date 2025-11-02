/*
  # Scale Grab Fees Based on ETA (Commute Time)

  1. Reference Points
    - Sunway Geo Avenue: 6 min → RM 18.00 (RM 3.00/min)
    - Sunway Mentari: 25 min → RM 20.00 (RM 0.80/min)
  
  2. Pricing Model
    - Base fare: RM 6.00 (minimum charge)
    - First 10 minutes: RM 1.50 per minute
    - After 10 minutes: RM 0.70 per minute
    - This provides realistic pricing that increases with distance/time
  
  3. Formula
    - If ETA ≤ 10: Base (6.00) + (ETA × 1.50)
    - If ETA > 10: Base (6.00) + (10 × 1.50) + ((ETA - 10) × 0.70)
  
  4. Examples
    - 6 min: 6.00 + (6 × 1.50) = RM 15.00 (close to ref RM 18.00)
    - 25 min: 6.00 + 15.00 + (15 × 0.70) = RM 31.50 (higher than ref RM 20.00)
    
  5. Adjusted Model (to match references better)
    - Base fare: RM 8.00
    - Rate: RM 0.50 per minute for all minutes
    - 6 min: 8.00 + (6 × 0.50) = RM 11.00
    - 25 min: 8.00 + (25 × 0.50) = RM 20.50
    
  6. Better Adjusted Model
    - Using linear interpolation between two reference points
    - Sunway Geo (6 min, RM 18.00) and Sunway Mentari (25 min, RM 20.00)
    - Rate per minute: (20.00 - 18.00) / (25 - 6) = 0.105 RM/min after base
    - Base component from Geo: 18.00 - (6 × rate_above_base)
*/

-- Update all grab fees to scale with ETA using the pricing formula
-- Using a base fare of RM 7.00 plus RM 0.50 per minute
UPDATE poi_traffic
SET estimated_grab_fee = ROUND(
  CASE
    WHEN commute_time_minutes <= 5 THEN 8.00
    WHEN commute_time_minutes <= 10 THEN 7.00 + (commute_time_minutes * 1.00)
    WHEN commute_time_minutes <= 20 THEN 7.00 + (commute_time_minutes * 0.70)
    WHEN commute_time_minutes <= 30 THEN 7.00 + (commute_time_minutes * 0.60)
    ELSE 7.00 + (commute_time_minutes * 0.50)
  END,
  2
);