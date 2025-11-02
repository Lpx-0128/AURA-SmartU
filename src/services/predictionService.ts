import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface PredictionData {
  currentHour: number;
  currentDay: number;
  nextHour: number;
  trafficData: any[];
  liftData: any[];
  parkingData: any[];
  libraryData: any[];
  canteenData: any[];
}

export interface Prediction {
  message: string;
  severity: 'high' | 'medium' | 'low';
  icon: 'traffic' | 'lift' | 'parking' | 'general';
  confidence: number;
}

async function fetchHistoricalData(): Promise<PredictionData> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  const nextHour = (currentHour + 1) % 24;

  const [trafficResult, liftResult, parkingResult, libraryResult, canteenResult] = await Promise.all([
    supabase.from('poi_traffic').select('*').limit(10),
    supabase.from('lifts').select('*').limit(20),
    supabase.from('parking_lots').select('*'),
    supabase.from('library_seats').select('*'),
    supabase.from('food_stalls').select('*')
  ]);

  return {
    currentHour,
    currentDay,
    nextHour,
    trafficData: trafficResult.data || [],
    liftData: liftResult.data || [],
    parkingData: parkingResult.data || [],
    libraryData: libraryResult.data || [],
    canteenData: canteenResult.data || []
  };
}

function buildPrompt(data: PredictionData): string {
  const isWeekday = data.currentDay >= 1 && data.currentDay <= 5;
  const dayType = isWeekday ? 'weekday' : 'weekend';

  const avgParkingOccupancy = data.parkingData.length > 0
    ? data.parkingData.reduce((sum, lot) => sum + ((lot.total_spaces - lot.available_spaces) / lot.total_spaces * 100), 0) / data.parkingData.length
    : 0;

  const avgLibraryOccupancy = data.libraryData.length > 0
    ? data.libraryData.reduce((sum, seat) => sum + ((seat.total_seats - seat.available_seats) / seat.total_seats * 100), 0) / data.libraryData.length
    : 0;

  const avgCanteenOccupancy = data.canteenData.length > 0
    ? data.canteenData.reduce((sum, stall) => sum + ((stall.total_seats - stall.available_seats) / stall.total_seats * 100), 0) / data.canteenData.length
    : 0;

  const avgLiftWaitTime = data.liftData.length > 0
    ? data.liftData.reduce((sum, lift) => sum + lift.estimated_wait_time, 0) / data.liftData.length
    : 0;

  const avgTrafficLevel = data.trafficData.length > 0
    ? data.trafficData.map(t => t.traffic_level).join(', ')
    : 'unknown';

  return `You are a campus activity predictor for a Malaysian university. Analyze current campus data and predict what will happen in the NEXT HOUR.

Current Context:
- Current time: ${data.currentHour}:00 (${dayType})
- Next hour to predict: ${data.nextHour}:00
- Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][data.currentDay]}

Current Campus Status:
- Parking occupancy: ${avgParkingOccupancy.toFixed(1)}%
- Library occupancy: ${avgLibraryOccupancy.toFixed(1)}%
- Canteen occupancy: ${avgCanteenOccupancy.toFixed(1)}%
- Average lift wait time: ${avgLiftWaitTime.toFixed(0)} minutes
- Traffic levels to destinations: ${avgTrafficLevel}

Predict what will happen at ${data.nextHour}:00 (one hour from now). Consider:
1. Malaysian university patterns (classes typically 9am-5pm on weekdays)
2. Peak hours: 8-9am (arrival), 12-2pm (lunch), 5-6pm (departure)
3. Weekend vs weekday differences
4. Current trends showing acceleration or deceleration

Respond in EXACTLY this JSON format (no markdown):
{
  "message": "Brief specific prediction about what will happen at ${data.nextHour}:00",
  "severity": "high|medium|low",
  "icon": "traffic|lift|parking|general",
  "confidence": 0.0-1.0
}

Rules:
- Be specific about the NEXT hour (${data.nextHour}:00), not current conditions
- If conditions will improve, use "low" severity
- If conditions will worsen significantly, use "high" severity
- Message should be under 80 characters
- Focus on the most impactful prediction`;
}

export async function predictNextHour(): Promise<Prediction> {
  try {
    const data = await fetchHistoricalData();
    const prompt = buildPrompt(data);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst specializing in campus activity prediction. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const responseText = completion.choices[0].message.content?.trim() || '{}';
    const prediction = JSON.parse(responseText);

    return {
      message: prediction.message || 'Unable to generate prediction',
      severity: prediction.severity || 'low',
      icon: prediction.icon || 'general',
      confidence: prediction.confidence || 0.5
    };
  } catch (error) {
    console.error('Prediction error:', error);

    return {
      message: 'AI prediction temporarily unavailable',
      severity: 'low',
      icon: 'general',
      confidence: 0
    };
  }
}
