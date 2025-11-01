import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface UserProfile {
  university_id: string;
}

interface University {
  id: string;
  latitude: number;
  longitude: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!googleMapsApiKey) {
      return new Response(
        JSON.stringify({
          error: 'Google Maps API key not configured',
          message: 'Please add GOOGLE_MAPS_API_KEY to Supabase Edge Function secrets in your Supabase Dashboard > Project Settings > Edge Functions > Secrets'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('university_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.university_id) {
      return new Response(
        JSON.stringify({ error: 'User profile or university not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: university } = await supabase
      .from('universities')
      .select('id, latitude, longitude')
      .eq('id', profile.university_id)
      .maybeSingle();

    if (!university?.latitude || !university?.longitude) {
      return new Response(
        JSON.stringify({ error: 'University coordinates not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: pois, error: poisError } = await supabase
      .from('pois')
      .select('id, name, latitude, longitude');

    if (poisError) throw poisError;

    const updates = [];
    const errors = [];

    for (const poi of pois as POI[]) {
      if (!poi.latitude || !poi.longitude) {
        errors.push({ poi: poi.name, error: 'POI coordinates missing' });
        continue;
      }

      const origin = `${university.latitude},${university.longitude}`;
      const destination = `${poi.latitude},${poi.longitude}`;

      try {
        const mapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          origin
        )}&destinations=${encodeURIComponent(
          destination
        )}&departure_time=now&mode=driving&traffic_model=best_guess&key=${googleMapsApiKey}`;

        const mapsResponse = await fetch(mapsUrl);
        const mapsData = await mapsResponse.json();

        if (mapsData.status !== 'OK') {
          errors.push({ poi: poi.name, error: `Google Maps API error: ${mapsData.status}`, detail: mapsData.error_message });
          continue;
        }

        if (mapsData.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = mapsData.rows[0].elements[0];
          const durationInTraffic = element.duration_in_traffic || element.duration;
          const normalDuration = element.duration;
          const minutes = Math.ceil(durationInTraffic.value / 60);

          let trafficLevel = 'low';
          if (element.duration_in_traffic) {
            const durationRatio = durationInTraffic.value / normalDuration.value;
            if (durationRatio >= 2.0) {
              trafficLevel = 'severe';
            } else if (durationRatio >= 1.4) {
              trafficLevel = 'heavy';
            } else if (durationRatio >= 1.15) {
              trafficLevel = 'moderate';
            }
          }

          updates.push({
            poi_id: poi.id,
            commute_time_minutes: minutes,
            traffic_level: trafficLevel,
            last_updated: new Date().toISOString(),
          });
        } else {
          errors.push({ poi: poi.name, error: `Route status: ${mapsData.rows?.[0]?.elements?.[0]?.status}` });
        }
      } catch (error) {
        errors.push({ poi: poi.name, error: error.message });
        console.error(`Error fetching traffic for POI ${poi.name}:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (updates.length > 0) {
      await supabase.from('poi_traffic').delete().neq('poi_id', '00000000-0000-0000-0000-000000000000');

      const { error: insertError } = await supabase
        .from('poi_traffic')
        .insert(updates);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        total_pois: (pois as POI[]).length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});