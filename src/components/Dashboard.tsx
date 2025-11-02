import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserCircle2, School, ArrowUpDown, Car, ParkingSquare, BookOpen, Utensils, CalendarDays, Phone, Clock, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { VoiceAssistant } from './VoiceAssistant';
import { useState, useEffect } from 'react';
import { predictNextHour, Prediction } from '../services/predictionService';
import taylorsLogo from '../assets/taylors-logo-01.jpg';
import monashLogo from '../assets/monash-logo-v2 copy copy.png';
import sunwayLogo from '../assets/Sunway_logo.jpg';

const universityLogos: Record<string, string> = {
  'TAYLOR': taylorsLogo,
  'TAYLORS': taylorsLogo,
  'MONASH': monashLogo,
  'SUNWAY': sunwayLogo,
  'DEMO': taylorsLogo,
};

interface Alert {
  message: string;
  severity: 'high' | 'medium' | 'low';
  icon: 'traffic' | 'lift' | 'parking' | 'general';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [universityCode, setUniversityCode] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [aiPrediction, setAiPrediction] = useState<Prediction | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  useEffect(() => {
    fetchUserUniversity();
    loadAIPrediction();

    const timer = setInterval(() => {
      const now = getCurrentTime();
      setCurrentTime(now);
      updateAlert(now);
    }, 1000);

    const predictionTimer = setInterval(() => {
      loadAIPrediction();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(predictionTimer);
    };
  }, []);

  const getCurrentTime = (): Date => {
    const timeOverride = localStorage.getItem('timeOverride');
    const dateOverride = localStorage.getItem('dateOverride');

    let now = new Date();

    if (dateOverride) {
      now = new Date(dateOverride);
    }

    if (timeOverride) {
      const [hours, minutes] = timeOverride.split(':').map(Number);
      now.setHours(hours, minutes, 0, 0);
    }

    return now;
  };

  const loadAIPrediction = async () => {
    setIsLoadingPrediction(true);
    try {
      const prediction = await predictNextHour();
      setAiPrediction(prediction);
    } catch (error) {
      console.error('Failed to load AI prediction:', error);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const fetchUserUniversity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('university_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.university_id) {
      const { data: university } = await supabase
        .from('universities')
        .select('code')
        .eq('id', profile.university_id)
        .maybeSingle();

      if (university) {
        setUniversityCode(university.code);
      }
    }
  };

  const updateAlert = (now: Date) => {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();

    const isWeekday = day >= 1 && day <= 5;

    if (isWeekday && hour >= 7 && hour < 9) {
      setCurrentAlert({
        message: 'Heavy traffic expected to Sunway Pyramid in 30 mins',
        severity: 'high',
        icon: 'traffic'
      });
    } else if (isWeekday && hour >= 12 && hour < 14) {
      setCurrentAlert({
        message: 'Peak lunch hour - Long canteen queues expected',
        severity: 'medium',
        icon: 'general'
      });
    } else if (isWeekday && hour >= 17 && hour < 19) {
      setCurrentAlert({
        message: 'Evening rush - Severe traffic to KLCC & Mid Valley',
        severity: 'high',
        icon: 'traffic'
      });
    } else if (isWeekday && ((hour === 8 && minute >= 45) || (hour === 9 && minute < 15))) {
      setCurrentAlert({
        message: 'Lift congestion at main buildings - Expect 5+ min wait',
        severity: 'high',
        icon: 'lift'
      });
    } else if (isWeekday && hour >= 9 && hour < 17) {
      setCurrentAlert({
        message: 'Limited parking in Zone A - Try Zone B or C',
        severity: 'medium',
        icon: 'parking'
      });
    } else if (!isWeekday) {
      setCurrentAlert({
        message: 'Weekend - Most facilities operating at reduced hours',
        severity: 'low',
        icon: 'general'
      });
    } else {
      setCurrentAlert({
        message: 'All systems operating normally',
        severity: 'low',
        icon: 'general'
      });
    }
  };

  const getAlertColor = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-50 border-green-300 text-green-800';
    }
  };

  const getAlertIcon = (icon: string) => {
    switch(icon) {
      case 'traffic':
        return <Car size={18} />;
      case 'lift':
        return <ArrowUpDown size={18} />;
      case 'parking':
        return <ParkingSquare size={18} />;
      default:
        return <Zap size={18} />;
    }
  };

  const universityLogo = universityCode ? universityLogos[universityCode] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {universityLogo && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${universityLogo})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
          }}
        />
      )}
      <nav className="bg-white shadow-lg border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AURA - SmartU
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                <Clock className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-slate-800">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <button
                onClick={() => navigate('/account')}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
                title="My Account"
              >
                <UserCircle2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="space-y-8">
          {aiPrediction && (
            <div className={`rounded-xl border-2 p-4 ${getAlertColor(aiPrediction.severity)} shadow-lg animate-fade-in relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                        AI Prediction - Next Hour
                      </span>
                      {!isLoadingPrediction && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 font-medium">
                          {Math.round(aiPrediction.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-base leading-tight">{aiPrediction.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {aiPrediction.severity === 'high' ? <AlertTriangle size={24} /> : getAlertIcon(aiPrediction.icon)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoadingPrediction && !aiPrediction && (
            <div className="rounded-xl border-2 p-4 bg-slate-50 border-slate-200 shadow-md animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          )}

          {currentAlert && (
            <div className={`rounded-xl border-2 p-4 ${getAlertColor(currentAlert.severity)} shadow-md animate-fade-in`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {currentAlert.severity === 'high' ? <AlertTriangle size={24} /> : getAlertIcon(currentAlert.icon)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{currentAlert.message}</p>
                </div>
                <div className="text-xs font-medium opacity-75">
                  {currentAlert.severity.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Campus Overview</h2>
            <p className="text-slate-600">Quick access to campus facilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/classrooms')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 transition-all">
                  <School className="text-blue-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Smart Classroom Finder</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/lift-tracker')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-green-100 rounded-2xl flex items-center justify-center group-hover:from-teal-200 group-hover:to-green-200 transition-all">
                  <ArrowUpDown className="text-teal-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Lift Recommender</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/traffic-status')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 transition-all">
                  <Car className="text-blue-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Traffic Status</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/parking')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                  <ParkingSquare className="text-blue-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Parking</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/library-seats')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                  <BookOpen className="text-amber-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Library Seats</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/canteen-seats')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-all">
                  <Utensils className="text-rose-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Canteen Seats</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/unit-arrangement')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-blue-200 transition-all">
                  <CalendarDays className="text-indigo-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Adaptive Study Planner</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/emergency-contacts')}
              className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center group-hover:from-red-200 group-hover:to-rose-200 transition-all">
                  <Phone className="text-red-600" size={48} />
                </div>
                <span className="text-xl font-bold text-slate-800">Emergency Contacts</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <VoiceAssistant onCommand={(cmd) => {
        if (cmd === 'classroom') navigate('/classrooms');
      }} />
    </div>
  );
}
