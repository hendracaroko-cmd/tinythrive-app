import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Lock, Star, Droplets, Footprints, Utensils, ArrowRight, Zap, User, LogOut, Scale, Bell, Activity, Coffee, Dumbbell, Flame, Calendar, Target, MapPin, Globe, Award, PlayCircle, Home, UserCircle, Settings, CalendarPlus, RefreshCw, ShieldCheck, Save, FastForward, Share2, Plus, Fingerprint, Clock, CheckSquare } from 'lucide-react';

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

// --- DATABASE KOMPONEN ---
const coreHabitsList = [
  { id: 'h1', text: { id: "Minum Air 2L / Hari", en: "Drink 2L Water / Day" } },
  { id: 'h2', text: { id: "Jalan 8.000 Langkah", en: "Walk 8,000 Steps" } },
  { id: 'h3', text: { id: "Tanpa Gula Tambahan", en: "No Added Sugar" } },
  { id: 'h4', text: { id: "Tidur 7-8 Jam", en: "Sleep 7-8 Hours" } },
  { id: 'h5', text: { id: "Makan Sayur Tiap Hari", en: "Veggies Every Meal" } },
  { id: 'h6', text: { id: "Puasa 12-16 Jam (IF)", en: "Intermittent Fasting" } }
];

const workoutSchedules = {
  pria: [
    { focus: { id: "Peregangan (Rest Day)", en: "Stretching (Rest Day)" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, regangkan lengan ke depan", en: "Pull hips to heels, stretch arms forward"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cobra Stretch", en: "Cobra Stretch"}, desc: {id: "Angkat dada perlahan, jaga pinggul tetap di lantai", en: "Lift chest slowly, keep hips on the floor"}, cal: 15, time: "1 Min" },
      { name: {id: "Knee to Chest", en: "Knee to Chest"}, desc: {id: "Peluk lutut sambil berbaring rileks", en: "Hug knees while lying down relaxed"}, cal: 12, time: "1 Min" }
    ]},
    { focus: { id: "Dada & Tricep", en: "Chest & Triceps" }, exercises: [ 
      { name: {id: "Push-Up Standar", en: "Standard Push-Up"}, desc: {id: "Turunkan badan hingga dada hampir menyentuh lantai", en: "Lower body until chest almost touches the floor"}, cal: 45, time: "3 Set x 12" }, 
      { name: {id: "Tricep Dips", en: "Tricep Dips"}, desc: {id: "Tekuk siku ke belakang menahan berat badan di ujung kursi", en: "Bend elbows back supporting weight on chair edge"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Wide Push-Up", en: "Wide Push-Up"}, desc: {id: "Buka tangan lebih lebar dari bahu", en: "Place hands wider than shoulders"}, cal: 50, time: "3 Set x 10" }
    ]},
    { focus: { id: "Kaki (Lower Body)", en: "Lower Body (Legs)" }, exercises: [ 
      { name: {id: "Squats", en: "Bodyweight Squats"}, desc: {id: "Jongkok seolah duduk di kursi, punggung tegak", en: "Squat like sitting on a chair, back straight"}, cal: 40, time: "3 Set x 15" }, 
      { name: {id: "Lunges", en: "Lunges"}, desc: {id: "Langkah lebar ke depan, tekuk lutut 90 derajat", en: "Wide step forward, bend knees 90 degrees"}, cal: 45, time: "3 Set x 12" },
      { name: {id: "Calf Raises", en: "Calf Raises"}, desc: {id: "Jinjit perlahan ke atas lalu turunkan tumit", en: "Tiptoe slowly upward then lower heels"}, cal: 20, time: "3 Set x 20" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat buka-tutup tangan dan kaki seirama", en: "Jump opening and closing arms and legs"}, cal: 50, time: "1 Min" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tahan tubuh lurus sejajar lantai dengan siku", en: "Hold body straight parallel to floor on elbows"}, cal: 25, time: "45 Sec" },
      { name: {id: "Mountain Climbers", en: "Mountain Climbers"}, desc: {id: "Posisi push-up, tarik lutut ke dada bergantian cepat", en: "Push-up pos, pull knees to chest rapidly"}, cal: 60, time: "45 Sec" }
    ]},
    { focus: { id: "Bahu & Punggung", en: "Shoulder & Back" }, exercises: [ 
      { name: {id: "Pike Push-Up", en: "Pike Push-Up"}, desc: {id: "Tubuh huruf V terbalik, tekuk siku perlahan", en: "Inverted V shape, bend elbows slowly"}, cal: 50, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman Holds"}, desc: {id: "Tengkurap, angkat dada dan paha bersaman dari lantai", en: "Lie on stomach, lift chest and thighs off floor"}, cal: 30, time: "3 Set x 15" },
      { name: {id: "Arm Circles", en: "Arm Circles"}, desc: {id: "Rentangkan tangan lurus, putar membentuk lingkaran kecil", en: "Extend arms straight, rotate in small circles"}, cal: 20, time: "1 Min" }
    ]},
    { focus: { id: "Kaki Eksplosif", en: "Explosive Legs" }, exercises: [ 
      { name: {id: "Squat Jumps", en: "Squat Jumps"}, desc: {id: "Dari posisi jongkok, lompat ke atas sekuat tenaga", en: "From squad position, jump up forcefully"}, cal: 60, time: "3 Set x 12" }, 
      { name: {id: "High Knees", en: "High Knees"}, desc: {id: "Lari di tempat sambil menarik lutut setinggi dada", en: "Run in place pulling knees chest-high"}, cal: 60, time: "30 Sec" },
      { name: {id: "Wall Sit", en: "Wall Sit"}, desc: {id: "Sandar di tembok, tekuk lutut 90 derajat seperti duduk", en: "Lean on wall, bend knees 90 degrees like sitting"}, cal: 40, time: "45 Sec" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees", en: "Burpees"}, desc: {id: "Jongkok, dorong kaki ke belakang, push-up, lalu lompat", en: "Squat, push legs back, push-up, then jump"}, cal: 70, time: "3 Set x 10" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk agak condong, putar bahu sentuh lantai kiri-kanan", en: "Sit leaning back, twist to touch floor left-right"}, cal: 40, time: "3 Set x 20" },
      { name: {id: "Push-Up", en: "Push-Up"}, desc: {id: "Lakukan berulang kali sampai lengan benar-benar lelah", en: "Do repeatedly until arms fail"}, cal: 50, time: "Max Reps" }
    ]}
  ],
  wanita: [
    { focus: { id: "Yoga & Pemulihan", en: "Yoga & Recovery" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, istirahatkan dahi di lantai", en: "Pull hips to heels, rest forehead on floor"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cat-Cow", en: "Cat-Cow Stretch"}, desc: {id: "Lengkungkan punggung ke atas, lalu tekuk ke bawah", en: "Arch back upward, then curve downward"}, cal: 15, time: "3 Set x 10" },
      { name: {id: "Downward Dog", en: "Downward Dog"}, desc: {id: "Tubuh bentuk V terbalik, dorong panggul tinggi", en: "Inverted V shape, push pelvis high"}, cal: 20, time: "1 Min" }
    ]},
    { focus: { id: "Bokong & Paha", en: "Glutes & Thighs" }, exercises: [ 
      { name: {id: "Glute Bridges", en: "Glute Bridges"}, desc: {id: "Berbaring, angkat pinggul ke atas lalu kencangkan bokong", en: "Lie down, lift hips up and squeeze glutes"}, cal: 35, time: "3 Set x 15" }, 
      { name: {id: "Donkey Kicks", en: "Donkey Kicks"}, desc: {id: "Merangkak, tendang satu kaki ke atas belakang", en: "On all fours, kick one leg up and back"}, cal: 40, time: "3 Set x 15" },
      { name: {id: "Fire Hydrants", en: "Fire Hydrants"}, desc: {id: "Merangkak, angkat satu paha ke samping luar", en: "On all fours, lift one thigh to the outside"}, cal: 35, time: "3 Set x 15" }
    ]},
    { focus: { id: "Dada & Lengan", en: "Chest & Arms" }, exercises: [ 
      { name: {id: "Knee Push-Up", en: "Knee Push-Up"}, desc: {id: "Push-up dengan tumpuan pada kedua lutut", en: "Push-up supported by both knees"}, cal: 35, time: "3 Set x 10" }, 
      { name: {id: "Arm Circles", en: "Arm Circles"}, desc: {id: "Rentangkan tangan lurus, putar perlahan", en: "Extend arms straight, rotate slowly"}, cal: 20, time: "1 Min" },
      { name: {id: "Plank Taps", en: "Plank Shoulder Taps"}, desc: {id: "Posisi plank, satu tangan menyentuh bahu seberang", en: "Plank pos, touch opposite shoulder"}, cal: 40, time: "3 Set x 12" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat sambil membuka kaki dan menepuk tangan", en: "Jump opening legs and clapping hands"}, cal: 50, time: "45 Sec" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tubuh lurus ditopang siku, pastikan pinggul tidak turun", en: "Straight body supported by elbows, keep hips up"}, cal: 25, time: "45 Sec" },
      { name: {id: "Bicycle Crunches", en: "Bicycle Crunches"}, desc: {id: "Berbaring, kayuh kaki sambil putar dada bersilang", en: "Lie down, pedal legs while twisting chest"}, cal: 45, time: "3 Set x 15" }
    ]},
    { focus: { id: "Paha Dalam & Bokong", en: "Inner Thighs & Glutes" }, exercises: [ 
      { name: {id: "Sumo Squats", en: "Sumo Squats"}, desc: {id: "Buka kaki sangat lebar, jongkok dalam dengan punggung lurus", en: "Very wide stance, deep squat with straight back"}, cal: 45, time: "3 Set x 15" }, 
      { name: {id: "Reverse Lunges", en: "Reverse Lunges"}, desc: {id: "Langkah satu kaki jauh ke belakang lalu tekuk lutut", en: "Step one leg far back then bend knees"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Side Leg Raises", en: "Side Leg Raises"}, desc: {id: "Berbaring miring, angkat kaki perlahan ke udara", en: "Lie on side, raise leg slowly in the air"}, cal: 30, time: "3 Set x 15" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees (Tanpa Lompat)", en: "Step-out Burpees"}, desc: {id: "Jongkok, kaki ke belakang satu persatu, lalu berdiri", en: "Squat, step back one by one, then stand"}, cal: 55, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman"}, desc: {id: "Tengkurap, angkat kedua tangan dan kaki menjauhi lantai", en: "Lie face down, lift arms and legs off floor"}, cal: 30, time: "3 Set x 12" },
      { name: {id: "High Knees", en: "High Knees"}, desc: {id: "Lari di tempat, angkat lutut ke perut secara bergantian", en: "Run in place, lift knees to stomach alternating"}, cal: 60, time: "30 Sec" }
    ]},
    { focus: { id: "Perut (Core)", en: "Core Focus" }, exercises: [ 
      { name: {id: "Flutter Kicks", en: "Flutter Kicks"}, desc: {id: "Berbaring, kepakkan kaki lurus naik-turun tipis", en: "Lie flat, flutter straight legs up and down slightly"}, cal: 35, time: "30 Sec" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk seimbang, putar bahu sentuh lantai kiri-kanan", en: "Sit balanced, twist shoulders touching floor left-right"}, cal: 40, time: "3 Set x 20" },
      { name: {id: "Leg Raises", en: "Leg Raises"}, desc: {id: "Berbaring, angkat kaki lurus ke atas 90 derajat", en: "Lie down, raise legs straight up 90 degrees"}, cal: 40, time: "3 Set x 12" }
    ]}
  ]
};

const mealDBs = {
  id: {
    sarapan: [ { menu: "Roti Gandum Alpukat & Telur", cal: 320, price: 15000 }, { menu: "Oatmeal Pisang & Kacang", cal: 300, price: 12000 }, { menu: "Smoothie Bowl Buah Naga", cal: 350, price: 18000 }, { menu: "Telur Orak-Arik Tomat", cal: 280, price: 8000 }, { menu: "Pancake Oat Pisang", cal: 350, price: 15000 } ],
    siang: [ { menu: "Nasi Merah & Ikan Bakar", cal: 500, price: 25000 }, { menu: "Gado-Gado & Telur Rebus", cal: 450, price: 20000 }, { menu: "Nasi Merah & Soto Bening Ayam", cal: 480, price: 25000 }, { menu: "Shirataki Goreng Sayur", cal: 400, price: 30000 }, { menu: "Dada Ayam Panggang & Kentang", cal: 520, price: 35000 } ],
    malam: [ { menu: "Salad Sayur & Telur Rebus", cal: 250, price: 15000 }, { menu: "Sapo Tahu Brokoli", cal: 380, price: 28000 }, { menu: "Tumis Dada Ayam Sayur", cal: 420, price: 26000 }, { menu: "Ikan Dori Panggang Teflon", cal: 300, price: 25000 }, { menu: "Capcay Kuah Bakso Sapi", cal: 400, price: 24000 } ],
    snack: [ { menu: "Yoghurt & Buah Naga", cal: 150, price: 12000 }, { menu: "Edamame Rebus", cal: 120, price: 8000 }, { menu: "Pisang Panggang Kayu Manis", cal: 180, price: 6000 }, { menu: "Apel & Kacang Almond", cal: 200, price: 15000 }, { menu: "Mangga Potong Dingin", cal: 150, price: 10000 } ]
  },
  my: { // Malaysia (RM)
    sarapan: [ { menu: "Nasi Lemak Kurang Sambal", cal: 400, price: 5 }, { menu: "Tosai Kosong & Dal", cal: 250, price: 3 }, { menu: "Oatmeal dengan Pisang", cal: 300, price: 6 }, { menu: "Telur Separuh Masak & Roti", cal: 280, price: 4 }, { menu: "Smoothie Buah Tropika", cal: 320, price: 12 } ],
    siang: [ { menu: "Nasi Ayam Kukus", cal: 450, price: 8 }, { menu: "Laksa Utara (Tanpa Santan)", cal: 400, price: 10 }, { menu: "Nasi Campur (Sayur + Ikan)", cal: 480, price: 9 }, { menu: "Mee Sup Ayam", cal: 350, price: 7 }, { menu: "Ayam Tandoori & Salad", cal: 400, price: 15 } ],
    malam: [ { menu: "Ikan Bakar & Air Asam", cal: 300, price: 18 }, { menu: "Sup Sayur & Tahu Rebus", cal: 200, price: 8 }, { menu: "Tom Yam Campur", cal: 320, price: 12 }, { menu: "Sayur Goreng Garlic", cal: 180, price: 7 }, { menu: "Sate Ayam (5 Cucuk)", cal: 350, price: 10 } ],
    snack: [ { menu: "Buah Potong (Tembikai)", cal: 100, price: 2 }, { menu: "Yogurt Biasa", cal: 120, price: 4 }, { menu: "Kacang Kuda Rebus", cal: 150, price: 3 }, { menu: "Epel Hijau", cal: 80, price: 2 }, { menu: "Popia Basah", cal: 180, price: 5 } ]
  }
};

const dict = {
  id: {
    loginTitle: "Selamat Datang Kembali",
    email: "Email",
    password: "Kata Sandi",
    loginBtn: "Mulai Sekarang",
    subtitle: "Langkah Kecil, Dampak Besar",
    welcome: "Hai",
    proBtn: "PRO",
    memberPro: "MEMBER PRO",
    logWeight: "Catat Berat Harian",
    currentWeightPlaceholder: "Saat ini (kg)",
    save: "Simpan",
    yourTarget: "Target Anda",
    dailyMissions: "Misi Harian Anda",
    water: "Minum 2L Air",
    waterDesc: "Ketuk gelas setiap kali minum",
    steps: "Langkah Kaki",
    stepsDesc: "Detektor sensor aktif",
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
    bmiProjection: "Proyeksi BMI & Target",
    bmiWarning: "Lengkapi data profil terlebih dahulu.",
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
    syncCalendar: "Pengingat Harian (Alarm HP)",
    syncCalendarDesc: "Buat jadwal harian otomatis di HP-mu.",
    pushNotify: "Aktifkan Notifikasi Pop-up HP",
    checkoutTitle: "Pilih Metode Pembayaran",
    payNow: "Lanjutkan ke Pembayaran",
    processing: "Memproses...",
    saveProfile: "Simpan Profil",
    todayMenu: "Menu Diet Hari Ini",
    homeWorkout: "Latihan Rumahan",
    breakfast: "Sarapan",
    lunch: "Makan Siang",
    dinner: "Makan Malam",
    snack: "Camilan (Snack)",
    estPrice: "Est Harga:",
    focusDay: "Fokus Hari Ini:",
    langLabel: "Ganti Bahasa",
    locationLabel: "Posisi / Lokasi Anda",
    detecting: "Mendeteksi...",
    predictionTitle: "Prediksi Pencapaian Target 🚀",
    predictionFree: "Jalur Gratis",
    predictionPro: "Jalur PRO",
    daysToTarget: "hari",
    proProgressTitle: "Progres Target Anda 🎯",
    weightLost: "Turun",
    remaining: "Sisa",
    shareTitle: "Bagikan Pencapaian 🚀",
    habitTitle: "Pilih 3 Habit Fondasi"
  },
  en: {
    loginTitle: "Welcome Back",
    email: "Email",
    password: "Password",
    loginBtn: "Get Started",
    subtitle: "Small Steps, Big Impact",
    welcome: "Hi",
    proBtn: "PRO",
    memberPro: "PRO MEMBER",
    logWeight: "Log Daily Weight",
    currentWeightPlaceholder: "Current (kg)",
    save: "Save",
    yourTarget: "Your Target",
    dailyMissions: "Your Daily Missions",
    water: "Drink 2L Water",
    waterDesc: "Tap glass each time you drink",
    steps: "Walk Steps",
    stepsDesc: "Sensor detector active",
    sugar: "No Added Sugar",
    sugarDesc: "Prevent insulin spikes",
    unlockPotential: "Subscription Plans",
    unlockDesc: "Unlock BMI Charts, AI Predictions, and Special Diet Menus.",
    tierWeek: "Weekly Plan",
    tierWeekPrice: "Rp 9,900",
    tierMonth: "Monthly Plan",
    tierMonthPrice: "Rp 29,000",
    tierQuarter: "Quarterly Plan",
    tierQuarterPrice: "Rp 59,000",
    bmiProjection: "BMI Projection & Target",
    bmiWarning: "Please complete your profile first.",
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
    syncCalendar: "Daily Calendar Reminders",
    syncCalendarDesc: "Set daily recurring alarm on your phone.",
    pushNotify: "Enable Push Notifications",
    checkoutTitle: "Choose Payment Method",
    payNow: "Continue to Payment",
    processing: "Processing...",
    saveProfile: "Save Profile",
    todayMenu: "Today's Diet Menu",
    homeWorkout: "Home Workout",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    estPrice: "Est Price:",
    focusDay: "Today's Focus:",
    langLabel: "Change Language",
    locationLabel: "Your Location",
    detecting: "Detecting...",
    predictionTitle: "Target Prediction 🚀",
    predictionFree: "Free Track",
    predictionPro: "PRO Track",
    daysToTarget: "days",
    proProgressTitle: "Your Target Progress 🎯",
    weightLost: "Lost",
    remaining: "Remaining",
    shareTitle: "Share Achievement 🚀",
    habitTitle: "Choose 3 Foundational Habits"
  }
};

const ADMIN_LINK_MINGGUAN = "https://lynk.id/kox/ndxnj682258z";
const ADMIN_LINK_BULANAN = "https://lynk.id/kox/x0d62zj0vnzd";
const ADMIN_LINK_3BULAN = "https://lynk.id/kox/5xe9kr60l4e4";
const ADMIN_LINK_PROMO = "https://lynk.id/kox/ganti_link_promo_9000_disini"; 

export default function App() {
  const [lang, setLang] = useState('id');
  const t = dict[lang] || dict.id;

  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // App States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Premium States
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // User Data
  const [habits, setHabits] = useState({ sugar: false });
  const [waterCount, setWaterCount] = useState(0); 
  const [currentSteps, setCurrentSteps] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [weightHistory, setWeightHistory] = useState([]); 
  const [inputWeight, setInputWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [stepTarget, setStepTarget] = useState(8000); 
  const [height, setHeight] = useState('');
  const [age, setAge] = useState(''); 
  const [activityFactor, setActivityFactor] = useState(1.2); 
  const [genderFocus, setGenderFocus] = useState('pria');
  const [location, setLocation] = useState('id_jkt'); 
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [menuVariant, setMenuVariant] = useState(0);
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentDay = new Date().getDay();

  // Sensors & Toast
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [toastMsg, setToastMsg] = useState(''); 

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const saveToCloud = async (data) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
      await setDoc(docRef, data, { merge: true });
    } catch (e) {
      console.error("Cloud Save Error:", e);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if(!email.includes('@') || password.length < 6) {
      showToast(lang === 'id' ? '⚠️ Email tidak valid atau sandi kurang dari 6 karakter.' : '⚠️ Invalid email or password too short.');
      return;
    }
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast(lang === 'id' ? 'Berhasil Masuk!' : 'Login Successful!');
      setIsLoggedIn(true);
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          showToast(lang === 'id' ? 'Akun Baru Berhasil Dibuat!' : 'New Account Created!');
          setIsLoggedIn(true);
        } catch (regError) { showToast(`Error: ${regError.message}`); }
      } else { showToast(`Error: ${error.message}`); }
    }
    setIsAuthenticating(false);
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast(lang === 'id' ? 'Berhasil Masuk dengan Google! ✅' : 'Google Sign-In Successful! ✅');
      setIsLoggedIn(true);
    } catch (error) {
      showToast(`Google Login Error: ${error.message}`);
    }
    setIsAuthenticating(false);
  };

  const handleLogout = async () => {
    if(auth) {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsOnboardingComplete(false);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!auth) { setIsDataLoaded(true); return; }
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { setIsDataLoaded(true); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        setIsLoggedIn(true);
      }
      if (!u) setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        
        // Auto-Expired Logic
        if (d.isPremium && d.premiumExpiry) {
            if (Date.now() > d.premiumExpiry) {
                saveToCloud({ isPremium: false, premiumExpiry: null });
                setIsPremium(false);
                setPremiumExpiry(null);
                showToast(lang === 'id' ? "⚠️ Masa aktif PRO Anda telah habis." : "⚠️ Your PRO subscription has expired.");
            } else {
                setIsPremium(true);
                setPremiumExpiry(d.premiumExpiry);
            }
        } else { setIsPremium(d.isPremium || false); }

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
        if (d.height) setHeight(d.height);
        if (d.age) setAge(d.age);
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.genderFocus) setGenderFocus(d.genderFocus);
        if (d.location) setLocation(d.location);
        if (d.selectedHabits) setSelectedHabits(d.selectedHabits);
        if (d.lang) setLang(d.lang);
        if (d.isOnboardingComplete !== undefined) setIsOnboardingComplete(d.isOnboardingComplete);
      } else {
        saveToCloud({ streak: 1, isPremium: false, lang: 'id', location: 'id_jkt', habits: { sugar: false }, lastLoginDate: todayDateStr, isOnboardingComplete: false });
      }
      setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleGPSTracking = () => {
    if (isTracking) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setLastLocation(null);
      showToast(lang === 'id' ? '🛑 Pelacakan berhenti.' : '🛑 Tracker stopped.');
    } else {
      if (!navigator.geolocation) {
        showToast(lang === 'id' ? 'Geolokasi tidak didukung.' : 'Geolocation not supported.');
        return;
      }
      showToast(lang === 'id' ? '📍 Mencoba akses GPS (Layar harus tetap aktif)...' : '📍 Accessing GPS (Keep screen active)...');

      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; 
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy > 30) return; // Ignore inaccurate data
          setLastLocation(prevLoc => {
            if (prevLoc) {
              const dist = calculateDistance(prevLoc.lat, prevLoc.lon, latitude, longitude);
              if (dist > 3) {
                const userHeight = height ? parseFloat(height) : 165;
                const stepLen = (userHeight * 0.414) / 100;
                const estimatedSteps = Math.round(dist / stepLen);
                if (estimatedSteps > 0) {
                  setCurrentSteps(prev => {
                    const newSteps = prev + estimatedSteps;
                    saveToCloud({ currentSteps: newSteps });
                    return newSteps;
                  });
                }
              }
            }
            return { lat: latitude, lon: longitude }; 
          });
        },
        (err) => {
          console.error("GPS Error Code:", err.code, "Message:", err.message);
          showToast(lang === 'id' ? `Kesalahan GPS: ${err.message}. Pastikan izin lokasi aktif.` : `GPS Error: ${err.message}. Ensure location permissions.`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 } // Increased timeout
      );
      setWatchId(id);
      setIsTracking(true);
    }
  };

  const handleHabitToggle = (habitId) => {
    setSelectedHabits(prev => {
      if (prev.includes(habitId)) return prev.filter(h => h !== habitId);
      if (prev.length >= 3) {
        showToast(lang === 'id' ? 'Maksimal 3 Habit!' : 'Max 3 Habits!');
        return prev;
      }
      return [...prev, habitId];
    });
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    if(!inputWeight || !targetWeight || !height || !age || selectedHabits.length !== 3) {
      showToast(lang === 'id' ? "⚠️ Mohon lengkapi data & pilih 3 habit." : "⚠️ Please complete data & select 3 habits.");
      return;
    }
    const newRecord = { id: Date.now(), weight: inputWeight, day: todayDateStr };
    const newHistory = [...weightHistory, newRecord];
    setWeightHistory(newHistory);
    saveToCloud({ weightHistory: newHistory, height, targetWeight, age, activityFactor, genderFocus, location, selectedHabits, isOnboardingComplete: true });
    setIsOnboardingComplete(true);
  };

  const handlePayment = () => {
    let url = ADMIN_LINK_BULANAN;
    if (checkoutTier?.id === 'week') url = ADMIN_LINK_MINGGUAN;
    if (checkoutTier?.id === 'quarter') url = ADMIN_LINK_3BULAN;
    if (checkoutTier?.id === 'promo') url = ADMIN_LINK_PROMO;
    window.open(url, '_blank');
    
    setIsProcessingPayment(true);
    setTimeout(() => {
      const durationMap = { week: 7, month: 30, quarter: 90, promo: 30 };
      const durationDays = durationMap[checkoutTier.id] || 30;
      const expiry = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
      setIsProcessingPayment(false); setCheckoutTier(null); setIsPremium(true); setPremiumExpiry(expiry);
      saveToCloud({ isPremium: true, premiumExpiry: expiry });
      showToast(lang === 'id' ? `✅ PRO Aktif selama ${durationDays} hari.` : `✅ PRO Active for ${durationDays} days.`);
    }, 2500);
  };

  // UI Calculations
  const activeMealDB = location === 'my' ? mealDBs.my : mealDBs.id;
  const formatPrice = (price) => location === 'my' ? `RM ${price}` : `Rp ${price.toLocaleString('id-ID')}`;
  const latestWeight = weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : null;
  const initialWeight = weightHistory.length > 0 ? parseFloat(weightHistory[0].weight) : null;
  const targetWeightVal = targetWeight ? parseFloat(targetWeight) : null;
  const bmiValue = (latestWeight && height) ? (latestWeight / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : null;
  
  let kgToLose = 0, freeDays = 0, proDays = 0, showPrediction = false;
  if (latestWeight && targetWeightVal && latestWeight > targetWeightVal) {
      kgToLose = (latestWeight - targetWeightVal).toFixed(1);
      freeDays = Math.ceil(kgToLose / 0.05); proDays = Math.ceil(kgToLose / 0.15);
      showPrediction = true;
  }

  const isPromoActive = streak >= 7;
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    body, * { font-family: 'Outfit', sans-serif !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  if (!isDataLoaded) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Zap className="animate-bounce text-teal-500 w-12 h-12" /></div>;

  // --- COVER MUKA / LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-700 flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          {isScanningFingerprint && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <Fingerprint className="w-24 h-24 text-teal-500 animate-pulse" strokeWidth={1} />
                <p className="mt-6 font-black text-slate-800 text-lg uppercase tracking-widest">{lang === 'id' ? 'Memindai Biometrik...' : 'Scanning Biometrics...'}</p>
             </div>
          )}
          <div className="pt-12 pb-6 px-6 text-center relative">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-teal-100">
              <Zap className="w-10 h-10 text-teal-500 fill-teal-500" />
            </div>
            <h1 className="text-4xl font-black italic text-slate-800 tracking-tighter">TINYTHRIVE</h1>
            <p className="text-teal-600 font-bold text-xs mt-2 uppercase tracking-widest">{t.subtitle}</p>
          </div>
          <div className="px-8 pb-10 bg-white">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" required disabled={isAuthenticating} className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-2xl text-slate-800 focus:border-teal-400 focus:bg-white font-bold outline-none transition-all" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" required disabled={isAuthenticating} className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-2xl text-slate-800 focus:border-teal-400 focus:bg-white font-bold outline-none transition-all" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={isAuthenticating} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-sm shadow-teal-500/20">
                {isAuthenticating ? (lang === 'id' ? 'Memproses...' : 'Processing...') : <>{t.loginBtn} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
            <div className="relative mt-8 mb-6 flex justify-center items-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="bg-white px-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest relative z-10">{lang === 'id' ? 'Atau Masuk Cepat' : 'Or Quick Login'}</span>
            </div>
            <div className="space-y-3">
              <button type="button" onClick={handleGoogleLogin} disabled={isAuthenticating} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl active:scale-95 flex items-center justify-center gap-3 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google Gmail
              </button>
              <button type="button" onClick={() => { setIsScanningFingerprint(true); setTimeout(() => { setIsLoggedIn(true); setIsScanningFingerprint(false); }, 2000); }} disabled={isAuthenticating} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl active:scale-95 flex items-center justify-center gap-3 transition-all shadow-sm">
                <Fingerprint className="w-5 h-5 text-teal-500" /> Biometrik
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- PERSONALISASI PROFIL / ONBOARDING ---
  if (isLoggedIn && !isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-y-auto py-10">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in slide-in-from-bottom-8 relative">
            <button onClick={handleLogout} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
              <LogOut className="w-3 h-3" /> {lang === 'id' ? 'Keluar' : 'Logout'}
            </button>
            <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-teal-100"><Target className="w-8 h-8 text-teal-600" /></div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 italic">{t.onboardTitle}</h2>
                <p className="text-[10px] text-slate-500 tracking-wide uppercase font-bold">{t.onboardDesc}</p>
            </div>
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-200">
                  <button type="button" onClick={() => setGenderFocus('pria')} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition uppercase ${genderFocus === 'pria' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>🧔 {lang === 'id' ? 'PRIA' : 'MALE'}</button>
                  <button type="button" onClick={() => setGenderFocus('wanita')} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition uppercase ${genderFocus === 'wanita' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>👩 {lang === 'id' ? 'WANITA' : 'FEMALE'}</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" required placeholder={t.age} className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-teal-500 text-sm transition" value={age || ''} onChange={e => setAge(e.target.value)} />
                    <input type="number" required placeholder={t.height} className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-teal-500 text-sm transition" value={height || ''} onChange={e => setHeight(e.target.value)} />
                    <input type="number" required step="0.1" placeholder="Berat (kg)" className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-teal-500 text-sm transition" value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                    <input type="number" required step="0.1" placeholder="Target (kg)" className="p-4 bg-teal-50 border border-teal-200 rounded-xl font-bold outline-none focus:border-teal-500 text-sm transition" value={targetWeight || ''} onChange={e => setTargetWeight(e.target.value)} />
                </div>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs appearance-none" value={location} onChange={e => setLocation(e.target.value)}>
                    <option value="id_jkt">🇮🇩 Indonesia - Jakarta</option>
                    <option value="id_jtg">🇮🇩 Indonesia - Jateng/DIY</option>
                    <option value="my">🇲🇾 Malaysia (RM)</option>
                </select>
                <div className="pt-2">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">{t.habitTitle} (Pilih 3)</p>
                  <div className="grid grid-cols-1 gap-2">
                    {coreHabitsList.map(h => (
                      <button type="button" key={h.id} onClick={() => handleHabitToggle(h.id)} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedHabits.includes(h.id) ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedHabits.includes(h.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                          {selectedHabits.includes(h.id) && <Plus className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-bold text-xs">{h.text[lang]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-teal-500 text-white font-black py-4 rounded-xl shadow-lg mt-4 uppercase tracking-widest italic flex items-center justify-center gap-2 active:scale-95 transition-all">
                    {lang === 'id' ? 'Buat Program' : 'Create Program'} <FastForward className="w-4 h-4" />
                </button>
            </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UTAMA ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-24">
      <style>{globalStyles}</style>
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen">
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl z-[300] font-bold shadow-2xl animate-in slide-in-from-top-4 max-w-[90%] text-center text-xs border border-slate-700">{toastMsg}</div>
        )}

        <header className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" /> TINYTHRIVE
            </h1>
            {isPremium ? (
               <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 italic tracking-widest"><Star className="w-3 h-3 fill-yellow-900" /> {t.memberPro}</span>
            ) : (
               <button onClick={() => setActiveTab('pro')} className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white italic">GET PRO</button>
            )}
          </div>
          <div className="mt-5 flex justify-between items-end">
            <div>
              <p className="text-teal-50 text-[10px] font-black tracking-widest uppercase mb-1">{t.welcome}</p>
              <p className="text-white font-bold text-lg leading-none">{user?.displayName || (email ? email.split('@')[0] : 'Athlete')}</p>
            </div>
            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-inner">
              <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black tracking-widest">{streak} {lang === 'id' ? 'HARI' : 'DAYS'}</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* PROGRES TARGET - UNIVERSAL */}
              {latestWeight && targetWeightVal && (
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 tracking-wide uppercase text-xs"><Target className="w-4 h-4 text-teal-500" /> {t.proProgressTitle}</h3>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 shadow-sm transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, (initialWeight - latestWeight) / (initialWeight - targetWeightVal) * 100))}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>{t.weightLost}: {Math.max(0, initialWeight - latestWeight).toFixed(1)}kg</span>
                    <span>{t.remaining}: {Math.max(0, latestWeight - targetWeightVal).toFixed(1)}kg</span>
                  </div>
                </div>
              )}

              {showPrediction && !isPremium && (
                <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-white"><h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-wide"><Clock className="w-4 h-4" /> {t.predictionTitle}</h3></div>
                  <div className="p-4 grid grid-cols-2 divide-x divide-slate-100 text-center">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">{t.predictionFree}</p><p className="text-2xl font-black">{freeDays}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{t.daysToTarget}</p></div>
                    <div><p className="text-[10px] font-black text-teal-600 uppercase">{t.predictionPro}</p><p className="text-2xl font-black text-teal-600">{proDays}</p><p className="text-[10px] font-bold text-teal-400 uppercase">{t.daysToTarget}</p></div>
                  </div>
                </div>
              )}

              {/* KOMITMEN HABIT */}
              {selectedHabits.length > 0 && (
                <div className="bg-teal-50 p-5 rounded-3xl border border-teal-100 space-y-3 shadow-inner">
                  <h3 className="font-black text-teal-800 text-[10px] uppercase tracking-[0.2em]">{lang === 'id' ? 'KOMITMEN HABIT' : 'HABIT COMMITMENTS'}</h3>
                  <div className="space-y-2">
                    {selectedHabits.map(hid => (
                      <div key={hid} className="flex items-center gap-2 text-teal-700"><Plus className="w-3 h-3" /><span className="text-xs font-black italic">{coreHabitsList.find(h => h.id === hid)?.text[lang]}</span></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-500 border border-blue-100"><Droplets className="w-6 h-6" /></div>
                  <div className="flex-1"><p className="font-black text-slate-800 text-sm tracking-wide uppercase">{t.water}</p><p className="text-xs font-bold text-slate-400">{waterCount}/8 {lang === 'id' ? 'Gelas' : 'Glasses'}</p></div>
                  <div className="flex gap-1">{[...Array(8)].map((_, i) => (<div key={i} onClick={() => { setWaterCount(i+1); saveToCloud({waterCount: i+1}); }} className={`w-2.5 h-5 rounded-sm border cursor-pointer transition-all ${i < waterCount ? 'bg-blue-500 border-blue-600' : 'bg-slate-100 border-slate-200'}`} />))}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-6 rounded-3xl shadow-lg space-y-5 text-white relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border relative ${isTracking ? 'bg-white/20 animate-pulse' : 'bg-black/10'}`}><Footprints className="w-6 h-6" /></div>
                    <div><p className="font-black text-white tracking-wide uppercase text-sm">{t.steps}</p><p className="text-[10px] font-black uppercase tracking-widest opacity-80">{isTracking ? 'GPS Aktif' : 'Sensor Mati'}</p></div>
                  </div>
                  <p className="font-black text-4xl italic tracking-tighter">{currentSteps.toLocaleString()}</p>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden relative z-10"><div className="bg-yellow-300 h-full shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={{ width: `${Math.min(100, (currentSteps/stepTarget)*100)}%` }}></div></div>
                <button onClick={toggleGPSTracking} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest italic transition-all flex justify-center items-center gap-2 ${isTracking ? 'bg-rose-500 text-white' : 'bg-white text-teal-600 shadow-xl shadow-teal-700/20'}`}>
                  <MapPin className="w-4 h-4" /> {isTracking ? 'Berhenti' : 'Mulai Jalan (GPS)'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pro' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {!isPremium ? (
                 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden border border-slate-700">
                    {isPromoActive && (
                      <div className="relative z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 p-5 rounded-2xl shadow-lg border border-yellow-200 text-center animate-in zoom-in mb-4">
                        <Flame className="w-8 h-8 mx-auto mb-1 text-red-600 animate-bounce" />
                        <h3 className="font-black uppercase tracking-wide text-sm">{lang === 'id' ? 'Paket Promo Terbuka!' : 'Promo Unlocked!'}</h3>
                        <p className="text-[10px] font-bold mt-1 mb-4">Anda berhak mendapatkan Paket Promo seharga Rp 9.000 saja!</p>
                        <button onClick={() => setCheckoutTier({id:'promo', name: 'Paket Promo Konsisten', price: 'Rp 9.000'})} className="bg-slate-900 text-white font-black py-3 px-6 rounded-xl uppercase tracking-widest text-[10px] w-full shadow-lg">Ambil Promo (Rp 9.000)</button>
                      </div>
                    )}
                    <div className="text-center space-y-3 mb-6 relative z-10">
                      <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-white/20 transform rotate-3"><Lock className="text-white w-8 h-8 transform -rotate-3" /></div>
                      <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t.unlockPotential}</h2>
                      <p className="text-slate-400 text-xs font-bold tracking-wide">{t.unlockDesc}</p>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <button onClick={() => setCheckoutTier({id:'week', name:t.tierWeek, price:t.tierWeekPrice})} className="w-full p-4 bg-white/10 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/20 transition-all"><span>{t.tierWeek}</span><span className="font-black text-yellow-300">{t.tierWeekPrice}</span></button>
                      <button onClick={() => setCheckoutTier({id:'month', name:t.tierMonth, price:t.tierMonthPrice})} className="w-full p-5 bg-white text-slate-900 rounded-xl flex flex-col shadow-xl transform scale-[1.02]">
                        <div className="flex justify-between items-center w-full font-black"><span>{t.tierMonth}</span><span className="text-xl text-teal-600">{t.tierMonthPrice}</span></div>
                        <span className="text-[10px] font-black text-teal-500 mt-1 uppercase tracking-widest">Paling Populer</span>
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                   <div className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                     <div className="flex items-center gap-3"><Activity className="text-teal-500 w-5 h-5" /><div><p className="text-[10px] font-black uppercase text-slate-400">BMI SCORE</p><p className="text-xl font-black text-slate-800 italic">{bmiValue || '--'}</p></div></div>
                     {premiumExpiry && <div className="text-right"><p className="text-[10px] font-black uppercase text-slate-400">MASA AKTIF</p><p className="text-[10px] font-bold text-teal-600 uppercase">{new Date(premiumExpiry).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}</p></div>}
                   </div>
                   {/* DIET MENU */}
                   <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
                     <div className="flex justify-between items-center"><h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wide"><Utensils className="text-orange-500 w-4 h-4" /> {t.todayMenu}</h3><button onClick={() => setMenuVariant(v => v + 1)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition"><RefreshCw className="w-4 h-4 text-slate-500" /></button></div>
                     <div className="space-y-3">
                        {[ {t: t.breakfast, m: activeMealDB.sarapan[(currentDay + menuVariant) % activeMealDB.sarapan.length]}, {t: t.lunch, m: activeMealDB.siang[(currentDay + menuVariant) % activeMealDB.siang.length]}, {t: t.malam, m: activeMealDB.malam[(currentDay + menuVariant) % activeMealDB.malam.length]} ].map((item, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100 shadow-sm">
                            <div className="flex-1 pr-4"><p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-0.5">{item.t}</p><p className="text-xs font-black text-slate-800 leading-snug">{item.m.menu}</p><p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">EST: {formatPrice(item.m.price)}</p></div>
                            <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">{item.m.cal} CAL</span>
                          </div>
                        ))}
                     </div>
                   </div>
                   {/* WORKOUT */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                      <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wide"><Dumbbell className="text-teal-500 w-4 h-4" /> {t.homeWorkout}</h3>
                      <div className="p-4 bg-teal-50 rounded-xl border border-teal-100"><p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t.focusDay}</p><p className="text-lg font-black text-teal-900 italic">{workoutSchedules[genderFocus][currentDay].focus[lang]}</p></div>
                      <div className="space-y-4">
                        {workoutSchedules[genderFocus][currentDay].exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="flex-1 pr-4"><p className="text-xs font-black text-slate-800 uppercase tracking-wide mb-0.5">{ex.name[lang]}</p><p className="text-[10px] font-bold text-slate-500 leading-tight mb-2">{ex.desc[lang]}</p><p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{ex.time} • {ex.cal} CAL</p></div>
                            <button onClick={(e) => handleYouTubeClick(e, ex.name.en + " form tutorial")} className="w-9 h-9 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition active:scale-95 shadow-sm"><PlayCircle className="w-5 h-5 ml-0.5" /></button>
                          </div>
                        ))}
                      </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <button onClick={() => { if(navigator.share) navigator.share({ title: 'TinyThrive', text: `Streak saya ${streak} hari!` }); }} className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest italic active:scale-95 transition-all"><Share2 className="w-5 h-5" /> {t.shareTitle}</button>
               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                 <h2 className="font-black text-sm text-slate-800 flex items-center gap-2 uppercase tracking-widest mb-4"><Settings className="text-slate-400 w-4 h-4" /> {t.settingsTitle}</h2>
                 <div className="space-y-4">
                   <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100"><button onClick={() => {setLang('id'); saveToCloud({lang:'id'});}} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition uppercase ${lang === 'id' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400'}`}>INDONESIA</button><button onClick={() => {setLang('en'); saveToCloud({lang:'en'});}} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition uppercase ${lang === 'en' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400'}`}>ENGLISH</button></div>
                   <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" value={location} onChange={e => {setLocation(e.target.value); saveToCloud({location:e.target.value});}}><option value="id_jkt">🇮🇩 Indonesia</option><option value="my">🇲🇾 Malaysia</option></select>
                   <button onClick={() => { 
                     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=TinyThrive+Workout&dates=${todayDateStr}T170000Z/${todayDateStr}T180000Z&recur=RRULE:FREQ=DAILY`;
                     window.open(url, '_blank');
                   }} className="w-full py-3.5 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 border border-blue-100"><CalendarPlus className="w-4 h-4" /> {t.syncCalendar}</button>
                   <button onClick={handleLogout} className="w-full py-4 text-rose-500 font-black bg-rose-50 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] active:scale-95 transition-all mt-6"><LogOut className="w-4 h-4" /> LOGOUT</button>
                 </div>
               </div>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-all ${activeTab === 'home' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}><Home className="w-5 h-5 mb-1" /><span className="text-[9px] font-black tracking-widest uppercase">{t.tabHome}</span></button>
          <button onClick={() => setActiveTab('pro')} className={`p-4 rounded-full -mt-10 shadow-xl transition-all ${activeTab === 'pro' ? 'bg-teal-500 text-white scale-110 shadow-teal-500/30' : 'bg-slate-900 text-teal-400'}`}><Star className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-all ${activeTab === 'profile' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}><UserCircle className="w-5 h-5 mb-1" /><span className="text-[9px] font-black tracking-widest uppercase">{t.tabProfile}</span></button>
        </nav>

        {checkoutTier && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end justify-center backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-full">
               <div className="flex justify-between items-center"><h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{t.checkoutTitle}</h3><button onClick={() => setCheckoutTier(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Plus className="w-6 h-6 transform rotate-45" /></button></div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-teal-500/20 flex justify-between items-center relative overflow-hidden"><div className="absolute top-0 right-0 p-2 opacity-5"><Award className="w-20 h-20 text-teal-500" /></div><div><p className="text-[10px] font-black text-teal-600 uppercase mb-1">Paket Terpilih</p><p className="text-lg font-black text-slate-800 uppercase">{checkoutTier.name}</p></div><p className="text-xl font-black text-teal-500 italic">{checkoutTier.price}</p></div>
               <button onClick={handlePayment} disabled={isProcessingPayment} className="w-full py-5 bg-teal-500 text-white font-black rounded-xl shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic">{isProcessingPayment ? <RefreshCw className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-6 h-6" />}{isProcessingPayment ? t.processing : t.payNow}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
