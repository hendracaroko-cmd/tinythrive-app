import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Circle, Lock, Star, TrendingUp, Droplets, Footprints, Utensils, ArrowRight, Zap, User, LogIn, LogOut, Scale, MessageCircle, Bell, Activity, Coffee, Sun, Moon, Dumbbell, Flame, Timer, ChevronLeft, ChevronRight, Calendar, Target, MapPin, Globe, Award, PlayCircle, Home, UserCircle, Settings, CalendarPlus, RefreshCw, CreditCard, ShieldCheck, Save, Sparkles, Smartphone } from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sanitasi appId untuk menghindari pemisahan segmen jalur Firestore jika appId mengandung '/'
const appIdRaw = typeof __app_id !== 'undefined' ? __app_id : 'tinythrive-v1';
const appId = appIdRaw.replace(/\//g, '_');

const dict = {
  id: {
    loginTitle: "Masuk ke Akun",
    email: "Email",
    password: "Kata Sandi",
    loginBtn: "Masuk",
    subtitle: "Mulai gaya hidup sehatmu hari ini.",
    welcome: "Hai",
    proBtn: "PRO",
    memberPro: "MEMBER PRO",
    logWeight: "Catat Berat Harian",
    currentWeightPlaceholder: "Saat ini (kg)",
    save: "Simpan",
    resetSim: "Reset Data",
    weightJourney: "Perjalanan Berat Badanmu",
    yourTarget: "Target Anda",
    timePrediction: "Prediksi Waktu Capai Target",
    freeTrack: "Jalur Gratis",
    freeDesc: "Hanya pelacak kebiasaan dasar",
    proTrack: "Jalur PRO",
    proDesc: "Diet teratur + Olahraga khusus",
    dailyMissions: "Misi Harian Anda",
    water: "Minum 2L Air",
    waterDesc: "Ketuk gelas setiap kali minum",
    steps: "Jalan Langkah",
    stepsDesc: "Bakar kalori ekstra",
    sugar: "Tanpa Gula Tambahan",
    sugarDesc: "Cegah lonjakan insulin",
    unlockPotential: "Pilih Paket Berlangganan",
    unlockDesc: "Buka akses Grafik BMI, Prediksi AI, dan Menu Diet Spesial.",
    tierWeek: "Paket Mingguan",
    tierWeekPrice: "Rp 9.900",
    tierMonth: "Paket Bulanan",
    tierMonthPrice: "Rp 29.000",
    tierQuarter: "Paket 3 Bulan",
    tierQuarterPrice: "Rp 59.000",
    promoTitle: "🎉 PROMO KONSISTEN!",
    promoDesc: "Luar biasa! Kamu konsisten 7 hari beruntun. Kami berikan hadiah spesial:",
    promoPrice: "Hanya Rp 9.000",
    claimPromo: "Klaim Promo Sekarang",
    bmiProjection: "Proyeksi BMI & Target",
    bmiWarning: "Lengkapi data di profil terlebih dahulu.",
    height: "Tinggi Badan (cm)",
    reportCard: "Laporan Hari Ini",
    tabHome: "Beranda",
    tabPro: "Program",
    tabProfile: "Profil",
    settingsTitle: "Pengaturan Profil",
    syncCalendar: "Setel Alarm Kalender",
    syncCalendarDesc: "Buat pengingat otomatis di kalender HP-mu.",
    stepTargetLabel: "Target Langkah",
    syncDevice: "Sinkronisasi Perangkat",
    syncDeviceDesc: "Ambil data dari Google Fit / Apple Health",
    changeMenu: "Ganti Variasi Menu",
    checkoutTitle: "Pilih Metode Pembayaran",
    payNow: "Lanjutkan ke Pembayaran",
    processing: "Memproses...",
    saveProfile: "Simpan Profil",
    savedAlert: "Profil Tersimpan!"
  },
  en: {
    loginTitle: "Sign In",
    email: "Email",
    password: "Password",
    loginBtn: "Sign In",
    subtitle: "Start your healthy life.",
    welcome: "Hi",
    proBtn: "PRO",
    memberPro: "PRO MEMBER",
    logWeight: "Log Weight",
    currentWeightPlaceholder: "Current (kg)",
    save: "Save",
    resetSim: "Reset",
    weightJourney: "Weight Journey",
    yourTarget: "Your Target",
    timePrediction: "Time Prediction",
    freeTrack: "Free",
    freeDesc: "Basic habits",
    proTrack: "PRO",
    proDesc: "Structured plans",
    dailyMissions: "Daily Missions",
    water: "Drink 2L Water",
    waterDesc: "Tap to log",
    steps: "Walk Steps",
    stepsDesc: "Extra calories",
    sugar: "No Sugar",
    sugarDesc: "Insulin health",
    unlockPotential: "Subscription Plans",
    unlockDesc: "Unlock all premium features.",
    tierWeek: "Weekly",
    tierWeekPrice: "Rp 9,900",
    tierMonth: "Monthly",
    tierMonthPrice: "Rp 29,000",
    tierQuarter: "Quarterly",
    tierQuarterPrice: "Rp 59,000",
    promoTitle: "🎉 PROMO!",
    promoDesc: "7-day streak bonus:",
    promoPrice: "Only Rp 9,000",
    claimPromo: "Claim Now",
    bmiProjection: "BMI Projection",
    bmiWarning: "Set height in profile.",
    height: "Height (cm)",
    reportCard: "Today's Report",
    tabHome: "Home",
    tabPro: "Program",
    tabProfile: "Profile",
    settingsTitle: "Settings",
    syncCalendar: "Sync Calendar",
    syncCalendarDesc: "Daily reminders.",
    stepTargetLabel: "Step Target",
    syncDevice: "Sync Device",
    syncDeviceDesc: "Fetch health data",
    changeMenu: "Refresh Menu",
    checkoutTitle: "Checkout",
    payNow: "Pay Now",
    processing: "Processing...",
    saveProfile: "Save Profile",
    savedAlert: "Saved!"
  }
};

// --- LINK PEMBAYARAN ADMIN (LYNK.ID) ---
const ADMIN_LINK_MINGGUAN = "https://lynk.id/kox/ndxnj682258z";
const ADMIN_LINK_BULANAN = "https://lynk.id/kox/x0d62zj0vnzd";
const ADMIN_LINK_3BULAN = "https://lynk.id/kox/5xe9kr60l4e4";
const ADMIN_LINK_PROMO = "https://lynk.id/kox/ylz1deo7e274";

export default function App() {
  const [lang, setLang] = useState('id');
  const t = dict[lang];

  // Auth & Database
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Habits & Data
  const [habits, setHabits] = useState({ sugar: false });
  const [waterCount, setWaterCount] = useState(0); 
  const [currentSteps, setCurrentSteps] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [weightHistory, setWeightHistory] = useState([]); 
  const [inputWeight, setInputWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [stepTarget, setStepTarget] = useState(8000); 
  const [height, setHeight] = useState('');
  const [genderFocus, setGenderFocus] = useState('pria');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Firebase Auth Effect (RULE 3: Auth Before Queries)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { 
        console.error("Auth Error:", e);
        setIsDataLoaded(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data Effect (Guarded by User Auth)
  useEffect(() => {
    if (!user) return;
    
    // Path Mengikuti RULE 1: /artifacts/{appId}/users/{userId}/{collectionName}
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.weightHistory) setWeightHistory(d.weightHistory);
        if (d.isPremium !== undefined) setIsPremium(d.isPremium);
        if (d.streak !== undefined) setStreak(d.streak);
        if (d.waterCount !== undefined) setWaterCount(d.waterCount);
        if (d.currentSteps !== undefined) setCurrentSteps(d.currentSteps);
        if (d.habits) setHabits(d.habits);
        if (d.height) setHeight(d.height);
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.stepTarget) setStepTarget(d.stepTarget);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsDataLoaded(true);
    });
    
    return () => unsubscribe();
  }, [user]);

  const saveToCloud = async (data) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
      await setDoc(docRef, data, { merge: true });
    } catch (e) {
      console.error("Gagal menyimpan ke Cloud:", e);
    }
  };

  const handlePayment = () => {
    let url = ADMIN_LINK_BULANAN;
    if (checkoutTier?.id === 'week') url = ADMIN_LINK_MINGGUAN;
    if (checkoutTier?.id === 'quarter') url = ADMIN_LINK_3BULAN;
    if (checkoutTier?.id === 'promo') url = ADMIN_LINK_PROMO;

    window.open(url, '_blank');
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutTier(null);
      setIsPremium(true);
      saveToCloud({ isPremium: true });
    }, 3000);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!inputWeight) return;
    const newRecord = { id: Date.now(), weight: inputWeight, day: `Hari ${weightHistory.length + 1}` };
    const newHistory = [...weightHistory, newRecord];
    setWeightHistory(newHistory);
    setInputWeight('');
    saveToCloud({ weightHistory: newHistory });
  };

  const updateWater = (val) => {
    setWaterCount(val);
    saveToCloud({ waterCount: val });
  };

  const updateSteps = (val) => {
    setCurrentSteps(val);
    saveToCloud({ currentSteps: val });
  };

  const handleSaveProfile = () => {
    saveToCloud({ height, targetWeight, stepTarget, genderFocus });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  // Rendering States
  if (!isDataLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <Zap className="animate-bounce text-teal-500 w-10 h-10" />
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }} className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-100">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-10 text-center text-white relative">
            <Zap className="w-16 h-16 text-yellow-300 mx-auto mb-4 fill-yellow-300" />
            <h1 className="text-4xl font-black mb-1">TinyThrive</h1>
            <p className="text-teal-50 text-sm font-medium">{t.subtitle}</p>
          </div>
          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
              <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200">
                {t.loginBtn}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supported By</p>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-50 border px-3 py-1.5 rounded-full">
                  <Smartphone className="w-3 h-3" /> Apple Health
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-50 border px-3 py-1.5 rounded-full">
                  <Smartphone className="w-3 h-3" /> Google Fit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }} className="min-h-screen bg-gray-50 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl relative pb-24 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" /> TinyThrive
            </h1>
            {isPremium ? (
               <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                 <Star className="w-3 h-3 fill-yellow-900" /> {t.memberPro}
               </span>
            ) : (
               <button onClick={() => setActiveTab('pro')} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md transition">GET PRO</button>
            )}
          </div>
          <div className="mt-4 flex justify-between items-end">
            <p className="text-teal-50 text-sm font-medium">{t.welcome}, <span className="text-white font-bold">{email.split('@')[0] || 'User'}</span></p>
            <div className="bg-black/20 px-3 py-1 rounded-full flex items-center gap-1 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-bold">{streak} Days</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Weight Log */}
              <div className="bg-teal-50 p-5 rounded-3xl border border-teal-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-teal-600" /> {t.logWeight}
                </h2>
                <form onSubmit={handleAddWeight} className="flex gap-2">
                  <input type="number" step="0.1" className="flex-1 px-4 py-3 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-teal-400 outline-none" placeholder={t.currentWeightPlaceholder} value={inputWeight} onChange={e => setInputWeight(e.target.value)} />
                  <button type="submit" className="bg-teal-600 text-white font-bold px-6 rounded-2xl hover:bg-teal-700 transition">{t.save}</button>
                </form>
              </div>

              {/* Missions */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-xl">{t.dailyMissions}</h3>
                
                {/* Water */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{t.water}</p>
                      <p className="text-xs text-gray-500">{waterCount}/8 Gelas</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => updateWater(i+1)} 
                        className={`w-3 h-6 rounded-full border border-blue-200 transition-all cursor-pointer ${i < waterCount ? 'bg-blue-500' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <Footprints className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{t.steps}</p>
                        <p className="text-xs text-gray-500">{t.stepsDesc}</p>
                      </div>
                    </div>
                    <p className="font-black text-xl text-teal-600">{currentSteps.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full transition-all" style={{ width: `${Math.min(100, (currentSteps/stepTarget)*100)}%` }}></div>
                  </div>
                  <button onClick={() => updateSteps(currentSteps + 1200)} className="w-full py-2 bg-gray-50 text-[10px] font-bold text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center gap-2">
                    <RefreshCw className="w-3 h-3" /> {t.syncDevice}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pro' && (
            <div className="animate-in fade-in duration-500">
               {!isPremium ? (
                 <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-10 -right-10 opacity-10"><Zap className="w-40 h-40" /></div>
                    <div className="text-center space-y-2">
                      <Lock className="mx-auto text-yellow-400 w-8 h-8" />
                      <h2 className="text-2xl font-black">{t.unlockPotential}</h2>
                      <p className="text-gray-400 text-sm">{t.unlockDesc}</p>
                    </div>
                    <div className="space-y-3">
                      <button onClick={() => setCheckoutTier({id:'week', name:t.tierWeek, price:t.tierWeekPrice})} className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/20 transition">
                        <span className="font-bold">{t.tierWeek}</span>
                        <span className="font-black text-teal-400">{t.tierWeekPrice}</span>
                      </button>
                      <button onClick={() => setCheckoutTier({id:'month', name:t.tierMonth, price:t.tierMonthPrice})} className="w-full p-5 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl flex justify-between items-center shadow-xl transform scale-105">
                        <span className="font-black">POPULER: {t.tierMonth}</span>
                        <span className="font-black">{t.tierMonthPrice}</span>
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="p-10 text-center space-y-4">
                   <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                     <Star className="w-10 h-10 fill-yellow-600" />
                   </div>
                   <h2 className="text-2xl font-black text-gray-800">You Are Pro!</h2>
                   <p className="text-gray-500">Nikmati menu diet harian dan program olahraga khusus.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                 <h2 className="font-black text-xl flex items-center gap-2">
                   <Settings className="text-gray-400 w-6 h-6" /> {t.settingsTitle}
                 </h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.height}</label>
                      <input type="number" className="w-full p-3 bg-gray-50 rounded-2xl outline-none" value={height} onChange={e => setHeight(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.yourTarget}</label>
                      <input type="number" className="w-full p-3 bg-gray-50 rounded-2xl outline-none" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} />
                    </div>
                 </div>
                 <button onClick={handleSaveProfile} className="w-full py-4 bg-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                   <Save className="w-4 h-4" /> {t.saveProfile}
                 </button>
               </div>
               <button onClick={() => setIsLoggedIn(false)} className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition">
                 Logout
               </button>
            </div>
          )}
        </main>

        {/* Footer Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center z-50">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-all ${activeTab === 'home' ? 'text-teal-600 scale-110' : 'text-gray-400'}`}>
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-teal-100' : ''}`} />
            <span className="text-[10px] font-black mt-1">HOME</span>
          </button>
          <button onClick={() => setActiveTab('pro')} className={`p-4 rounded-full -mt-12 shadow-xl transition-all ${activeTab === 'pro' ? 'bg-teal-500 text-white rotate-12' : 'bg-gray-800 text-yellow-400'}`}>
            <Star className={`w-6 h-6 ${activeTab === 'pro' ? 'fill-white' : ''}`} />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-all ${activeTab === 'profile' ? 'text-teal-600 scale-110' : 'text-gray-400'}`}>
            <UserCircle className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-teal-100' : ''}`} />
            <span className="text-[10px] font-black mt-1">ME</span>
          </button>
        </nav>

        {/* Checkout Modal */}
        {checkoutTier && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center p-0 transition-all">
            <div className="w-full max-w-md bg-white rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-300">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-gray-800">{t.checkoutTitle}</h3>
                 <button onClick={() => setCheckoutTier(null)} className="text-2xl text-gray-400 leading-none">&times;</button>
               </div>
               <div className="p-6 bg-teal-50 rounded-3xl border border-teal-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Selected Plan</p>
                    <p className="text-lg font-black text-gray-800">{checkoutTier.name}</p>
                  </div>
                  <p className="text-2xl font-black text-teal-600">{checkoutTier.price}</p>
               </div>
               <button onClick={handlePayment} disabled={isProcessingPayment} className="w-full py-5 bg-teal-600 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-teal-200 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                 {isProcessingPayment ? <RefreshCw className="animate-spin w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                 {isProcessingPayment ? t.processing : t.payNow}
               </button>
            </div>
          </div>
        )}

        {/* Toast Message */}
        {showSavedMsg && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-2xl z-[200] animate-in fade-in zoom-in duration-300 shadow-2xl">
            {t.savedAlert}
          </div>
        )}

      </div>
    </div>
  );
}
