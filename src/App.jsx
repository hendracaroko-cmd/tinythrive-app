import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Lock, Star, Droplets, Footprints, Utensils, ArrowRight, Zap, User, LogOut, Scale, Bell, Activity, Coffee, Dumbbell, Flame, Calendar, Target, MapPin, Globe, Award, PlayCircle, Home, UserCircle, Settings, CalendarPlus, RefreshCw, ShieldCheck, Save, FastForward, Share2, Plus, Fingerprint, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAUN_VpSy-u_FvwCfJ1X2Pz5CgiUYQqLjw",
  authDomain: "tinythrive-fe8b9.firebaseapp.com",
  projectId: "tinythrive-fe8b9",
  storageBucket: "tinythrive-fe8b9.firebasestorage.app",
  messagingSenderId: "1021116393610",
  appId: "1:1021116393610:web:604e2fe9c14d2c6cbc2573"
};
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const appIdRaw = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'tinythrive-v1';
const appId = appIdRaw.replace(/\//g, '_');

// --- DATABASE KONTEN OLAHRAGA (Sama seperti sebelumnya) ---
const workoutSchedules = {
  pria: [
    { focus: { id: "Peregangan (Rest Day)", en: "Stretching (Rest Day)" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, regangkan lengan ke depan", en: "Pull hips to heels, stretch arms forward"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cobra Stretch", en: "Cobra Stretch"}, desc: {id: "Angkat dada perlahan, jaga pinggul tetap di lantai", en: "Lift chest slowly, keep hips on the floor"}, cal: 15, time: "1 Min" }
    ]},
    { focus: { id: "Dada & Tricep", en: "Chest & Triceps" }, exercises: [ 
      { name: {id: "Push-Up Standar", en: "Standard Push-Up"}, desc: {id: "Turunkan badan hingga dada hampir menyentuh lantai", en: "Lower body until chest almost touches the floor"}, cal: 45, time: "3 Set x 12" }, 
      { name: {id: "Tricep Dips", en: "Tricep Dips"}, desc: {id: "Tekuk siku ke belakang menahan berat badan di ujung kursi", en: "Bend elbows back supporting weight on chair edge"}, cal: 40, time: "3 Set x 12" }
    ]},
    { focus: { id: "Kaki (Lower Body)", en: "Lower Body (Legs)" }, exercises: [ 
      { name: {id: "Squats", en: "Bodyweight Squats"}, desc: {id: "Jongkok seolah duduk di kursi, punggung tegak", en: "Squat like sitting on a chair, back straight"}, cal: 40, time: "3 Set x 15" }, 
      { name: {id: "Lunges", en: "Lunges"}, desc: {id: "Langkah lebar ke depan, tekuk lutut 90 derajat", en: "Wide step forward, bend knees 90 degrees"}, cal: 45, time: "3 Set x 12" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat buka-tutup tangan dan kaki seirama", en: "Jump opening and closing arms and legs"}, cal: 50, time: "1 Min" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tahan tubuh lurus sejajar lantai dengan siku", en: "Hold body straight parallel to floor on elbows"}, cal: 25, time: "45 Sec" }
    ]},
    { focus: { id: "Bahu & Punggung", en: "Shoulder & Back" }, exercises: [ 
      { name: {id: "Pike Push-Up", en: "Pike Push-Up"}, desc: {id: "Tubuh huruf V terbalik, tekuk siku perlahan", en: "Inverted V shape, bend elbows slowly"}, cal: 50, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman Holds"}, desc: {id: "Tengkurap, angkat dada dan paha bersaman dari lantai", en: "Lie on stomach, lift chest and thighs off floor"}, cal: 30, time: "3 Set x 15" }
    ]},
    { focus: { id: "Kaki Eksplosif", en: "Explosive Legs" }, exercises: [ 
      { name: {id: "Squat Jumps", en: "Squat Jumps"}, desc: {id: "Dari posisi jongkok, lompat ke atas sekuat tenaga", en: "From squat position, jump up forcefully"}, cal: 60, time: "3 Set x 12" }, 
      { name: {id: "High Knees", en: "High Knees"}, desc: {id: "Lari di tempat sambil menarik lutut setinggi dada", en: "Run in place pulling knees chest-high"}, cal: 60, time: "30 Sec" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees", en: "Burpees"}, desc: {id: "Jongkok, dorong kaki ke belakang, push-up, lalu lompat", en: "Squat, push legs back, push-up, then jump"}, cal: 70, time: "3 Set x 10" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk agak condong, putar bahu sentuh lantai kiri-kanan", en: "Sit leaning back, twist to touch floor left-right"}, cal: 40, time: "3 Set x 20" }
    ]}
  ],
  wanita: [
    { focus: { id: "Yoga & Pemulihan", en: "Yoga & Recovery" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, istirahatkan dahi di lantai", en: "Pull hips to heels, rest forehead on floor"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cat-Cow", en: "Cat-Cow Stretch"}, desc: {id: "Lengkungkan punggung ke atas, lalu tekuk ke bawah", en: "Arch back upward, then curve downward"}, cal: 15, time: "3 Set x 10" }
    ]},
    { focus: { id: "Bokong & Paha", en: "Glutes & Thighs" }, exercises: [ 
      { name: {id: "Glute Bridges", en: "Glute Bridges"}, desc: {id: "Berbaring, angkat pinggul ke atas lalu kencangkan bokong", en: "Lie down, lift hips up and squeeze glutes"}, cal: 35, time: "3 Set x 15" }, 
      { name: {id: "Donkey Kicks", en: "Donkey Kicks"}, desc: {id: "Merangkak, tendang satu kaki ke atas belakang", en: "On all fours, kick one leg up and back"}, cal: 40, time: "3 Set x 15" }
    ]},
    { focus: { id: "Dada & Lengan", en: "Chest & Arms" }, exercises: [ 
      { name: {id: "Knee Push-Up", en: "Knee Push-Up"}, desc: {id: "Push-up dengan tumpuan pada kedua lutut", en: "Push-up supported by both knees"}, cal: 35, time: "3 Set x 10" }, 
      { name: {id: "Arm Circles", en: "Arm Circles"}, desc: {id: "Rentangkan tangan lurus, putar perlahan", en: "Extend arms straight, rotate slowly"}, cal: 20, time: "1 Min" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat sambil membuka kaki dan menepuk tangan", en: "Jump opening legs and clapping hands"}, cal: 50, time: "45 Sec" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tubuh lurus ditopang siku, pastikan pinggul tidak turun", en: "Straight body supported by elbows, keep hips up"}, cal: 25, time: "45 Sec" }
    ]},
    { focus: { id: "Paha Dalam & Bokong", en: "Inner Thighs & Glutes" }, exercises: [ 
      { name: {id: "Sumo Squats", en: "Sumo Squats"}, desc: {id: "Buka kaki sangat lebar, jongkok dalam dengan punggung lurus", en: "Very wide stance, deep squat with straight back"}, cal: 45, time: "3 Set x 15" }, 
      { name: {id: "Reverse Lunges", en: "Reverse Lunges"}, desc: {id: "Langkah satu kaki jauh ke belakang lalu tekuk lutut", en: "Step one leg far back then bend knees"}, cal: 40, time: "3 Set x 12" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees (Tanpa Lompat)", en: "Step-out Burpees"}, desc: {id: "Jongkok, kaki ke belakang satu persatu, lalu berdiri", en: "Squat, step back one by one, then stand"}, cal: 55, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman"}, desc: {id: "Tengkurap, angkat kedua tangan dan kaki menjauhi lantai", en: "Lie face down, lift arms and legs off floor"}, cal: 30, time: "3 Set x 12" }
    ]},
    { focus: { id: "Perut (Core)", en: "Core Focus" }, exercises: [ 
      { name: {id: "Flutter Kicks", en: "Flutter Kicks"}, desc: {id: "Berbaring, kepakkan kaki lurus naik-turun tipis", en: "Lie flat, flutter straight legs up and down slightly"}, cal: 35, time: "30 Sec" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk seimbang, putar bahu sentuh lantai kiri-kanan", en: "Sit balanced, twist shoulders touching floor left-right"}, cal: 40, time: "3 Set x 20" }
    ]}
  ]
};

const mealDB_id = {
  sarapan: [ { menu: "Roti Gandum Alpukat & Telur", cal: 320, price: 15000 }, { menu: "Oatmeal Pisang & Kacang", cal: 300, price: 12000 } ],
  siang: [ { menu: "Nasi Merah & Ikan Bakar", cal: 500, price: 25000 }, { menu: "Gado-Gado & Telur Rebus", cal: 450, price: 20000 } ],
  malam: [ { menu: "Salad Sayur & Telur Rebus", cal: 250, price: 15000 }, { menu: "Sapo Tahu Brokoli", cal: 380, price: 28000 } ],
  snack: [ { menu: "Yoghurt & Buah Naga", cal: 150, price: 12000 }, { menu: "Edamame Rebus", cal: 120, price: 8000 } ]
};

const dict = {
  id: {
    loginTitle: "Selamat Datang",
    email: "Email (Pastikan Aktif)",
    password: "Kata Sandi (Min. 6 Karakter)",
    loginBtn: "Masuk / Daftar",
    subtitle: "Langkah Kecil, Dampak Besar",
    welcome: "Hai",
    proBtn: "PRO",
    memberPro: "MEMBER PRO",
    logWeight: "Catat Berat Harian",
    currentWeightPlaceholder: "Saat ini (kg)",
    save: "Simpan",
    yourTarget: "Target Anda",
    predictionTitle: "Prediksi Pencapaian Target 🚀",
    freeTrack: "Jalur Gratis",
    proTrack: "Jalur PRO",
    daysToTarget: "hari",
    dailyMissions: "Misi Harian Anda",
    water: "Minum 2L Air",
    waterDesc: "Ketuk gelas setiap kali minum",
    steps: "Langkah Kaki Aktif",
    stepsDesc: "Aktifkan pelacak saat berjalan",
    sugar: "Tanpa Gula Tambahan",
    sugarDesc: "Kurangi minuman manis & boba",
    unlockPotential: "Pilih Paket Berlangganan",
    unlockDesc: "Buka akses Grafik BMI, Prediksi AI, dan Menu Diet Spesial.",
    tierWeek: "Paket Mingguan",
    tierWeekPrice: "Rp 9.900",
    tierMonth: "Paket Bulanan",
    tierMonthPrice: "Rp 29.000",
    tierQuarter: "Paket 3 Bulan",
    tierQuarterPrice: "Rp 59.000",
    bmiProjection: "Proyeksi BMI & Target",
    height: "Tinggi Badan (cm)",
    age: "Umur (Tahun)",
    activityLevel: "Tingkat Aktivitas",
    activity1: "Jarang Olahraga (Banyak Duduk)",
    activity2: "Aktif Ringan (1-3 hari/minggu)",
    activity3: "Sangat Aktif (Setiap Hari)",
    onboardTitle: "Personalisasi Profil AI 🤖",
    onboardDesc: "Bantu kami menghitung metabolisme (TDEE) Anda untuk target yang lebih akurat.",
    tabHome: "Beranda",
    tabPro: "Program",
    tabProfile: "Profil",
    settingsTitle: "Pengaturan Profil",
    checkoutTitle: "Pilih Metode Pembayaran",
    payNow: "Bayar Sekarang",
    waitingPayment: "Menunggu Pembayaran...",
    verifyBtn: "Saya Sudah Transfer",
    verifyingText: "Memverifikasi di sistem...",
    pendingAdmin: "Menunggu Konfirmasi Admin...",
    todayMenu: "Menu Diet Hari Ini",
    homeWorkout: "Latihan Rumahan",
    shareTitle: "Bagikan Pencapaian 🚀"
  },
  en: {
    loginTitle: "Welcome",
    email: "Email (Must be active)",
    password: "Password (Min. 6 Chars)",
    loginBtn: "Sign In / Register",
    subtitle: "Small Steps, Big Impact",
    welcome: "Hi",
    proBtn: "PRO",
    memberPro: "PRO MEMBER",
    logWeight: "Log Daily Weight",
    currentWeightPlaceholder: "Current (kg)",
    save: "Save",
    yourTarget: "Your Target",
    predictionTitle: "Target Prediction 🚀",
    freeTrack: "Free Track",
    proTrack: "PRO Track",
    daysToTarget: "days",
    dailyMissions: "Your Daily Missions",
    water: "Drink 2L Water",
    waterDesc: "Tap glass each time you drink",
    steps: "Active Steps",
    stepsDesc: "Activate tracker while walking",
    sugar: "No Added Sugar",
    sugarDesc: "Avoid sweet drinks & boba",
    unlockPotential: "Subscription Plans",
    unlockDesc: "Unlock BMI Charts, AI Predictions, and Special Diet Menus.",
    tierWeek: "Weekly Plan",
    tierWeekPrice: "Rp 9,900",
    tierMonth: "Monthly Plan",
    tierMonthPrice: "Rp 29,000",
    tierQuarter: "Quarterly Plan",
    tierQuarterPrice: "Rp 59,000",
    bmiProjection: "BMI Projection & Target",
    height: "Height (cm)",
    age: "Age (Years)",
    activityLevel: "Activity Level",
    activity1: "Sedentary (Desk Job)",
    activity2: "Lightly Active (1-3 days/week)",
    activity3: "Very Active (Every Day)",
    onboardTitle: "AI Profile Personalization 🤖",
    onboardDesc: "Help us calculate your metabolism (TDEE) for a highly accurate target.",
    tabHome: "Home",
    tabPro: "Program",
    tabProfile: "Profile",
    settingsTitle: "Profile Settings",
    checkoutTitle: "Choose Payment Method",
    payNow: "Pay Now",
    waitingPayment: "Waiting for Payment...",
    verifyBtn: "I Have Paid",
    verifyingText: "Verifying in system...",
    pendingAdmin: "Waiting for Admin Approval...",
    todayMenu: "Today's Diet Menu",
    homeWorkout: "Home Workout",
    shareTitle: "Share Achievement 🚀"
  }
};

const ADMIN_LINK_MINGGUAN = "https://lynk.id/kox/ndxnj682258z";
const ADMIN_LINK_BULANAN = "https://lynk.id/kox/x0d62zj0vnzd";
const ADMIN_LINK_3BULAN = "https://lynk.id/kox/5xe9kr60l4e4";

export default function App() {
  const [lang, setLang] = useState('id');
  const t = dict[lang] || dict.id;

  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // App States
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Premium States
  const [isPremium, setIsPremium] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, waiting, pending_admin

  // User Data
  const [habits, setHabits] = useState({ sugar: false });
  const [waterCount, setWaterCount] = useState(0); 
  const [currentSteps, setCurrentSteps] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [weightHistory, setWeightHistory] = useState([]); 
  const [inputWeight, setInputWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState(''); 
  const [activityFactor, setActivityFactor] = useState(1.2); 
  const [genderFocus, setGenderFocus] = useState('pria');
  const [location, setLocation] = useState('id'); 
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentDay = new Date().getDay();

  // Sensors & Toast
  const [isTracking, setIsTracking] = useState(false);
  const [toastMsg, setToastMsg] = useState(''); 
  const wakeLockRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastLocRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // --- 1. FIREBASE AUTHENTICATION (REAL LOGIN/REGISTER) ---
  useEffect(() => {
    if (!auth) { setIsDataLoaded(true); return; }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if(!email.includes('@') || password.length < 6) {
      showToast(lang === 'id' ? '⚠️ Email tidak valid atau sandi kurang dari 6 karakter.' : '⚠️ Invalid email or password too short.');
      return;
    }
    setIsAuthenticating(true);
    
    try {
      // Coba Login dulu
      await signInWithEmailAndPassword(auth, email, password);
      showToast(lang === 'id' ? 'Berhasil Masuk!' : 'Login Successful!');
    } catch (error) {
      // Jika user tidak ditemukan, otomatis daftarkan (Register)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          showToast(lang === 'id' ? 'Akun Baru Berhasil Dibuat!' : 'New Account Created!');
        } catch (regError) {
          showToast(`Error: ${regError.message}`);
        }
      } else {
        showToast(`Error: ${error.message}`);
      }
    }
    setIsAuthenticating(false);
  };

  // --- 2. BIOMETRIC WEBAUTHN SUNGGUHAN ---
  const handleNativeBiometric = async () => {
    if (!window.PublicKeyCredential) {
      showToast(lang === 'id' ? '⚠️ Browser/HP Anda tidak mendukung biometrik WebAuthn.' : '⚠️ WebAuthn Biometrics not supported on this device/browser.');
      return;
    }
    
    setIsScanningFingerprint(true);
    try {
      // Memanggil pop-up Biometrik OS (FaceID/Fingerprint)
      // Catatan: Ini adalah implementasi standar yang memicu dialog asli HP.
      const publicKeyCredentialRequestOptions = {
          challenge: Uint8Array.from("tinythrive-secure-login", c => c.charCodeAt(0)),
          timeout: 60000,
          userVerification: "required"
      };

      const credential = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
      
      if (credential) {
         showToast(lang === 'id' ? 'Biometrik Terverifikasi! ✅' : 'Biometrics Verified! ✅');
         // Di sistem nyata tanpa backend, kita hanya memastikan mereka sukses biometrik.
         // Tapi Firebase butuh token. Jika mereka tidak punya sesi Firebase aktif, kita tidak bisa login otomatis.
         // Asumsi: Fitur ini digunakan jika Firebase session sudah ada secara lokal.
         if(user) {
             // Sesi ada, lanjutkan
         } else {
             showToast(lang === 'id' ? 'Sesi habis. Silakan login email 1x terlebih dahulu.' : 'Session expired. Login with email first.');
         }
      }
    } catch (err) {
      console.error(err);
      showToast(lang === 'id' ? 'Verifikasi Biometrik Dibatalkan/Gagal.' : 'Biometric Verification Failed/Cancelled.');
    }
    setIsScanningFingerprint(false);
  };

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        setUser(null);
        setIsOnboardingComplete(false);
    }
  };

  // --- LOAD FIRESTORE DATA ---
  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.lastLoginDate && d.lastLoginDate !== todayDateStr) {
          const resetData = { lastLoginDate: todayDateStr, waterCount: 0, currentSteps: 0, habits: { sugar: false }, streak: d.streak ? d.streak + 1 : 1 };
          saveToCloud(resetData);
          setWaterCount(0); setCurrentSteps(0); setHabits({ sugar: false }); setStreak(resetData.streak);
        } else {
          if (d.waterCount !== undefined) setWaterCount(d.waterCount);
          if (d.currentSteps !== undefined) setCurrentSteps(d.currentSteps);
          if (d.habits) setHabits(d.habits);
          if (d.streak !== undefined) setStreak(d.streak);
        }
        if (d.weightHistory) setWeightHistory(d.weightHistory);
        if (d.isPremium !== undefined) setIsPremium(d.isPremium);
        if (d.paymentStatus) setPaymentStatus(d.paymentStatus);
        if (d.height) setHeight(d.height);
        if (d.age) setAge(d.age);
        if (d.activityFactor) setActivityFactor(d.activityFactor);
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.genderFocus) setGenderFocus(d.genderFocus);
        if (d.location) setLocation(d.location);
        if (d.lang) setLang(d.lang);
        if (d.isOnboardingComplete !== undefined) setIsOnboardingComplete(d.isOnboardingComplete);
        if (!d.lastLoginDate) saveToCloud({ lastLoginDate: todayDateStr });
      } else {
        saveToCloud({ streak: 1, isPremium: false, paymentStatus: 'idle', lang: 'id', location: 'id', habits: { sugar: false }, lastLoginDate: todayDateStr, isOnboardingComplete: false });
      }
      setIsDataLoaded(true);
    }, (err) => { setIsDataLoaded(true); });
    return () => unsubscribe();
  }, [user]);

  const saveToCloud = async (data) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
      await setDoc(docRef, data, { merge: true });
    } catch (e) {}
  };

  // --- 3. GPS SUNGGUHAN & WAKELOCK (ANTI MATI LAYAR) ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius bumi dalam meter
    const rad = Math.PI / 180;
    const a = 0.5 - Math.cos((lat2 - lat1) * rad)/2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * (1 - Math.cos((lon2 - lon1) * rad))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const toggleRealGPS = async () => {
    if (isTracking) {
      // STOP TRACKING
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().then(() => { wakeLockRef.current = null; });
      }
      setIsTracking(false);
      lastLocRef.current = null;
      showToast(lang === 'id' ? '🛑 Pelacak berhenti.' : '🛑 Tracker stopped.');
    } else {
      // START TRACKING
      if (!navigator.geolocation) {
        showToast(lang === 'id' ? 'Geolokasi tidak didukung HP Anda.' : 'Geolocation not supported.');
        return;
      }

      // Minta WakeLock agar layar HP tidak mati otomatis
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn("WakeLock failed:", err);
      }

      showToast(lang === 'id' ? '📍 GPS Aktif. Layar HP Anda akan tetap menyala selama berjalan.' : '📍 GPS Active. Screen will stay awake.');
      
      const userHeight = height ? parseFloat(height) : 165;
      const stepLengthMeters = (userHeight * 0.414) / 100; // Formula ilmiah panjang langkah

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Abaikan jika GPS lompat karena sinyal buruk (akurasi jelek)
          if(accuracy > 20) return; 

          if (lastLocRef.current) {
            const distMeters = calculateDistance(lastLocRef.current.lat, lastLocRef.current.lon, latitude, longitude);
            
            // Hanya rekam jika bergerak lebih dari 2 meter (mencegah noise GPS)
            if (distMeters > 2 && distMeters < 50) { 
              const estimatedSteps = Math.round(distMeters / stepLengthMeters);
              if (estimatedSteps > 0) {
                setCurrentSteps(prev => {
                  const newSteps = prev + estimatedSteps;
                  // Simpan setiap kelipatan tertentu agar tidak spam database
                  if(newSteps % 10 === 0) saveToCloud({ currentSteps: newSteps });
                  return newSteps;
                });
              }
            }
          }
          lastLocRef.current = { lat: latitude, lon: longitude };
        },
        (err) => {
          showToast(`GPS Error: ${err.message}`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
      
      setIsTracking(true);
    }
  };

  // Bersihkan GPS saat aplikasi ditutup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
      if (wakeLockRef.current !== null) wakeLockRef.current.release();
    };
  }, []);


  // --- 4. VERIFIKASI PEMBAYARAN MANUAL ADMIN ---
  const initiatePayment = () => {
    let url = ADMIN_LINK_BULANAN;
    if (checkoutTier?.id === 'week') url = ADMIN_LINK_MINGGUAN;
    if (checkoutTier?.id === 'quarter') url = ADMIN_LINK_3BULAN;
    window.open(url, '_blank');
    setPaymentStatus('waiting'); 
  };

  const submitProofForAdmin = () => {
    setPaymentStatus('pending_admin');
    saveToCloud({ paymentStatus: 'pending_admin', selectedTier: checkoutTier?.id });
    showToast(lang === 'id' ? 'Data terkirim! Admin akan memverifikasi dalam 1x24 jam.' : 'Sent! Admin will verify within 24 hours.');
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    if(!inputWeight || !targetWeight || !height || !age) return;
    const newRecord = { id: Date.now(), weight: inputWeight, day: todayDateStr };
    const newHistory = [...weightHistory, newRecord];
    setWeightHistory(newHistory);
    
    let bmr = (10 * parseFloat(inputWeight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
    bmr += (genderFocus === 'pria') ? 5 : -161;
    const tdeeTarget = Math.round((bmr * parseFloat(activityFactor)) - 500);

    saveToCloud({ weightHistory: newHistory, height, targetWeight, age, activityFactor, genderFocus, isOnboardingComplete: true, tdeeTarget });
    setIsOnboardingComplete(true);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!inputWeight) return;
    const newRecord = { id: Date.now(), weight: inputWeight, day: todayDateStr };
    const newHistory = [...weightHistory, newRecord];
    setWeightHistory(newHistory);
    setInputWeight('');
    saveToCloud({ weightHistory: newHistory });
  };


  const activeMealDB = mealDB_id; // Disederhanakan untuk contoh
  
  const latestWeightValue = weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : null;
  const initialWeightValue = weightHistory.length > 0 ? parseFloat(weightHistory[0].weight) : null;
  const targetWeightValue = targetWeight ? parseFloat(targetWeight) : null;
  
  let kgToLose = 0; let freeDays = 0; let proDays = 0; let showPrediction = false;
  if (latestWeightValue && targetWeightValue && latestWeightValue > targetWeightValue) {
      kgToLose = (latestWeightValue - targetWeightValue).toFixed(1);
      freeDays = Math.ceil(kgToLose / 0.05); 
      proDays = Math.ceil(kgToLose / 0.15);
      showPrediction = true;
  }

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    body, * { font-family: 'Outfit', sans-serif !important; }
  `;

  if (!isDataLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Zap className="animate-bounce text-teal-500 w-12 h-12" /></div>;
  }

  // --- LAYAR LOGIN (Autentikasi Nyata) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-teal-50">
          
          {isScanningFingerprint && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
                <Fingerprint className="w-24 h-24 text-teal-500 animate-pulse" />
                <p className="mt-6 font-black text-slate-800 text-lg uppercase">{lang === 'id' ? 'Otorisasi OS...' : 'OS Auth...'}</p>
             </div>
          )}

          <div className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-teal-50 to-white relative">
            <h1 className="text-4xl font-black italic text-slate-800">TINYTHRIVE</h1>
            <p className="text-teal-600 font-bold text-xs mt-2 uppercase">{t.subtitle}</p>
          </div>
          
          <div className="px-8 pb-12 bg-white">
            {/* Form Pendaftaran & Login Aktual */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
                <p className="text-[10px] text-blue-700 font-bold leading-tight">
                  {lang === 'id' ? 'Masukkan email & sandi. Jika email belum terdaftar, sistem akan otomatis membuatkan akun baru untuk Anda secara instan.' : 'Enter email & pass. If email not found, system will automatically register you.'}
                </p>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input type="email" required className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-xl text-slate-800 focus:border-teal-400 font-bold" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} disabled={isAuthenticating} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input type="password" required className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-xl text-slate-800 focus:border-teal-400 font-bold" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} disabled={isAuthenticating} />
              </div>
              <button type="submit" disabled={isAuthenticating} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-xl active:scale-95 transition-all flex justify-center gap-2 mt-4 uppercase">
                {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : t.loginBtn}
              </button>
            </form>

            <div className="relative mt-6 mb-4 flex justify-center text-[10px]"><span className="bg-white px-2 text-slate-400 uppercase">Atau</span></div>

            <button type="button" onClick={handleNativeBiometric} disabled={isAuthenticating} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl active:scale-95 flex items-center justify-center gap-3">
              <Fingerprint className="w-5 h-5 text-teal-500" /> Login Biometrik Bawaan HP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && !isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-2 italic text-center">{t.onboardTitle}</h2>
            <form onSubmit={handleCompleteOnboarding} className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" required placeholder={t.age} className="p-4 bg-slate-50 rounded-xl font-bold" value={age || ''} onChange={e => setAge(e.target.value)} />
                    <input type="number" required placeholder={t.height} className="p-4 bg-slate-50 rounded-xl font-bold" value={height || ''} onChange={e => setHeight(e.target.value)} />
                    <input type="number" required step="0.1" placeholder="Berat Skrg (kg)" className="p-4 bg-slate-50 rounded-xl font-bold" value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                    <input type="number" required step="0.1" placeholder="Target (kg)" className="p-4 bg-teal-50 border border-teal-200 rounded-xl font-bold" value={targetWeight || ''} onChange={e => setTargetWeight(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-teal-500 text-white font-black py-4 rounded-xl uppercase">Simpan & Mulai</button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-24">
      <style>{globalStyles}</style>
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen">
        
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl z-[300] font-bold shadow-xl">{toastMsg}</div>
        )}

        <header className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-b-[2rem] shadow-md sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black italic">TINYTHRIVE</h1>
            {isPremium ? (
               <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-900" /> PRO</span>
            ) : (
               <button onClick={() => setActiveTab('pro')} className="bg-white/20 px-3 py-1.5 rounded-lg text-[10px] font-black text-white">GET PRO</button>
            )}
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black text-slate-800 mb-4 uppercase flex items-center gap-2"><Scale className="w-5 h-5 text-teal-500"/> {t.logWeight}</h2>
                <form onSubmit={handleAddWeight} className="flex gap-2">
                  <input type="number" step="0.1" className="flex-1 px-4 py-3 rounded-xl bg-slate-50 font-bold" placeholder={t.currentWeightPlaceholder} value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                  <button type="submit" className="bg-slate-900 text-white font-black px-6 rounded-xl uppercase text-xs">{t.save}</button>
                </form>
              </div>

              {/* Misi Harian */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-xl italic uppercase">{t.dailyMissions}</h3>
                
                {/* Gula */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Coffee className={`w-8 h-8 ${habits.sugar ? 'text-rose-500' : 'text-slate-400'}`} />
                      <div><p className="font-black">{t.sugar}</p><p className="text-xs text-slate-400">{t.sugarDesc}</p></div>
                    </div>
                    <button onClick={() => { setHabits({sugar: !habits.sugar}); saveToCloud({habits: {sugar: !habits.sugar}}); }} className={`w-14 h-8 rounded-full p-1 transition-colors ${habits.sugar ? 'bg-rose-500' : 'bg-slate-200'}`}>
                      <div className={`bg-white w-6 h-6 rounded-full transform transition-transform ${habits.sugar ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  {habits.sugar && <p className="text-[10px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">{t.sugarEdu}</p>}
                </div>

                {/* GPS Pedometer Aktual */}
                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-6 rounded-3xl text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Footprints className="w-6 h-6" />
                      <div>
                        <p className="font-black">{t.steps}</p>
                        <p className="text-[10px] text-teal-100 uppercase">{isTracking ? 'GPS & Layar Aktif (Real-time)' : 'Sensor Mati'}</p>
                      </div>
                    </div>
                    <p className="font-black text-3xl italic">{currentSteps.toLocaleString()}</p>
                  </div>
                  <button onClick={toggleRealGPS} className={`w-full mt-4 py-3 font-black rounded-xl uppercase text-[10px] flex justify-center gap-2 ${isTracking ? 'bg-rose-500 text-white' : 'bg-white text-teal-600'}`}>
                    <MapPin className="w-4 h-4"/> {isTracking ? 'Berhenti Melacak' : 'Mulai Jalan (Berdasarkan GPS Asli)'}
                  </button>
                  <p className="text-[9px] text-teal-100 mt-2 text-center opacity-80">Catatan: Web browser mematikan GPS jika aplikasi di-minimize. Layar akan otomatis terjaga selama Anda menekan tombol "Mulai Jalan".</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pro' && (
            <div className="space-y-6">
               {!isPremium ? (
                 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white space-y-6">
                    <div className="text-center">
                        <Lock className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                        <h2 className="text-xl font-black uppercase">Berlangganan PRO</h2>
                        <p className="text-xs text-slate-400 mt-2">Buka menu diet, olahraga, dan prediksi AI. Sistem butuh verifikasi manual setelah transfer.</p>
                    </div>
                    
                    {/* Logika Status Pembayaran */}
                    {paymentStatus === 'idle' && (
                      <div className="space-y-3">
                        <button onClick={() => setCheckoutTier({id:'month', name:t.tierMonth, price:t.tierMonthPrice})} className="w-full p-4 bg-white text-slate-900 rounded-xl flex justify-between font-black">
                          <span>{t.tierMonth}</span><span className="text-teal-600">{t.tierMonthPrice}</span>
                        </button>
                      </div>
                    )}

                    {paymentStatus === 'pending_admin' && (
                      <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-xl text-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="font-bold text-yellow-400 uppercase text-sm">Menunggu Verifikasi Admin</p>
                        <p className="text-[10px] text-yellow-200 mt-1">Sistem sedang menunggu Admin mencocokkan mutasi bank Anda dengan akun email ini.</p>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-black text-slate-800 uppercase flex gap-2"><Utensils className="text-orange-500 w-4 h-4"/> Menu Diet (PRO)</h3>
                     <p className="text-xs text-slate-500 mt-2">Anda kini memiliki akses ke database menu.</p>
                   </div>
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-black text-slate-800 uppercase flex gap-2"><Dumbbell className="text-teal-500 w-4 h-4"/> Olahraga (PRO)</h3>
                     <p className="text-xs text-slate-500 mt-2">Repetisi dan kalori otomatis disesuaikan dengan BMI Anda.</p>
                   </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <button onClick={handleLogout} className="w-full py-4 bg-rose-50 text-rose-500 font-black rounded-xl uppercase text-xs">
                Logout Email ({email})
              </button>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t p-4 flex justify-around">
          <button onClick={() => setActiveTab('home')} className={`font-black text-[10px] uppercase ${activeTab === 'home' ? 'text-teal-600' : 'text-slate-400'}`}><Home className="w-6 h-6 mx-auto mb-1"/> Beranda</button>
          <button onClick={() => setActiveTab('pro')} className={`font-black text-[10px] uppercase ${activeTab === 'pro' ? 'text-teal-600' : 'text-slate-400'}`}><Star className="w-6 h-6 mx-auto mb-1"/> Program</button>
          <button onClick={() => setActiveTab('profile')} className={`font-black text-[10px] uppercase ${activeTab === 'profile' ? 'text-teal-600' : 'text-slate-400'}`}><UserCircle className="w-6 h-6 mx-auto mb-1"/> Profil</button>
        </nav>

        {/* Modal Pembayaran */}
        {checkoutTier && paymentStatus === 'waiting' && (
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
              <h3 className="font-black text-xl">Langkah Terakhir</h3>
              <p className="text-xs">Silakan transfer {checkoutTier.price} ke rekening yang muncul di layar Lynk.id Anda sebelumnya.</p>
              <button onClick={submitProofForAdmin} className="w-full py-3 bg-teal-600 text-white font-black rounded-xl mt-4">Kirim Bukti Pembayaran ke Admin</button>
              <button onClick={() => {setCheckoutTier(null); setPaymentStatus('idle');}} className="w-full py-2 text-slate-400 font-bold text-xs">Batal</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
