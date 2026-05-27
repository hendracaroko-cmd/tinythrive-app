import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Lock, Star, Droplets, Footprints, Utensils, Zap, User, 
  LogOut, Scale, Bell, Activity, Coffee, Dumbbell, Flame, Calendar, 
  Target, MapPin, Globe, Award, PlayCircle, Home, UserCircle, 
  Settings, CalendarPlus, RefreshCw, ShieldCheck, Save, FastForward, 
  Share2, Plus, Fingerprint, CheckCircle, Circle, Mail, KeyRound, Lightbulb,
  Map, Navigation, X, Compass, Bot, ArrowRight, ChevronRight,
  Timer, ShoppingCart, ListChecks, Check
} from 'lucide-react';

// LOGO CUSTOM: "Double Spark" (Petir Ganda yang jauh lebih modern dari FitHub)
const EnergyLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 2L6 16H15L12 30L26 14H17L19 2Z" fill="currentColor" />
    <path d="M23 4L10 18H19L16 32L30 16H21L23 4Z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// --- FIREBASE INITIALIZATION ---
const firebaseConfigStr = typeof window !== 'undefined' && window.__firebase_config ? window.__firebase_config : null;
const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const appIdRaw = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'tinythrive-v2';
const appId = appIdRaw.replace(/\//g, '_');

// --- LINK PEMBAYARAN MIDTRANS (SANDBOX / TESTING MODE) ---
const MIDTRANS_LINK_PROMO    = "https://app.sandbox.midtrans.com/payment-links/c20246e4-52e9-464d-b5f9-ce728bef05e2"; 
const MIDTRANS_LINK_MINGGUAN = "https://app.sandbox.midtrans.com/payment-links/ff7411b7-722f-4241-aee0-8c8c28a04add";
const MIDTRANS_LINK_BULANAN  = "https://app.sandbox.midtrans.com/payment-links/4ed12f5d-96f0-44d0-b24e-8221bde3f12c";
const MIDTRANS_LINK_3BULAN   = "https://app.sandbox.midtrans.com/payment-links/01f9e417-30c0-4a2d-8838-46d85df9e9db";

// --- STRATEGI HARGA MULTI-NEGARA ---
const getPrices = (loc) => {
  const p = {
    id: { w: 'Rp 24.900', m: 'Rp 49.000', q: 'Rp 99.000', promo: 'Rp 29.000' },
    my: { w: 'RM 8.90', m: 'RM 14.90', q: 'RM 29.90', promo: 'RM 9.90' },
    sg: { w: 'S$ 3.90', m: 'S$ 5.90', q: 'S$ 12.90', promo: 'S$ 3.90' },
    th: { w: '฿ 59', m: '฿ 99', q: '฿ 199', promo: '฿ 59' },
    ph: { w: '₱ 89', m: '₱ 149', q: '₱ 299', promo: '₱ 89' },
    vn: { w: '₫ 39.000', m: '₫ 69.000', q: '₫ 149.000', promo: '₫ 49.000' }
  };
  return p[loc] || p['id'];
};

const locNameMap = { id: 'Indonesia', my: 'Malaysia', sg: 'Singapura', th: 'Thailand', ph: 'Filipina', vn: 'Vietnam' };

// --- DAILY TIPS ---
const dailyTips = {
  id: [
    "Minum segelas air putih setelah bangun tidur membantu melancarkan metabolisme.",
    "Jalan kaki 15 menit setelah makan dapat mengontrol lonjakan gula darah.",
    "Tidur 7-8 jam adalah kunci utama pembakaran lemak yang optimal.",
    "Kurangi satu sendok gula pada minumanmu hari ini. Langkah kecil, hasil besar!",
    "Fokus pada progres, bukan kesempurnaan. Setiap langkah berarti.",
    "Stres meningkatkan hormon penahan lemak. Sempatkan tarik napas dalam hari ini.",
    "Protein di setiap waktu makan membantu Anda kenyang lebih lama."
  ],
  en: [
    "Drink a glass of water right after waking up to kickstart metabolism.",
    "A 15-minute walk after meals helps control blood sugar spikes.",
    "7-8 hours of sleep is the master key to optimal fat burn.",
    "Cut one spoon of sugar from your drink today. Small steps, big results!",
    "Focus on progress, not perfection. Every step counts.",
    "Stress raises fat-storing hormones. Take deep breaths today.",
    "Having protein at every meal helps keep you full longer."
  ]
};

// --- DATABASE OLAHRAGA ---
const workoutSchedules = {
  pria: [
    { focus: { id: "Peregangan (Rest Day)", en: "Stretching (Rest Day)" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, regangkan lengan ke depan", en: "Pull hips to heels, stretch arms forward"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cobra Stretch", en: "Cobra Stretch"}, desc: {id: "Angkat dada perlahan, jaga pinggul tetap di lantai", en: "Lift chest slowly, keep hips on the floor"}, cal: 15, time: "1 Min" },
      { name: {id: "Knee to Chest", en: "Knee to Chest"}, desc: {id: "Peluk lutut sambil berbaring rileks", en: "Hug knees while lying down relaxed"}, cal: 12, time: "1 Min" },
      { name: {id: "Cat-Cow", en: "Cat-Cow Stretch"}, desc: {id: "Lengkungkan punggung ke atas dan ke bawah", en: "Arch back upward and downward"}, cal: 15, time: "1 Min" }
    ]},
    { focus: { id: "Dada & Tricep", en: "Chest & Triceps" }, exercises: [ 
      { name: {id: "Push-Up Standar", en: "Standard Push-Up"}, desc: {id: "Turunkan badan hingga dada hampir menyentuh lantai", en: "Lower body until chest almost touches the floor"}, cal: 45, time: "3 Set x 12" }, 
      { name: {id: "Tricep Dips", en: "Tricep Dips"}, desc: {id: "Tekuk siku ke belakang menahan berat badan di ujung kursi", en: "Bend elbows back supporting weight on chair edge"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Wide Push-Up", en: "Wide Push-Up"}, desc: {id: "Buka tangan lebih lebar dari bahu", en: "Place hands wider than shoulders"}, cal: 50, time: "3 Set x 10" },
      { name: {id: "Diamond Push-Up", en: "Diamond Push-Up"}, desc: {id: "Kedua tangan membentuk bentuk diamond di dada", en: "Hands form diamond shape at chest"}, cal: 55, time: "3 Set x 8" }
    ]},
    { focus: { id: "Kaki (Lower Body)", en: "Lower Body (Legs)" }, exercises: [ 
      { name: {id: "Squats", en: "Bodyweight Squats"}, desc: {id: "Jongkok seolah duduk di kursi, punggung tegak", en: "Squat like sitting on a chair, back straight"}, cal: 40, time: "3 Set x 15" }, 
      { name: {id: "Lunges", en: "Lunges"}, desc: {id: "Langkah lebar ke depan, tekuk lutut 90 derajat", en: "Wide step forward, bend knees 90 degrees"}, cal: 45, time: "3 Set x 12" },
      { name: {id: "Calf Raises", en: "Calf Raises"}, desc: {id: "Jinjit perlahan ke atas lalu turunkan tumit", en: "Tiptoe slowly upward then lower heels"}, cal: 20, time: "3 Set x 20" },
      { name: {id: "Bulgarian Split Squat", en: "Bulgarian Split Squat"}, desc: {id: "Satu kaki diletakkan di kursi belakang, tekuk kaki depan", en: "One foot elevated behind, bend front leg"}, cal: 50, time: "3 Set x 10" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat buka-tutup tangan dan kaki seirama", en: "Jump opening and closing arms and legs"}, cal: 50, time: "1 Min" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tahan tubuh lurus sejajar lantai dengan siku", en: "Hold body straight parallel to floor on elbows"}, cal: 25, time: "45 Sec" },
      { name: {id: "Mountain Climbers", en: "Mountain Climbers"}, desc: {id: "Posisi push-up, tarik lutut ke dada bergantian cepat", en: "Push-up pos, pull knees to chest rapidly"}, cal: 60, time: "45 Sec" },
      { name: {id: "Bicycle Crunches", en: "Bicycle Crunches"}, desc: {id: "Kayuh kaki sambil sentuh siku berlawanan", en: "Pedal legs while touching opposite elbows"}, cal: 45, time: "3 Set x 15" }
    ]},
    { focus: { id: "Bahu & Punggung", en: "Shoulder & Back" }, exercises: [ 
      { name: {id: "Pike Push-Up", en: "Pike Push-Up"}, desc: {id: "Tubuh huruf V terbalik, tekuk siku perlahan", en: "Inverted V shape, bend elbows slowly"}, cal: 50, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman Holds"}, desc: {id: "Tengkurap, angkat dada dan paha bersaman dari lantai", en: "Lie on stomach, lift chest and thighs off floor"}, cal: 30, time: "3 Set x 15" },
      { name: {id: "Arm Circles", en: "Arm Circles"}, desc: {id: "Rentangkan tangan lurus, putar membentuk lingkaran kecil", en: "Extend arms straight, rotate in small circles"}, cal: 20, time: "1 Min" },
      { name: {id: "Reverse Snow Angels", en: "Reverse Snow Angels"}, desc: {id: "Tengkurap, ayun tangan perlahan ke belakang", en: "Lie on stomach, sweep arms slowly backward"}, cal: 25, time: "3 Set x 12" }
    ]},
    { focus: { id: "Kaki Eksplosif", en: "Explosive Legs" }, exercises: [ 
      { name: {id: "Squat Jumps", en: "Squat Jumps"}, desc: {id: "Dari posisi jongkok, lompat ke atas sekuat tenaga", en: "From squat position, jump up forcefully"}, cal: 60, time: "3 Set x 12" }, 
      { name: {id: "High Knees", en: "High Knees"}, desc: {id: "Lari di tempat sambil menarik lutut setinggi dada", en: "Run in place pulling knees chest-high"}, cal: 60, time: "30 Sec" },
      { name: {id: "Wall Sit", en: "Wall Sit"}, desc: {id: "Sandar di tembok, tekuk lutut 90 derajat seperti duduk", en: "Lean on wall, bend knees 90 degrees like sitting"}, cal: 40, time: "45 Sec" },
      { name: {id: "Lunge Jumps", en: "Lunge Jumps"}, desc: {id: "Lompat bertukar kaki dari posisi lunge", en: "Jump alternating legs from lunge position"}, cal: 65, time: "3 Set x 10" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees", en: "Burpees"}, desc: {id: "Jongkok, dorong kaki ke belakang, push-up, lalu lompat", en: "Squat, push legs back, push-up, then jump"}, cal: 70, time: "3 Set x 10" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk agak condong, putar bahu sentuh lantai kiri-kanan", en: "Sit leaning back, twist to touch floor left-right"}, cal: 40, time: "3 Set x 20" },
      { name: {id: "Push-Up", en: "Push-Up"}, desc: {id: "Lakukan berulang kali sampai lengan benar-benar lelah", en: "Do repeatedly until arms fail"}, cal: 50, time: "Max Reps" },
      { name: {id: "Plank to Push-Up", en: "Plank to Push-Up"}, desc: {id: "Transisi dari siku ke telapak tangan bergantian", en: "Transition from elbows to palms alternating"}, cal: 55, time: "3 Set x 10" }
    ]}
  ],
  wanita: [
    { focus: { id: "Yoga & Pemulihan", en: "Yoga & Recovery" }, exercises: [ 
      { name: {id: "Child's Pose", en: "Child's Pose"}, desc: {id: "Tarik pinggul ke tumit, istirahatkan dahi di lantai", en: "Pull hips to heels, rest forehead on floor"}, cal: 10, time: "2 Min" }, 
      { name: {id: "Cat-Cow", en: "Cat-Cow Stretch"}, desc: {id: "Lengkungkan punggung ke atas, lalu tekuk ke bawah", en: "Arch back upward, then curve downward"}, cal: 15, time: "3 Set x 10" },
      { name: {id: "Downward Dog", en: "Downward Dog"}, desc: {id: "Tubuh bentuk V terbalik, dorong panggul tinggi", en: "Inverted V shape, push pelvis high"}, cal: 20, time: "1 Min" },
      { name: {id: "Cobra Stretch", en: "Cobra Stretch"}, desc: {id: "Angkat dada perlahan, jaga pinggul tetap di lantai", en: "Lift chest slowly, keep hips on the floor"}, cal: 15, time: "1 Min" }
    ]},
    { focus: { id: "Bokong & Paha", en: "Glutes & Thighs" }, exercises: [ 
      { name: {id: "Glute Bridges", en: "Glute Bridges"}, desc: {id: "Berbaring, angkat pinggul ke atas lalu kencangkan bokong", en: "Lie down, lift hips up and squeeze glutes"}, cal: 35, time: "3 Set x 15" }, 
      { name: {id: "Donkey Kicks", en: "Donkey Kicks"}, desc: {id: "Merangkak, tendang satu kaki ke atas belakang", en: "On all fours, kick one leg up and back"}, cal: 40, time: "3 Set x 15" },
      { name: {id: "Fire Hydrants", en: "Fire Hydrants"}, desc: {id: "Merangkak, angkat satu paha ke samping luar", en: "On all fours, lift one thigh to the outside"}, cal: 35, time: "3 Set x 15" },
      { name: {id: "Squat Pulses", en: "Squat Pulses"}, desc: {id: "Tahan posisi jongkok setengah, bergerak naik turun tipis", en: "Hold half-squat, pulse slightly up and down"}, cal: 45, time: "3 Set x 15" }
    ]},
    { focus: { id: "Dada & Lengan", en: "Chest & Arms" }, exercises: [ 
      { name: {id: "Knee Push-Up", en: "Knee Push-Up"}, desc: {id: "Push-up dengan tumpuan pada kedua lutut", en: "Push-up supported by both knees"}, cal: 35, time: "3 Set x 10" }, 
      { name: {id: "Arm Circles", en: "Arm Circles"}, desc: {id: "Rentangkan tangan lurus, putar perlahan", en: "Extend arms straight, rotate slowly"}, cal: 20, time: "1 Min" },
      { name: {id: "Plank Taps", en: "Plank Shoulder Taps"}, desc: {id: "Posisi plank, satu tangan menyentuh bahu seberang", en: "Plank pos, touch opposite shoulder"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Tricep Dips (Kursi)", en: "Chair Tricep Dips"}, desc: {id: "Tekuk siku menahan berat badan di tepi kursi", en: "Bend elbows holding weight on chair edge"}, cal: 35, time: "3 Set x 10" }
    ]},
    { focus: { id: "Kardio & Perut", en: "Cardio & Core" }, exercises: [ 
      { name: {id: "Jumping Jacks", en: "Jumping Jacks"}, desc: {id: "Lompat sambil membuka kaki dan menepuk tangan", en: "Jump opening legs and clapping hands"}, cal: 50, time: "45 Sec" }, 
      { name: {id: "Plank", en: "Plank"}, desc: {id: "Tubuh lurus ditopang siku, pastikan pinggul tidak turun", en: "Straight body supported by elbows, keep hips up"}, cal: 25, time: "45 Sec" },
      { name: {id: "Bicycle Crunches", en: "Bicycle Crunches"}, desc: {id: "Berbaring, kayuh kaki sambil putar dada bersilang", en: "Lie down, pedal legs while twisting chest"}, cal: 45, time: "3 Set x 15" },
      { name: {id: "Mountain Climbers", en: "Mountain Climbers"}, desc: {id: "Posisi push up, tarik lutut bergantian cepat", en: "Push up pos, pull knees alternating fast"}, cal: 55, time: "45 Sec" }
    ]},
    { focus: { id: "Paha Dalam & Bokong", en: "Inner Thighs & Glutes" }, exercises: [ 
      { name: {id: "Sumo Squats", en: "Sumo Squats"}, desc: {id: "Buka kaki sangat lebar, jongkok dalam dengan punggung lurus", en: "Very wide stance, deep squat with straight back"}, cal: 45, time: "3 Set x 15" }, 
      { name: {id: "Reverse Lunges", en: "Reverse Lunges"}, desc: {id: "Langkah satu kaki jauh ke belakang lalu tekuk lutut", en: "Step one leg far back then bend knees"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Side Leg Raises", en: "Side Leg Raises"}, desc: {id: "Berbaring miring, angkat kaki perlahan ke udara", en: "Lie on side, raise leg slowly in the air"}, cal: 30, time: "3 Set x 15" },
      { name: {id: "Curtsy Lunges", en: "Curtsy Lunges"}, desc: {id: "Langkah silang ke belakang seperti membungkuk hormat", en: "Cross step back like curtsying"}, cal: 45, time: "3 Set x 12" }
    ]},
    { focus: { id: "Full Body Toning", en: "Full Body Toning" }, exercises: [ 
      { name: {id: "Burpees (Tanpa Lompat)", en: "Step-out Burpees"}, desc: {id: "Jongkok, kaki ke belakang satu persatu, lalu berdiri", en: "Squat, step back one by one, then stand"}, cal: 55, time: "3 Set x 10" }, 
      { name: {id: "Superman", en: "Superman"}, desc: {id: "Tengkurap, angkat kedua tangan dan kaki menjauhi lantai", en: "Lie face down, lift arms and legs off floor"}, cal: 30, time: "3 Set x 12" },
      { name: {id: "High Knees", en: "High Knees"}, desc: {id: "Lari di tempat, angkat lutut ke perut secara bergantian", en: "Run in place, lift knees to stomach alternating"}, cal: 60, time: "30 Sec" },
      { name: {id: "Plank Jacks", en: "Plank Jacks"}, desc: {id: "Dari posisi plank, lompat buka tutup kaki", en: "From plank, jump legs wide and close"}, cal: 50, time: "30 Sec" }
    ]},
    { focus: { id: "Perut (Core)", en: "Core Focus" }, exercises: [ 
      { name: {id: "Flutter Kicks", en: "Flutter Kicks"}, desc: {id: "Berbaring, kepakkan kaki lurus naik-turun tipis", en: "Lie flat, flutter straight legs up and down slightly"}, cal: 35, time: "30 Sec" }, 
      { name: {id: "Russian Twists", en: "Russian Twists"}, desc: {id: "Duduk seimbang, putar bahu sentuh lantai kiri-kanan", en: "Sit balanced, twist shoulders touching floor left-right"}, cal: 40, time: "3 Set x 20" },
      { name: {id: "Leg Raises", en: "Leg Raises"}, desc: {id: "Berbaring, angkat kaki lurus ke atas 90 derajat", en: "Lie down, raise legs straight up 90 degrees"}, cal: 40, time: "3 Set x 12" },
      { name: {id: "Heel Touches", en: "Heel Touches"}, desc: {id: "Berbaring tekuk lutut, geser dada sentuh tumit kiri kanan", en: "Lie knees bent, shift chest to touch heels left right"}, cal: 35, time: "3 Set x 20" }
    ]}
  ]
};

// --- DATABASE MAKANAN DINAMIS ASEAN (7 VARIASI PER NEGARA) ---
const mealDB_id = {
  sarapan: [ 
    { menu: "Roti Gandum Alpukat & Telur", cal: 320, price: 15000 }, 
    { menu: "Oatmeal Pisang & Kacang", cal: 300, price: 12000 }, 
    { menu: "Smoothie Bowl Buah Naga", cal: 350, price: 18000 }, 
    { menu: "Nasi Uduk Merah (Porsi Kecil)", cal: 380, price: 15000 }, 
    { menu: "Telur Orak-Arik Bayam", cal: 280, price: 10000 },
    { menu: "Bubur Ayam Kuah Bening", cal: 300, price: 12000 },
    { menu: "Pancake Oat Putih Telur", cal: 310, price: 16000 }
  ],
  siang: [ 
    { menu: "Nasi Merah & Ikan Bakar", cal: 500, price: 25000 }, 
    { menu: "Gado-Gado & Telur Rebus", cal: 450, price: 20000 }, 
    { menu: "Dada Ayam Panggang & Kentang", cal: 520, price: 35000 }, 
    { menu: "Sate Taichan Tanpa Kulit & Lontong", cal: 400, price: 30000 }, 
    { menu: "Pecel Sayur & Tempe Kukus", cal: 420, price: 15000 },
    { menu: "Soto Ayam Kuah Bening (Nasi ½)", cal: 450, price: 20000 },
    { menu: "Ayam Penyet Dada (Tanpa Digoreng)", cal: 480, price: 22000 }
  ],
  malam: [ 
    { menu: "Salad Sayur & Telur Rebus", cal: 250, price: 15000 }, 
    { menu: "Sapo Tahu Brokoli", cal: 380, price: 28000 }, 
    { menu: "Tumis Dada Ayam Sayur", cal: 420, price: 26000 }, 
    { menu: "Sup Bening Ikan Nila", cal: 300, price: 25000 }, 
    { menu: "Kwetiau Shirataki Rebus", cal: 280, price: 35000 },
    { menu: "Tahu & Tempe Bacem Kukus", cal: 320, price: 12000 },
    { menu: "Sayur Sop Bening & Telur Pindang", cal: 290, price: 14000 }
  ],
  snack: [ 
    { menu: "Yoghurt & Buah Naga", cal: 150, price: 12000 }, 
    { menu: "Edamame Rebus", cal: 120, price: 8000 }, 
    { menu: "Pisang Panggang", cal: 180, price: 6000 }, 
    { menu: "Kacang Almond Panggang", cal: 160, price: 15000 }, 
    { menu: "Apel Segar", cal: 90, price: 5000 },
    { menu: "Putih Telur Rebus (2 Butir)", cal: 80, price: 4000 },
    { menu: "Agar-agar Tanpa Gula", cal: 50, price: 3000 }
  ]
};

const mealDB_my = {
  sarapan: [ 
    { menu: "Roti Gandum Telur Goyang", cal: 320, price: 6 }, 
    { menu: "Oatmeal Pisang", cal: 300, price: 5 }, 
    { menu: "Nasi Lemak Kurang Santan", cal: 350, price: 7 }, 
    { menu: "Thosai & Kuah Dhal", cal: 300, price: 4 }, 
    { menu: "Telur Separuh Masak (2 biji)", cal: 160, price: 3 },
    { menu: "Bihun Sup Kosong", cal: 280, price: 5 },
    { menu: "Capati & Kari Sayur", cal: 320, price: 4.5 }
  ],
  siang: [ 
    { menu: "Nasi Perang & Ayam Tandoori", cal: 500, price: 12 }, 
    { menu: "Nasi Kerabu Ayam Bakar", cal: 450, price: 10 }, 
    { menu: "Ayam Panggang & Kentang Rebus", cal: 520, price: 15 }, 
    { menu: "Ikan Singgang & Nasi Putih Sedikit", cal: 380, price: 8 }, 
    { menu: "Sup Ayam Dada & Sayur Campur", cal: 350, price: 9 },
    { menu: "Mee Hoon Tomyam Ayam", cal: 420, price: 8.5 },
    { menu: "Asam Pedas Ikan Pari (Nasi ½)", cal: 460, price: 11 }
  ],
  malam: [ 
    { menu: "Salad Sayur Telur Rebus", cal: 250, price: 8 }, 
    { menu: "Tom Yam Sayur Bening", cal: 380, price: 12 }, 
    { menu: "Ikan Bakar Air Asam", cal: 300, price: 15 }, 
    { menu: "Kerabu Sotong Segar", cal: 280, price: 14 }, 
    { menu: "Wrap Ayam Panggang", cal: 350, price: 10 },
    { menu: "Sup Sayur Fucuk", cal: 200, price: 6 },
    { menu: "Ayam Kukus Halia", cal: 320, price: 12 }
  ],
  snack: [ 
    { menu: "Yoghurt Berries", cal: 150, price: 5 }, 
    { menu: "Kacang Kuda Rebus", cal: 120, price: 3 }, 
    { menu: "Epal & Badam", cal: 200, price: 6 }, 
    { menu: "Jambu Batu Potong", cal: 80, price: 3 }, 
    { menu: "Smoothie Pisang Tanpa Gula", cal: 180, price: 8 },
    { menu: "Jagung Rebus Separuh", cal: 90, price: 3 },
    { menu: "Susu Kurma Rendah Lemak", cal: 140, price: 4.5 }
  ]
};

const mealDB_th = {
  sarapan: [ 
    { menu: "Jok (Bubur Nasi Ayam)", cal: 300, price: 40 }, 
    { menu: "Khao Tom (Sup Nasi Telur)", cal: 320, price: 45 }, 
    { menu: "Salad Pepaya Hijau (Som Tam)", cal: 200, price: 50 }, 
    { menu: "Roti Panggang Alpukat Telur", cal: 350, price: 60 },
    { menu: "Kai Krata (Telur Goreng Pan)", cal: 280, price: 45 },
    { menu: "Khao Niew Moo Ping (Sate Babi Nasi Ketan)", cal: 400, price: 55 },
    { menu: "Oatmeal Mangga Segar", cal: 290, price: 65 }
  ],
  siang: [ 
    { menu: "Pad Kra Pao Ayam (Nasi Merah)", cal: 500, price: 70 }, 
    { menu: "Tom Yum Goong (Udang Bening)", cal: 450, price: 90 }, 
    { menu: "Ayam Panggang (Gai Yang)", cal: 520, price: 65 }, 
    { menu: "Nam Tok Moo (Salad Babi Panggang Lean)", cal: 420, price: 80 },
    { menu: "Khao Pad Kung (Nasi Goreng Udang Lemak Sedikit)", cal: 480, price: 75 },
    { menu: "Pad Thai (Tanpa Gula, Kuah Asam)", cal: 550, price: 80 },
    { menu: "Kuay Teow Nam Sai (Sup Mie Bening Ayam)", cal: 380, price: 50 }
  ],
  malam: [ 
    { menu: "Yum Woon Sen (Salad Mi Kaca)", cal: 300, price: 60 }, 
    { menu: "Tom Kha Gai (Sup Ayam Kelapa)", cal: 380, price: 80 }, 
    { menu: "Ikan Bakar Garam Penuh", cal: 350, price: 120 }, 
    { menu: "Larb Gai (Salad Ayam Cincang Pedas)", cal: 320, price: 70 },
    { menu: "Pla Nueng Manao (Ikan Kukus Jeruk Nipis)", cal: 300, price: 150 },
    { menu: "Kaeng Jued Woon Sen (Sup Bening Sayur Mi)", cal: 250, price: 60 },
    { menu: "Tumis Kangkung Terasi (Porsi Kecil)", cal: 200, price: 50 }
  ],
  snack: [ 
    { menu: "Mangga Segar", cal: 150, price: 30 }, 
    { menu: "Air Kelapa Murni", cal: 100, price: 25 }, 
    { menu: "Kacang Tanah Rebus", cal: 200, price: 20 }, 
    { menu: "Buah Naga Iris", cal: 90, price: 35 },
    { menu: "Jambu Air Segar", cal: 60, price: 25 },
    { menu: "Edamame Thailand", cal: 120, price: 40 },
    { menu: "Yoghurt Plain & Semangka", cal: 140, price: 35 }
  ]
};

const mealDB_sg = {
  sarapan: [ 
    { menu: "Kaya Toast Gandum & Telur", cal: 320, price: 5 }, 
    { menu: "Chee Cheong Fun Bening", cal: 300, price: 3.5 }, 
    { menu: "Oatmeal Berries", cal: 280, price: 6 }, 
    { menu: "Soft Boiled Eggs (2) & Black Coffee", cal: 160, price: 3 },
    { menu: "Mee Hoon Kueh (Sup Bening)", cal: 350, price: 4.5 },
    { menu: "Wholemeal Putu Piring", cal: 250, price: 3 },
    { menu: "Avocado Toast on Sourdough", cal: 350, price: 8 }
  ],
  siang: [ 
    { menu: "Hainanese Chicken Rice (Roasted)", cal: 500, price: 6 }, 
    { menu: "Yong Tau Foo (Banyak Sayur)", cal: 400, price: 7 }, 
    { menu: "Chicken Chop (Panggang Salad)", cal: 520, price: 9 }, 
    { menu: "Sliced Fish Soup with Brown Rice", cal: 420, price: 8 },
    { menu: "Economy Rice (1 Meat 2 Veg)", cal: 480, price: 5 },
    { menu: "Thunder Tea Rice (Hakka Lei Cha)", cal: 350, price: 6.5 },
    { menu: "Chicken Wrap (Low Mayo)", cal: 450, price: 7.5 }
  ],
  malam: [ 
    { menu: "Seafood Soup Bening", cal: 300, price: 8 }, 
    { menu: "Broccoli Garlic Stir-fry", cal: 250, price: 5 }, 
    { menu: "Grilled Salmon & Salad Segar", cal: 450, price: 15 }, 
    { menu: "Steamed Chicken & Cai Xin", cal: 350, price: 7 },
    { menu: "Tofu Mushroom Claypot (Less Oil)", cal: 380, price: 6 },
    { menu: "Clear Tomyam Seafood", cal: 320, price: 8.5 },
    { menu: "Mixed Veggies Quinoa Bowl", cal: 400, price: 12 }
  ],
  snack: [ 
    { menu: "Greek Yogurt Plain", cal: 150, price: 4 }, 
    { menu: "Kacang Almond Panggang", cal: 200, price: 3 }, 
    { menu: "Edamame Kukus", cal: 150, price: 3.5 }, 
    { menu: "Cold Cut Watermelon", cal: 80, price: 2 },
    { menu: "Tau Huay (No Sugar Syrup)", cal: 150, price: 2.5 },
    { menu: "Apple & Peanut Butter", cal: 200, price: 4 },
    { menu: "Roasted Chestnuts", cal: 180, price: 5 }
  ]
};

const mealDB_ph = {
  sarapan: [ 
    { menu: "Tapsilog (Sapi Tanpa Lemak)", cal: 400, price: 120 }, 
    { menu: "Arroz Caldo (Bubur Ayam Jahe)", cal: 350, price: 80 }, 
    { menu: "Oatmeal Pisang Segar", cal: 280, price: 70 }, 
    { menu: "Pandesal Gandum & Telur", cal: 320, price: 60 },
    { menu: "Champorado (Gunakan Dark Choc)", cal: 380, price: 90 },
    { menu: "Tortang Talong (Omelet Terong)", cal: 250, price: 50 },
    { menu: "Daing na Bangus (Porsi Kecil)", cal: 350, price: 110 }
  ],
  siang: [ 
    { menu: "Sinigang na Hipon (Sup Udang)", cal: 400, price: 180 }, 
    { menu: "Chicken Inasal (Dada Tanpa Kulit)", cal: 450, price: 150 }, 
    { menu: "Adobo Ayam & Nasi Merah", cal: 500, price: 140 }, 
    { menu: "Pinakbet (Sayuran Campur) & Ikan Bakar", cal: 380, price: 130 },
    { menu: "Pork Sinigang (Potongan Lean)", cal: 450, price: 160 },
    { menu: "Bistek Tagalog (Kurangi Minyak)", cal: 480, price: 170 },
    { menu: "Chicken Tinola (Sup Bening Pepaya)", cal: 350, price: 120 }
  ],
  malam: [ 
    { menu: "Grilled Bangus (Ikan Bakar)", cal: 380, price: 160 }, 
    { menu: "Ginisang Monggo", cal: 350, price: 90 }, 
    { menu: "Dada Ayam Panggang", cal: 400, price: 140 }, 
    { menu: "Tinolang Manok (Sup Ayam Pepaya Mentah)", cal: 320, price: 110 },
    { menu: "Laing (Sayur Daun Talas Pedas)", cal: 300, price: 80 },
    { menu: "Nilagang Baka (Sup Sapi Lean)", cal: 400, price: 180 },
    { menu: "Ensaladang Talong (Salad Terong Tomat)", cal: 150, price: 60 }
  ],
  snack: [ 
    { menu: "Taho (Sedikit Sirup)", cal: 180, price: 40 }, 
    { menu: "Mangga Segar Potong", cal: 150, price: 50 }, 
    { menu: "Buko (Air Kelapa Muda)", cal: 100, price: 40 }, 
    { menu: "Saba Rebus (Pisang Matang)", cal: 160, price: 30 },
    { menu: "Nilagang Mani (Kacang Rebus)", cal: 180, price: 20 },
    { menu: "Papaya Segar", cal: 90, price: 30 },
    { menu: "Susu Almond Segar", cal: 120, price: 80 }
  ]
};

const mealDB_vn = {
  sarapan: [ 
    { menu: "Pho Ga (Sup Mi Ayam)", cal: 400, price: 45000 }, 
    { menu: "Banh Cuon (Pancake Beras)", cal: 350, price: 35000 }, 
    { menu: "Chao Ga (Bubur Ayam)", cal: 300, price: 30000 }, 
    { menu: "Banh Mi Dada Ayam (Tanpa Mayo)", cal: 380, price: 40000 },
    { menu: "Hu Tieu (Sup Mie Bening Udang)", cal: 350, price: 45000 },
    { menu: "Xoi Xeo (Nasi Ketan Kacang Hijau Porsi Kecil)", cal: 400, price: 20000 },
    { menu: "Oatmeal Yoghurt & Leci", cal: 280, price: 35000 }
  ],
  siang: [ 
    { menu: "Com Tam (Nasi Patah & Ayam)", cal: 500, price: 55000 }, 
    { menu: "Goi Cuon (Lumpia Sayur)", cal: 350, price: 40000 }, 
    { menu: "Bun Cha (Ayam Panggang)", cal: 550, price: 60000 }, 
    { menu: "Goi Ngo Sen (Salad Akar Teratai)", cal: 250, price: 45000 },
    { menu: "Ca Kho To (Ikan Karamel Tanah Liat) & Nasi Merah", cal: 480, price: 65000 },
    { menu: "Bun Thit Nuong (Mie Beras Daging Panggang)", cal: 500, price: 50000 },
    { menu: "Canh Chua (Sup Asam Udang)", cal: 350, price: 40000 }
  ],
  malam: [ 
    { menu: "Bun Bo Hue (Porsi Mi Sedikit)", cal: 450, price: 55000 }, 
    { menu: "Dada Ayam Rebus", cal: 300, price: 45000 }, 
    { menu: "Ikan Kukus Jahe", cal: 350, price: 60000 }, 
    { menu: "Rau Muong Xao Toi (Tumis Kangkung Bawang)", cal: 200, price: 35000 },
    { menu: "Salad Ayam Vietnam (Goi Ga)", cal: 280, price: 45000 },
    { menu: "Thit Luoc Cuon Banh Trang (Daging Rebus Gulung Kertas Beras)", cal: 400, price: 55000 },
    { menu: "Sup Jamur Tahu Bening", cal: 220, price: 30000 }
  ],
  snack: [ 
    { menu: "Che (Kacang Hijau Tanpa Santan)", cal: 200, price: 20000 }, 
    { menu: "Yoghurt Vietnam", cal: 150, price: 15000 }, 
    { menu: "Air Tebu Murni", cal: 180, price: 15000 }, 
    { menu: "Buah Leci Segar", cal: 120, price: 25000 },
    { menu: "Biji Teratai Rebus", cal: 150, price: 20000 },
    { menu: "Jambu Biji (Trai Oi)", cal: 80, price: 10000 },
    { menu: "Mangga Hijau Segar", cal: 100, price: 15000 }
  ]
};

// --- DICTIONARY LOKALISASI ---
const dict = {
  id: {
    loginTitle: "Selamat Datang Kembali", email: "Email", password: "Kata Sandi", username: "Nama Pengguna",
    loginBtn: "Mulai Sekarang", registerBtn: "Daftar Akun Baru", resetBtn: "Kirim Link Reset",
    linkToRegister: "Belum punya akun? Daftar", linkToLogin: "Sudah punya akun? Login", linkToForgot: "Lupa Kata Sandi?",
    subtitle: "Langkah Kecil, Dampak Besar", welcome: "Hai", proBtn: "PRO", memberPro: "MEMBER PRO",
    logWeight: "Catat Berat Harian", currentWeightPlaceholder: "Saat ini (kg)", save: "Simpan",
    yourTarget: "Target Anda", timePrediction: "Prediksi Waktu Capai Target", freeTrack: "Jalur Gratis",
    proTrack: "Jalur PRO", dailyMissions: "Misi Harian Anda", water: "Minum 2L Air",
    waterDesc: "Ketuk gelas setiap kali minum", steps: "Jalan Langkah", stepsDesc: "Detektor sensor aktif",
    sugar: "Tanpa Gula Tambahan", sugarDesc: "Cegah lonjakan insulin",
    sugarDetail: "Hindari gula cair & manis buatan! Gula memicu lonjakan insulin yang mengunci pembakaran lemak dan membuatnya menumpuk di perut. 1 hari tanpa gula = hasil diet 3x lebih cepat.",
    moveTitle: "3 Kebiasaan Gerak", moveStretch: "Peregangan Pagi", moveStretchDesc: "Lenturkan otot yang kaku 5 menit.",
    moveWalk: "Jalan Santai", moveWalkDesc: "10-15 menit usai makan.", moveStand: "Berdiri Tiap Jam", moveStandDesc: "Berdiri 1 menit setiap jam kerja.",
    unlockPotential: "Pilih Paket Berlangganan", unlockDesc: "Buka akses Grafik BMI, Prediksi AI, dan Menu Diet Spesial.",
    tierWeek: "Paket Mingguan", tierMonth: "Paket Bulanan", tierQuarter: "Paket 3 Bulan",
    promoTitle: "🎉 Promo Konsisten 7 Hari!", promoDesc: "Dapatkan Harga Spesial untuk Paket PRO!", promoBtn: "Klaim Promo Spesial",
    bmiProjection: "Proyeksi BMI", bmiWarning: "Lengkapi data profil terlebih dahulu.", height: "Tinggi Badan (cm)",
    age: "Umur (Tahun)", activityLevel: "Tingkat Aktivitas", activity1: "Jarang Olahraga", activity2: "Aktif Ringan", activity3: "Sangat Aktif",
    onboardTitle: "Personalisasi Profil AI", onboardDesc: "Bantu kami menghitung metabolisme (TDEE).",
    tabHome: "Beranda", tabPro: "Program", tabProfile: "Profil", settingsTitle: "Pengaturan Profil",
    syncCalendar: "Setel Alarm Kalender", syncCalendarDesc: "Buat pengingat di HP-mu.", checkoutTitle: "Pilih Metode Pembayaran", payNow: "Lanjutkan", processing: "Memproses...",
    saveProfile: "Simpan Profil", todayMenu: "Menu Diet Hari Ini", homeWorkout: "Latihan Rumahan",
    breakfast: "Sarapan", lunch: "Makan Siang", dinner: "Makan Malam", snack: "Camilan",
    estPrice: "Est Harga:", focusDay: "Fokus Hari Ini:", langLabel: "Ganti Bahasa", locationLabel: "Posisi Anda saat ini:",
    mostPopular: "PALING POPULER", bestValue: "PILIHAN TERBAIK", detecting: "Mendeteksi...", predictionTitle: "Prediksi Pencapaian Target 🚀",
    predictionFree: "Jalur Gratis", predictionPro: "Jalur PRO", daysToTarget: "hari", kgLeft: "kg lagi",
    proProgressTitle: "Progres Target Anda 🎯", weightLost: "Turun", remaining: "Sisa", shareTitle: "Bagikan Pencapaian 🚀",
    dailyTip: "Tips Hari Ini 💡", weightHistoryLabel: "Riwayat Terakhir",
    findDest: "Cari Tujuan", destTitle: "Destinasi 8000 Langkahmu", scanning: "Memindai radar sekitar...",
    noDest: "Tidak menemukan tempat menarik di sekitar sini. Coba lagi nanti.", openMap: "Buka Peta", sportsEventText: "Event Olahraga di",
    billedInIDR: "Ditagih dalam Rupiah (IDR). Bank Anda akan mengonversi secara otomatis.",
    fastingTitle: "Timer Puasa (Intermittent Fasting)", startFasting: "Mulai Puasa", stopFasting: "Akhiri Puasa",
    groceryTitle: "Daftar Belanja 7 Hari", generateGrocery: "Buat Daftar Belanja Mingguan", groceryDesc: "AI mengekstrak bahan dari menu Anda",
    findResto: "Cari Resto Terdekat"
  },
  en: {
    loginTitle: "Welcome Back", email: "Email", password: "Password", username: "Username",
    loginBtn: "Get Started", registerBtn: "Sign Up Now", resetBtn: "Send Reset Link",
    linkToRegister: "Don't have an account? Register", linkToLogin: "Already have an account? Login", linkToForgot: "Forgot Password?",
    subtitle: "Small Steps, Big Impact", welcome: "Hi", proBtn: "PRO", memberPro: "PRO MEMBER",
    logWeight: "Log Daily Weight", currentWeightPlaceholder: "Current (kg)", save: "Save",
    yourTarget: "Your Target", timePrediction: "Time Prediction", freeTrack: "Free Track",
    proTrack: "PRO Track", dailyMissions: "Your Daily Missions", water: "Drink 2L Water",
    waterDesc: "Tap glass each time you drink", steps: "Walk Steps", stepsDesc: "Sensor detector active",
    sugar: "No Added Sugar", sugarDesc: "Prevent insulin spikes",
    sugarDetail: "Avoid liquid sugar & artificial sweets! Sugar triggers insulin spikes that lock fat burning and cause belly fat. 1 day without sugar = 3x faster diet results.",
    moveTitle: "3 Movement Habits", moveStretch: "Morning Stretch", moveStretchDesc: "Loosen stiff muscles.",
    moveWalk: "Light Walk", moveWalkDesc: "10-15 min after a meal.", moveStand: "Stand Hourly", moveStandDesc: "Stand 1 min every hour at desk.",
    unlockPotential: "Subscription Plans", unlockDesc: "Unlock BMI Charts, AI Predictions, and Special Menus.",
    tierWeek: "Weekly Plan", tierMonth: "Monthly Plan", tierQuarter: "Quarterly Plan",
    promoTitle: "🎉 7-Day Streak Promo!", promoDesc: "Get a Special Price for PRO Plan!", promoBtn: "Claim Special Promo",
    bmiProjection: "BMI Projection", bmiWarning: "Please complete your profile.", height: "Height (cm)",
    age: "Age (Years)", activityLevel: "Activity Level", activity1: "Sedentary", activity2: "Lightly Active", activity3: "Very Active",
    onboardTitle: "AI Profile Personalization", onboardDesc: "Help us calculate your metabolism.",
    tabHome: "Home", tabPro: "Program", tabProfile: "Profile", settingsTitle: "Profile Settings",
    syncCalendar: "Set Calendar Alarm", syncCalendarDesc: "Set a reminder on your phone.", checkoutTitle: "Choose Payment Method", payNow: "Continue", processing: "Processing...",
    saveProfile: "Save Profile", todayMenu: "Today's Diet Menu", homeWorkout: "Home Workout",
    breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
    estPrice: "Est Price:", focusDay: "Today's Focus:", langLabel: "Change Language", locationLabel: "Your Current Position:",
    mostPopular: "MOST POPULAR", bestValue: "BEST VALUE", detecting: "Detecting...", predictionTitle: "Target Prediction 🚀",
    predictionFree: "Free Track", predictionPro: "PRO Track", daysToTarget: "days", kgLeft: "kg left",
    proProgressTitle: "Your Target Progress 🎯", weightLost: "Lost", remaining: "Remaining", shareTitle: "Share Achievement 🚀",
    dailyTip: "Today's Tip 💡", weightHistoryLabel: "Recent History",
    findDest: "Find Destination", destTitle: "Your 8000-Step Destinations", scanning: "Scanning radar around...",
    noDest: "Could not find interesting places nearby. Try again later.", openMap: "Open Map", sportsEventText: "Sports Events in",
    billedInIDR: "Billed in IDR. Your bank will auto-convert the currency.",
    fastingTitle: "Intermittent Fasting Timer", startFasting: "Start Fasting", stopFasting: "End Fasting",
    groceryTitle: "7-Day Grocery List", generateGrocery: "Generate Weekly Groceries", groceryDesc: "AI extracts ingredients from your menu",
    findResto: "Find Nearby Resto"
  }
};

export default function App() {
  const [lang, setLang] = useState('id');
  const t = dict[lang] || dict.id;

  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // App States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [simulatedName, setSimulatedName] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fitur Baru PRO
  const [isFasting, setIsFasting] = useState(false);
  const [fastingStartTime, setFastingStartTime] = useState(null);
  const [fastingDuration, setFastingDuration] = useState(0); 
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [checkedGroceries, setCheckedGroceries] = useState({}); // Memori untuk menyimpan centang daftar belanja

  // User Data (Ini semua terekam ke Cloud/Firebase)
  const [habits, setHabits] = useState({ sugar: false, moveStretch: false, moveWalk: false, moveStand: false });
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
  const [location, setLocation] = useState('id'); 
  const [menuVariant, setMenuVariant] = useState(0);

  // Gamification 8000 Steps Map Feature
  const [showMapModal, setShowMapModal] = useState(false);
  const [poiList, setPoiList] = useState([]);
  const [isLoadingPOI, setIsLoadingPOI] = useState(false);
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentDay = new Date().getDay(); // 0 = Minggu, 1 = Senin, dst (Digunakan untuk variasi menu mingguan)

  // Sensors & Toast
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [toastMsg, setToastMsg] = useState(''); 

  // --- TIMER PUASA INTERMITEN ---
  useEffect(() => {
    let interval;
    if (isFasting && fastingStartTime) {
      interval = setInterval(() => {
        setFastingDuration(Math.floor((Date.now() - fastingStartTime) / 1000));
      }, 1000);
    } else {
      setFastingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, fastingStartTime]);

  const toggleFasting = () => {
    if (isFasting) {
       setIsFasting(false); setFastingStartTime(null);
       saveToCloud({ isFasting: false, fastingStartTime: null });
       showToast(lang === 'id' ? "✅ Puasa dihentikan. Kerja bagus!" : "✅ Fasting stopped. Great job!");
    } else {
       const now = Date.now();
       setIsFasting(true); setFastingStartTime(now);
       saveToCloud({ isFasting: true, fastingStartTime: now });
       showToast(lang === 'id' ? "⏳ Timer puasa dimulai!" : "⏳ Fasting timer started!");
    }
  };

  const formatFastingTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Logika Fase Puasa AI
  let fastingPhase = lang === 'id' ? "Pencernaan Makanan" : "Digestion";
  let phaseColor = "text-slate-400";
  const hoursFasted = fastingDuration / 3600;
  if (hoursFasted >= 16) { fastingPhase = lang === 'id' ? "Autophagy Maksimal" : "Max Autophagy"; phaseColor = "text-purple-400"; }
  else if (hoursFasted >= 14) { fastingPhase = lang === 'id' ? "Regenerasi Sel" : "Cellular Regeneration"; phaseColor = "text-indigo-400"; }
  else if (hoursFasted >= 12) { fastingPhase = lang === 'id' ? "Pembakaran Lemak Aktif" : "Active Fat Burn"; phaseColor = "text-emerald-400"; }
  else if (hoursFasted >= 8) { fastingPhase = lang === 'id' ? "Penurunan Gula Darah" : "Blood Sugar Drop"; phaseColor = "text-orange-400"; }

  // Database Dinamis Daftar Belanja
  const getGroceryItems = () => {
    const items = {
       id: ["Dada Ayam (1.5 kg)", "Telur Ayam (1 Rak)", "Beras Merah (2 kg)", "Oatmeal (500g)", "Sayur Bayam & Brokoli", "Buah Naga & Pisang", "Almond / Edamame", "Tahu & Tempe"],
       my: ["Dada Ayam (1.5 kg)", "Telur (30 biji)", "Beras Perang (2 kg)", "Oatmeal (500g)", "Sayur Campur", "Epal & Pisang", "Kacang Kuda", "Susu Rendah Lemak"],
       sg: ["Chicken Breast (1.5 kg)", "Eggs (30 pcs)", "Brown Rice (2 kg)", "Oatmeal (500g)", "Broccoli & Cai Xin", "Berries & Apples", "Greek Yogurt", "Tofu"],
       th: ["Chicken Breast (1.5kg)", "Eggs (30 pcs)", "Brown Rice (2kg)", "Fresh Mango & Papaya", "Green Vegetables", "Raw Peanuts", "Coconut Water"],
       ph: ["Chicken Breast (1.5kg)", "Eggs (1 tray)", "Brown Rice (2kg)", "Oatmeal (500g)", "Mixed Vegetables (Pinakbet)", "Bananas (Saba)", "Tofu"],
       vn: ["Chicken Breast (1.5kg)", "Eggs (30 pcs)", "Brown Rice (2kg)", "Fresh Herbs & Veggies", "Tofu", "Lotus Seeds", "Fresh Fruits"]
    };
    return items[location] || items.id;
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const fallbackCopyTextToClipboard = (text, successMsg) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      console.error('Copy gagal', err);
    }
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  useEffect(() => {
    if (!auth) {
      setIsDataLoaded(true);
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { 
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

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        
        if (d.lastLoginDate && d.lastLoginDate !== todayDateStr) {
          const resetData = {
            lastLoginDate: todayDateStr, waterCount: 0, currentSteps: 0,
            habits: { sugar: false, moveStretch: false, moveWalk: false, moveStand: false },
            streak: d.streak ? d.streak + 1 : 1 
          };
          saveToCloud(resetData);
          setWaterCount(0); setCurrentSteps(0);
          setHabits({ sugar: false, moveStretch: false, moveWalk: false, moveStand: false });
          setStreak(resetData.streak);
        } else {
          if (d.waterCount !== undefined) setWaterCount(d.waterCount);
          if (d.currentSteps !== undefined) setCurrentSteps(d.currentSteps);
          if (d.habits) setHabits({ sugar: false, moveStretch: false, moveWalk: false, moveStand: false, ...d.habits });
          if (d.streak !== undefined) setStreak(d.streak);
        }

        if (d.weightHistory) setWeightHistory(d.weightHistory);
        
        // LOGIKA PENGECEKAN KADALUARSA PRO (AUTO-EXPIRE)
        if (d.isPremium && d.premiumUntil) {
           if (Date.now() > d.premiumUntil) {
              // Jika waktu saat ini melebih batas waktu langganan = KADALUARSA
              setIsPremium(false);
              saveToCloud({ isPremium: false, premiumUntil: null });
              showToast("⚠️ Masa aktif langganan PRO Anda telah habis.");
           } else {
              setIsPremium(true);
           }
        } else if (d.isPremium !== undefined) {
           setIsPremium(d.isPremium);
        }

        if (d.height) setHeight(d.height);
        if (d.age) setAge(d.age);
        if (d.activityFactor) setActivityFactor(d.activityFactor);
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.stepTarget) setStepTarget(d.stepTarget);
        if (d.genderFocus) setGenderFocus(d.genderFocus);
        if (d.location) setLocation(d.location);
        if (d.lang) setLang(d.lang);
        if (d.isOnboardingComplete !== undefined) setIsOnboardingComplete(d.isOnboardingComplete);
        
        // Sync Fitur PRO
        if (d.isFasting !== undefined) setIsFasting(d.isFasting);
        if (d.fastingStartTime) setFastingStartTime(d.fastingStartTime);

        if (!d.lastLoginDate) saveToCloud({ lastLoginDate: todayDateStr });

      } else {
        saveToCloud({ streak: 1, isPremium: false, lang: 'id', location: 'id', habits: { sugar: false, moveStretch: false, moveWalk: false, moveStand: false }, lastLoginDate: todayDateStr, isOnboardingComplete: false });
      }
      setIsDataLoaded(true);
    }, (err) => {
      console.error(err);
      setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  const saveToCloud = async (data) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'main');
      await setDoc(docRef, data, { merge: true });
    } catch (e) { console.error("Cloud Save Error:", e); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingAuth(true);

    if (!auth) {
      if (authMode === 'register') setSimulatedName(username);
      showToast(lang === 'id' ? "Mode Demo: Login disimulasikan ✅" : "Demo Mode: Login simulated ✅");
      if (authMode !== 'forgot') setIsLoggedIn(true);
      setIsProcessingAuth(false);
      return;
    }

    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        showToast(lang === 'id' ? "Pendaftaran Berhasil!" : "Registration Success!");
        setIsLoggedIn(true);
      } else if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        showToast(lang === 'id' ? "Login Berhasil!" : "Login Success!");
        setIsLoggedIn(true);
      } else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        showToast(lang === 'id' ? "Link reset telah dikirim!" : "Reset link sent!");
        setAuthMode('login');
      }
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        if (authMode === 'register') setSimulatedName(username);
        showToast(lang === 'id' ? "Mode Demo Aktif ✅" : "Demo Mode Active ✅");
        if (authMode !== 'forgot') setIsLoggedIn(true);
      } else {
        let errorMsg = error.message;
        if (error.code === 'auth/email-already-in-use') errorMsg = lang === 'id' ? "Email terdaftar!" : "Email in use!";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') errorMsg = "Email/Password salah!";
        showToast("⚠️ " + errorMsg);
      }
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!window.PublicKeyCredential) {
      showToast(lang === 'id' ? "Perangkat tidak mendukung Biometrik (WebAuthn)." : "Device doesn't support Biometrics (WebAuthn).");
      return;
    }

    setIsScanningFingerprint(true);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const rpId = window.location.hostname;

      const isRegistered = localStorage.getItem('biometric_registered');

      if (!isRegistered) {
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: { name: "TinyThrive", id: rpId },
            user: { id: userId, name: "user@tinythrive", displayName: "TinyThrive User" },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            authenticatorSelection: { userVerification: "required" },
            timeout: 60000
          }
        });
        
        localStorage.setItem('biometric_registered', 'true');
        showToast(lang === 'id' ? "✅ Sidik Jari didaftarkan! Login berhasil." : "✅ Fingerprint registered! Login success.");
        setIsLoggedIn(true);
      } else {
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            rpId: rpId,
            userVerification: "required",
            timeout: 60000
          }
        });
        showToast(lang === 'id' ? "✅ Biometrik Terverifikasi!" : "✅ Biometrics Verified!");
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Biometric Error:", err);
      showToast(lang === 'id' ? "❌ Verifikasi Biometrik Batal/Gagal." : "❌ Biometric Verification Cancelled/Failed.");
    } finally {
      setIsScanningFingerprint(false);
    }
  };

  const handleSaveProfile = () => {
    saveToCloud({ height, age, targetWeight, genderFocus, location, lang });
    showToast(lang === 'id' ? '✅ Profil disimpan!' : '✅ Profile saved!');
  };

  const toggleHabit = (key) => {
    const newHabits = { ...habits, [key]: !habits[key] };
    setHabits(newHabits);
    saveToCloud({ habits: newHabits });
  };

  const handlePayment = () => {
    let url = MIDTRANS_LINK_BULANAN;
    if (checkoutTier?.id === 'week') url = MIDTRANS_LINK_MINGGUAN;
    if (checkoutTier?.id === 'quarter') url = MIDTRANS_LINK_3BULAN;
    if (checkoutTier?.id === 'promo') url = MIDTRANS_LINK_PROMO;
    
    // Buka link Midtrans
    window.open(url, '_blank');
    
    setIsProcessingPayment(true);
    
    // Simulasi sukses & Penambahan Masa Aktif
    setTimeout(() => {
      // 1. Tentukan berapa hari masa aktif paket yang dipilih
      let activeDays = 30; // Default untuk Bulanan & Promo
      if (checkoutTier?.id === 'week') activeDays = 7;
      if (checkoutTier?.id === 'quarter') activeDays = 90;

      // 2. Hitung tanggal kadaluarsa dalam milidetik (Hari ini + Jumlah Hari)
      const expireDate = Date.now() + (activeDays * 24 * 60 * 60 * 1000);

      setIsProcessingPayment(false); 
      setCheckoutTier(null); 
      setIsPremium(true); 
      
      // 3. Simpan status PRO beserta Tanggal Kadaluarsanya ke Cloud Firebase
      saveToCloud({ isPremium: true, premiumUntil: expireDate });
      
      showToast(`🎉 Pembayaran Berhasil! PRO aktif selama ${activeDays} hari.`);
    }, 2500);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!inputWeight) return;
    const newHistory = [...weightHistory, { id: Date.now(), weight: inputWeight, day: todayDateStr }];
    setWeightHistory(newHistory); setInputWeight(''); saveToCloud({ weightHistory: newHistory });
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    if(!inputWeight || !targetWeight || !height || !age) return showToast("⚠️ Lengkapi data");
    
    const newHistory = [...weightHistory, { id: Date.now(), weight: inputWeight, day: todayDateStr }];
    setWeightHistory(newHistory); setInputWeight('');
    
    let bmr = (10 * parseFloat(inputWeight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
    bmr += (genderFocus === 'pria') ? 5 : -161;
    const tdeeTarget = Math.round((bmr * parseFloat(activityFactor)) - 500);

    saveToCloud({ weightHistory: newHistory, height, targetWeight, age, activityFactor, genderFocus, isOnboardingComplete: true, tdeeTarget });
    setIsOnboardingComplete(true);
  };

  const handleYouTubeClick = (e, query) => {
    e.preventDefault();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareProgress = async () => {
      const textToShare = lang === 'id' 
        ? `Hari ini saya berhasil mencapai ${currentSteps} langkah kaki dan konsisten selama ${streak} hari di TinyThrive! Ayo gabung dan mulai hidup sehatmu.` 
        : `Today I reached ${currentSteps} steps and a ${streak}-day streak on TinyThrive! Join me in living healthier.`;

      if (navigator.share) {
          try { 
              await navigator.share({ title: 'TinyThrive Progress', text: textToShare, url: window.location.href }); 
          } catch (err) { 
              fallbackCopyTextToClipboard(textToShare, lang === 'id' ? "🔗 Teks disalin ke Clipboard!" : "🔗 Text copied to Clipboard!");
          }
      } else {
          fallbackCopyTextToClipboard(textToShare, lang === 'id' ? "🔗 Teks disalin ke Clipboard!" : "🔗 Text copied to Clipboard!");
      }
  };

  // --- FUNGSI GPS TRACKING ---
  const toggleGPSTracking = () => {
    if (isTracking) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
    } else {
      if (!navigator.geolocation) {
        showToast(lang === 'id' ? 'Geolokasi tidak didukung perangkat ini.' : 'Geolocation is not supported.');
        return;
      }
      showToast(lang === 'id' ? '📍 Mencoba mengakses GPS...' : '📍 Accessing GPS...');
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentSteps(prev => {
            const newSteps = prev + Math.floor(Math.random() * 5) + 1;
            saveToCloud({ currentSteps: newSteps });
            return newSteps;
          });
        },
        (err) => {
          showToast(lang === 'id' ? `Akses GPS Ditolak.` : `GPS Access Blocked.`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
      setWatchId(id);
      setIsTracking(true);
    }
  };

  const simulateManualSteps = () => {
    setCurrentSteps(prev => {
      const newSteps = prev + 150;
      saveToCloud({ currentSteps: newSteps });
      return newSteps;
    });
    showToast(lang === 'id' ? '👣 Langkah ditambahkan!' : '👣 Steps added!');
  };

  // --- FITUR: PENCARI DESTINASI 8000 LANGKAH ---
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Jari-jari bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findDestinations = () => {
    if (!navigator.geolocation) {
      showToast(lang === 'id' ? "GPS tidak didukung perangkat ini." : "GPS not supported.");
      return;
    }

    setShowMapModal(true);
    setIsLoadingPOI(true);
    setPoiList([]);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Query ke Overpass API (OpenStreetMap) radius 5600 meter (5.6 km ~ 8000 langkah)
      const query = `
        [out:json];
        (
          node["leisure"~"park|garden"](around:5600,${latitude},${longitude});
          node["shop"~"mall|supermarket"](around:5600,${latitude},${longitude});
          node["tourism"~"museum|attraction|viewpoint"](around:5600,${latitude},${longitude});
          node["amenity"~"cafe|restaurant|marketplace"](around:5600,${latitude},${longitude});
        );
        out 15;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        
        let places = data.elements
          .filter(e => e.tags && e.tags.name) 
          .map(e => {
            const distKm = calculateHaversineDistance(latitude, longitude, e.lat, e.lon);
            const estSteps = Math.round((distKm * 1000) / 0.7); // 1 langkah = 0.7 meter
            
            let type = "Tempat Menarik";
            if (e.tags.leisure) type = "Taman / Rekreasi";
            if (e.tags.shop) type = "Pusat Perbelanjaan";
            if (e.tags.tourism) type = "Wisata";
            if (e.tags.amenity === 'cafe') type = "Kafe";
            if (e.tags.amenity === 'restaurant') type = "Restoran";

            return { id: e.id, name: e.tags.name, type: type, lat: e.lat, lon: e.lon, distKm: distKm.toFixed(1), steps: estSteps };
          });

        places = places.filter(p => parseFloat(p.distKm) > 0.5);
        places.sort((a, b) => b.steps - a.steps);
        setPoiList(places.slice(0, 5));
      } catch (err) {
        console.error("Overpass API Error:", err);
        showToast(lang === 'id' ? "Gagal memuat peta. Coba lagi nanti." : "Failed to load map. Try again.");
      } finally {
        setIsLoadingPOI(false);
      }
    }, (error) => {
      setIsLoadingPOI(false);
      setShowMapModal(false);
      showToast(lang === 'id' ? "Akses GPS ditolak." : "GPS access denied.");
    }, { enableHighAccuracy: true });
  };

  // --- MENU DIET DINAMIS ASEAN ---
  const getActiveMealDB = () => {
    if (location === 'my') return mealDB_my;
    if (location === 'th') return mealDB_th;
    if (location === 'sg') return mealDB_sg;
    if (location === 'ph') return mealDB_ph;
    if (location === 'vn') return mealDB_vn;
    return mealDB_id; // Default
  };
  
  const formatPrice = (price) => {
    if (location === 'id') return `Rp ${price.toLocaleString('id-ID')}`;
    if (location === 'my') return `RM ${price.toFixed(2)}`;
    if (location === 'th') return `฿ ${price.toLocaleString('th-TH')}`;
    if (location === 'sg') return `S$ ${price.toFixed(2)}`;
    if (location === 'ph') return `₱ ${price.toLocaleString('en-PH')}`;
    if (location === 'vn') return `₫ ${price.toLocaleString('vi-VN')}`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Calculations for UI
  const latestWeightValue = weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : null;
  const initialWeightValue = weightHistory.length > 0 ? parseFloat(weightHistory[0].weight) : null;
  const targetWeightValue = targetWeight ? parseFloat(targetWeight) : null;
  const bmiValue = (latestWeightValue && height) ? (latestWeightValue / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : null;
  
  let kgToLose = 0; let freeDays = 0; let proDays = 0; let showPrediction = false;
  if (latestWeightValue && targetWeightValue && latestWeightValue > targetWeightValue) {
      kgToLose = (latestWeightValue - targetWeightValue).toFixed(1);
      freeDays = Math.ceil(kgToLose / 0.05); 
      proDays = Math.ceil(kgToLose / 0.15);
      showPrediction = true;
  }

  let progressPercentage = 0; let progressMessage = ""; let progressColor = "text-blue-500"; let progressBg = "bg-blue-500"; let progressAlertBg = "bg-blue-50 border-blue-100"; let totalLost = 0;
  if (isPremium && initialWeightValue && targetWeightValue && initialWeightValue > targetWeightValue) {
      const totalToLose = initialWeightValue - targetWeightValue;
      totalLost = Math.max(0, initialWeightValue - latestWeightValue);
      progressPercentage = Math.min(100, (totalLost / totalToLose) * 100);
      const daysElapsed = Math.max(1, Math.ceil((Date.now() - new Date(weightHistory[0].id).getTime()) / (1000 * 60 * 60 * 24)));
      const expectedCurrentWeight = initialWeightValue - (daysElapsed * 0.15);

      if (latestWeightValue <= expectedCurrentWeight) {
        progressMessage = lang === 'id' ? `🔥 Hebat! Kecepatan penurunan beratmu melampaui estimasi.` : `🔥 Awesome! Your weight loss speed exceeds the estimation.`;
        progressColor = "text-emerald-600"; progressBg = "bg-emerald-500"; progressAlertBg = "bg-emerald-50 border-emerald-100";
      } else if (latestWeightValue > expectedCurrentWeight + 0.3) {
        progressMessage = lang === 'id' ? `⚠️ Sedikit tertinggal dari PRO. Jangan menyerah, ayo tambah kardio!` : `⚠️ Slightly behind PRO. Add more cardio!`;
        progressColor = "text-orange-600"; progressBg = "bg-orange-500"; progressAlertBg = "bg-orange-50 border-orange-100";
      } else {
        progressMessage = lang === 'id' ? `✅ On Track! Progresmu pas dengan ekspektasi program PRO.` : `✅ On Track! Perfect match with PRO schedule.`;
        progressColor = "text-blue-600"; progressBg = "bg-blue-500"; progressAlertBg = "bg-blue-50 border-blue-100";
      }
  }

  const activeMealDB = getActiveMealDB();
  const displayPrices = getPrices(location);

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body, input, button, select, textarea { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .font-logo { font-family: 'Outfit', sans-serif !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    @keyframes subtle-bounce { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(2px); } }
    .animate-promo { animation: subtle-bounce 3s infinite ease-in-out; }
    @keyframes ping-slow { 75%, 100% { transform: scale(2); opacity: 0; } }
    .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  `;

  if (!isDataLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><EnergyLogo className="animate-bounce text-teal-500 w-12 h-12" /></div>;
  }

  // --- LAYAR LOGIN LENGKAP ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(20,184,166,0.3)] overflow-hidden relative border border-teal-50">
          
          {isScanningFingerprint && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative">
                  <Fingerprint className="w-24 h-24 text-teal-500 animate-pulse" strokeWidth={1} />
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                </div>
                <p className="mt-6 font-black text-slate-800 text-lg tracking-wide uppercase">{lang === 'id' ? 'Memindai Biometrik...' : 'Scanning Biometrics...'}</p>
                <p className="text-xs text-teal-600 font-bold tracking-widest uppercase mt-2">{lang === 'id' ? 'Tahan jari di sensor' : 'Keep finger on sensor'}</p>
                <style>{`
                  @keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                `}</style>
             </div>
          )}

          <button onClick={() => { const newLang = lang === 'id' ? 'en' : 'id'; setLang(newLang); }} className="absolute top-4 right-4 z-10 bg-black/5 hover:bg-black/10 text-slate-600 rounded-full px-3 py-1.5 flex items-center gap-1 text-[10px] font-black backdrop-blur-md transition-all border border-black/5 shadow-sm uppercase tracking-widest">
            <Globe className="w-3 h-3" /> {lang === 'id' ? 'EN' : 'ID'}
          </button>

          <div className="pt-20 pb-12 px-6 text-center bg-gradient-to-b from-teal-50 to-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><EnergyLogo className="w-48 h-48 text-teal-400" /></div>
            <div className="relative z-10">
              <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20 transform -rotate-3 border border-teal-100">
                <EnergyLogo className="w-12 h-12 text-teal-500 transform rotate-3" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter italic text-slate-800 font-logo">TINYTHRIVE</h1>
              <p className="text-teal-600 font-bold text-xs tracking-[0.2em] uppercase">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="px-8 pb-12 bg-white relative z-10">
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div className="relative animate-in slide-in-from-top-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                  <input type="text" required className="w-full bg-teal-50/50 border border-teal-100 px-12 py-4 rounded-2xl text-slate-800 outline-none focus:border-teal-400 focus:bg-white transition placeholder:text-teal-600/50 font-bold" placeholder={t.username} value={username} onChange={e => setUsername(e.target.value)} />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input type="email" required className="w-full bg-teal-50/50 border border-teal-100 px-12 py-4 rounded-2xl text-slate-800 outline-none focus:border-teal-400 focus:bg-white transition placeholder:text-teal-600/50 font-bold" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              {authMode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                  <input type="password" required minLength="6" className="w-full bg-teal-50/50 border border-teal-100 px-12 py-4 rounded-2xl text-slate-800 outline-none focus:border-teal-400 focus:bg-white transition placeholder:text-teal-600/50 font-bold" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              )}
              <button type="submit" disabled={isProcessingAuth} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 tracking-widest italic uppercase">
                {isProcessingAuth ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                 authMode === 'login' ? <><KeyRound className="w-5 h-5"/> {t.loginBtn}</> : 
                 authMode === 'register' ? <><User className="w-5 h-5"/> {t.registerBtn}</> : 
                 <><Mail className="w-5 h-5"/> {t.resetBtn}</>}
              </button>
            </form>

            <div className="mt-5 space-y-3 text-center">
               {authMode === 'login' && (
                 <>
                   <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-slate-400 hover:text-teal-600 transition block w-full">{t.linkToForgot}</button>
                   <button type="button" onClick={() => setAuthMode('register')} className="text-xs font-black text-teal-600 hover:text-teal-700 transition block w-full">{t.linkToRegister}</button>
                 </>
               )}
               {(authMode === 'register' || authMode === 'forgot') && (
                 <button type="button" onClick={() => setAuthMode('login')} className="text-xs font-black text-teal-600 hover:text-teal-700 transition block w-full">{t.linkToLogin}</button>
               )}
            </div>

            {authMode === 'login' && (
              <>
                <div className="relative mt-8 mb-6">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-teal-100"></div></div>
                   <div className="relative flex justify-center text-[10px]"><span className="bg-white px-4 text-teal-600 font-black tracking-widest uppercase">{lang === 'id' ? 'Atau' : 'Or'}</span></div>
                </div>

                <button type="button" onClick={handleBiometricAuth}
                  className="w-full bg-white border-2 border-teal-50 hover:border-teal-200 text-teal-700 font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="p-1.5 bg-teal-50 group-hover:bg-teal-100 rounded-lg transition-colors"><Fingerprint className="w-5 h-5 text-teal-500" /></div>
                  {lang === 'id' ? 'Login via Biometrik' : 'Login via Biometrics'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LAYAR ONBOARDING DATA DIRI ---
  if (isLoggedIn && !isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in slide-in-from-bottom-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100"><Target className="w-8 h-8 text-teal-600" /></div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 italic tracking-tight flex items-center justify-center gap-2">
                   {t.onboardTitle} <Bot className="w-7 h-7 text-teal-500" />
                </h2>
                <p className="text-xs text-slate-500 tracking-wide">{t.onboardDesc}</p>
            </div>
            <form onSubmit={handleCompleteOnboarding} className="space-y-5">
                <div className="flex bg-slate-50/50 rounded-2xl p-2 border border-slate-100 shadow-inner gap-2">
                  <button type="button" onClick={() => setGenderFocus('pria')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-300 ${genderFocus === 'pria' ? 'bg-white shadow-[0_8px_30px_rgba(20,184,166,0.15)] border border-teal-100 text-teal-600 scale-100 ring-1 ring-teal-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 scale-95 border border-transparent'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="10" cy="14" r="5"/><path d="M13.5 10.5 21 3"/><path d="M16 3h5v5"/></svg>
                    <span className="text-[10px] font-black tracking-widest uppercase">{lang === 'id' ? 'Pria' : 'Male'}</span>
                  </button>
                  <button type="button" onClick={() => setGenderFocus('wanita')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-300 ${genderFocus === 'wanita' ? 'bg-white shadow-[0_8px_30px_rgba(20,184,166,0.15)] border border-teal-100 text-teal-600 scale-100 ring-1 ring-teal-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 scale-95 border border-transparent'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="10" r="5"/><path d="M12 15v7"/><path d="M9 19h6"/></svg>
                    <span className="text-[10px] font-black tracking-widest uppercase">{lang === 'id' ? 'Wanita' : 'Female'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t.age}</label>
                        <input type="number" required min="10" max="100" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 font-bold transition" value={age || ''} onChange={e => setAge(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t.height}</label>
                        <input type="number" required min="100" max="250" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 font-bold transition" value={height || ''} onChange={e => setHeight(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{lang === 'id' ? 'Berat Skrg (kg)' : 'Current (kg)'}</label>
                        <input type="number" required step="0.1" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 font-bold transition" value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 block">{t.yourTarget} (kg)</label>
                        <input type="number" required step="0.1" className="w-full p-4 bg-teal-50 rounded-xl outline-none border border-teal-200 focus:border-teal-500 focus:bg-white text-slate-800 font-bold transition" value={targetWeight || ''} onChange={e => setTargetWeight(e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t.activityLevel}</label>
                    <select className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-500 focus:bg-white text-xs font-bold text-slate-700 transition appearance-none" value={activityFactor} onChange={e => setActivityFactor(parseFloat(e.target.value))}>
                        <option value={1.2}>{t.activity1}</option>
                        <option value={1.375}>{t.activity2}</option>
                        <option value={1.55}>{t.activity3}</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-xl shadow-lg shadow-teal-500/30 mt-8 active:scale-95 transition-all tracking-widest italic uppercase flex items-center justify-center gap-2">
                    {lang === 'id' ? 'Buat Program Saya' : 'Generate Program'} <ArrowRight className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    );
  }

  // === MAIN APP RETURN LENGKAP ===
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-24 overflow-x-hidden">
      <style>{globalStyles}</style>
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen">
        
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl z-[300] shadow-2xl text-sm font-bold text-center max-w-[90%] animate-in slide-in-from-top-4 flex items-center gap-2 border border-slate-700">
            <Bell className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="leading-snug">{toastMsg}</span>
          </div>
        )}

        <header className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter italic text-white font-logo">
              <EnergyLogo className="w-6 h-6 text-yellow-300" /> TINYTHRIVE
            </h1>
            {isPremium ? (
               <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm italic tracking-widest">
                 <Star className="w-3 h-3 fill-yellow-900" /> {t.memberPro}
               </span>
            ) : (
               <button onClick={() => setActiveTab('pro')} className="bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black transition tracking-widest text-white italic shadow-sm">GET PRO</button>
            )}
          </div>
          <div className="mt-5 flex justify-between items-end">
            <div>
              <p className="text-teal-50 text-[10px] font-black tracking-widest uppercase mb-1">{t.welcome}</p>
              <p className="text-white font-bold text-lg leading-none">{simulatedName || user?.displayName || email.split('@')[0] || 'Athlete'}</p>
            </div>
            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-inner">
              <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black tracking-widest text-white">{streak} {lang === 'id' ? 'HARI' : 'DAYS'}</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* TAB HOME LENGKAP */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-5 rounded-3xl border border-teal-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-yellow-500 flex-shrink-0"><Lightbulb className="w-6 h-6" /></div>
                <div>
                   <h3 className="font-black text-teal-800 text-sm tracking-wide uppercase mb-1">{t.dailyTip}</h3>
                   <p className="text-xs font-bold text-teal-700 leading-relaxed">{dailyTips[lang][currentDay % dailyTips[lang].length]}</p>
                </div>
              </div>

              {showPrediction && !isPremium && (
                <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-white border-b border-blue-700">
                    <h3 className="font-black text-sm flex items-center gap-2 tracking-wide"><Target className="w-4 h-4 text-yellow-300" /> {t.predictionTitle}</h3>
                    <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-widest">Target: -{kgToLose} kg</p>
                  </div>
                  <div className="p-4 grid grid-cols-2 divide-x divide-slate-100">
                    <div className="pr-3 text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.predictionFree}</p>
                      <p className="text-2xl font-black text-slate-800">{freeDays}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t.daysToTarget}</p>
                    </div>
                    <div className="pl-3 text-center space-y-1">
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex justify-center items-center gap-1"><ArrowRight className="w-3 h-3" /> {t.predictionPro}</p>
                      <p className="text-2xl font-black text-teal-600">{proDays}</p>
                      <p className="text-[10px] font-bold text-teal-400 uppercase">{t.daysToTarget}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('pro')} className="w-full bg-teal-50 text-teal-600 font-black py-4 text-xs hover:bg-teal-100 transition tracking-widest uppercase italic">
                    {lang === 'id' ? 'Lihat Cara Mempercepat' : 'See How to Speed Up'} 🚀
                  </button>
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4 tracking-wide uppercase"><Scale className="w-5 h-5 text-teal-500" /> {t.logWeight}</h2>
                <form onSubmit={handleAddWeight} className="flex gap-2 mb-4">
                  <input type="number" step="0.1" className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-400 transition font-bold text-slate-800" placeholder={t.currentWeightPlaceholder} value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                  <button type="submit" className="bg-slate-900 text-white font-black px-6 rounded-xl hover:bg-slate-800 active:scale-95 transition tracking-widest uppercase text-xs shadow-md">{t.save}</button>
                </form>

                {weightHistory.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.weightHistoryLabel}</p>
                     <div className="space-y-2">
                       {[...weightHistory].reverse().slice(0, 3).map((record, i) => (
                         <div key={record.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <span className="text-xs font-bold text-slate-500">{new Date(record.id).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day:'numeric', month:'short' })}</span>
                           <span className="text-sm font-black text-slate-800">{record.weight} kg</span>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
              </div>

              {/* MISI HARIAN LENGKAP */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-black text-slate-900 text-xl tracking-tighter italic uppercase">{t.dailyMissions}</h3>
                </div>
                
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-500 border border-blue-100"><Droplets className="w-6 h-6" /></div>
                    <div><p className="font-black text-slate-800 tracking-wide">{t.water}</p><p className="text-xs font-bold text-slate-400">{waterCount}/8 {lang === 'id' ? 'Gelas' : 'Glasses'}</p></div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} onClick={() => { setWaterCount(i+1); saveToCloud({waterCount: i+1}); }} className={`w-3 h-6 rounded-md border cursor-pointer transition-all duration-300 ${i < waterCount ? 'bg-blue-500 border-blue-600 scale-110 shadow-sm' : 'bg-slate-100 border-slate-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border transition-colors duration-300 ${habits.sugar ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><Coffee className="w-6 h-6" /></div>
                      <div><p className="font-black text-slate-800 tracking-wide">{t.sugar}</p><p className="text-xs font-bold text-slate-400">{t.sugarDesc}</p></div>
                    </div>
                    <button onClick={() => { const val = !habits.sugar; setHabits({...habits, sugar: val}); saveToCloud({habits: {...habits, sugar: val}}); }} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${habits.sugar ? 'bg-rose-500' : 'bg-slate-200'}`}>
                      <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${habits.sugar ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${habits.sugar ? 'bg-rose-50 border-rose-100/50' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-[10px] leading-relaxed font-medium transition-colors ${habits.sugar ? 'text-rose-600' : 'text-slate-500'}`}>{t.sugarDetail}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500 border border-indigo-100"><Activity className="w-6 h-6" /></div>
                    <div>
                      <p className="font-black text-slate-800 tracking-wide">{t.moveTitle}</p>
                      <p className="text-xs font-bold text-slate-400">Target: {[habits.moveStretch, habits.moveWalk, habits.moveStand].filter(Boolean).length}/3 Selesai</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'moveStretch', yt: '5 minute morning stretch routine' },
                      { key: 'moveWalk', yt: 'benefits of walking 15 minutes after eating' },
                      { key: 'moveStand', yt: 'desk stretch for office workers 1 minute' }
                    ].map(({key, yt}) => (
                      <div key={key} className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${habits[key] ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                          <div onClick={() => toggleHabit(key)} className="flex items-center gap-3 cursor-pointer flex-1">
                            {habits[key] ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                            <span className={`text-sm font-bold transition-all ${habits[key] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t[key]}</span>
                          </div>
                          <button onClick={(e) => handleYouTubeClick(e, yt)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all flex-shrink-0 active:scale-90" title="Tonton Video">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <p className={`text-[10px] pl-8 transition-all leading-relaxed ${habits[key] ? 'text-slate-400' : 'text-slate-500'}`}>{t[key + 'Desc']}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRACKING LANGKAH & MAPS GAMIFICATION */}
                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-6 rounded-3xl shadow-lg space-y-5 overflow-hidden relative text-white">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Activity className="w-32 h-32 text-white" /></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border relative transition-all ${isTracking ? 'bg-white/20 border-white/50 text-white' : 'bg-black/10 border-black/10 text-teal-50'}`}>
                        <Footprints className="w-6 h-6 relative z-10" />
                        {isTracking && <div className="absolute inset-0 bg-white rounded-xl animate-ping opacity-30"></div>}
                      </div>
                      <div>
                        <p className="font-black text-white tracking-wide">{t.steps}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${isTracking ? 'text-yellow-300 animate-pulse' : 'text-teal-100'}`}>
                          <Activity className="w-3 h-3" /> {isTracking ? t.detecting : (lang === 'id' ? 'Sensor Mati' : 'Sensor Off')}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-3xl text-white tracking-tighter italic">{currentSteps.toLocaleString()}</p>
                  </div>
                  
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden relative z-10">
                    <div className="bg-yellow-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ width: `${Math.min(100, (currentSteps/stepTarget)*100)}%` }}></div>
                  </div>

                  <div className="flex gap-2 mt-2 relative z-10">
                    <button onClick={toggleGPSTracking} className={`flex-1 py-3 text-[10px] font-black rounded-xl border uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm italic ${isTracking ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600' : 'bg-white border-teal-100 text-teal-600 hover:bg-teal-50'}`}>
                      <MapPin className={`w-4 h-4 ${isTracking ? 'animate-bounce' : ''}`} />
                      {isTracking ? 'Berhenti' : 'Mulai GPS'}
                    </button>
                    <button onClick={findDestinations} className="flex-1 py-3 text-[10px] font-black rounded-xl bg-yellow-400 text-yellow-900 border border-yellow-300 hover:bg-yellow-300 uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm italic">
                      <Compass className="w-4 h-4" /> {t.findDest}
                    </button>
                  </div>
                  <div className="flex relative z-10 w-full mt-2">
                     <button onClick={simulateManualSteps} className="w-full py-2 text-[10px] font-black rounded-xl border border-white/20 bg-black/10 text-white hover:bg-black/20 uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm italic">
                        <Plus className="w-3 h-3" /> {lang === 'id' ? 'Input Manual (+150)' : 'Manual Input'}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB PRO LENGKAP */}
          {activeTab === 'pro' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {!isPremium ? (
                 <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-xl border border-teal-400">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><EnergyLogo className="w-48 h-48 text-white" /></div>
                    
                    {streak >= 7 && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 rounded-2xl shadow-lg border border-yellow-300 relative z-20 animate-promo mb-6">
                          <h3 className="text-lg font-black italic uppercase text-white drop-shadow-md mb-1">{t.promoTitle}</h3>
                          <p className="text-[10px] font-bold text-yellow-50 mb-4">{t.promoDesc}</p>
                          <button onClick={() => setCheckoutTier({id:'promo', name: 'Promo 30 Hari', price: displayPrices.promo})} className="w-full py-3 bg-white text-orange-600 font-black rounded-xl hover:bg-yellow-50 active:scale-95 transition tracking-widest uppercase text-xs shadow-sm">
                              {t.promoBtn}
                          </button>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="text-center space-y-3 mb-6">
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-white/30 transform rotate-3 backdrop-blur-sm"><Lock className="text-white w-8 h-8 transform -rotate-3" /></div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t.unlockPotential}</h2>
                        <p className="text-teal-50 text-xs font-bold tracking-wide">{t.unlockDesc}</p>
                      </div>
                      <div className="space-y-3 relative z-10">
                        <button onClick={() => setCheckoutTier({id:'week', name:t.tierWeek, price: displayPrices.w})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center hover:bg-black/30 transition shadow-inner">
                          <span className="font-bold tracking-wide">{t.tierWeek}</span><span className="font-black text-yellow-300">{displayPrices.w}</span>
                        </button>
                        <button onClick={() => setCheckoutTier({id:'month', name:t.tierMonth, price: displayPrices.m})} className="w-full p-5 bg-white rounded-xl flex flex-col shadow-[0_10px_20px_rgba(0,0,0,0.15)] transform scale-[1.02] border border-teal-100">
                          <div className="flex justify-between items-center w-full text-slate-900"><span className="font-black tracking-wide">{t.tierMonth}</span><span className="font-black text-xl text-teal-600">{displayPrices.m}</span></div>
                          <span className="text-[10px] font-black text-teal-500 mt-1 uppercase tracking-widest">{t.mostPopular}</span>
                        </button>
                        <button onClick={() => setCheckoutTier({id:'quarter', name:t.tierQuarter, price: displayPrices.q})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl flex flex-col hover:bg-black/30 transition shadow-inner">
                          <div className="flex justify-between items-center w-full"><span className="font-bold tracking-wide">{t.tierQuarter}</span><span className="font-black text-yellow-300">{displayPrices.q}</span></div>
                          <span className="text-[9px] font-bold text-teal-100 mt-0.5 uppercase tracking-widest">{t.bestValue}</span>
                        </button>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {(initialWeightValue && targetWeightValue) && (
                     <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-in slide-in-from-top-4">
                       <h3 className="font-black text-slate-800 flex items-center gap-2 tracking-wide uppercase text-sm"><Target className={`w-4 h-4 ${progressColor}`} /> {t.proProgressTitle}</h3>
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.weightLost}: <span className="text-slate-800 font-black">{totalLost.toFixed(1)} kg</span></p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.remaining}: <span className="text-slate-800 font-black">{Math.max(0, latestWeightValue - targetWeightValue).toFixed(1)} kg</span></p>
                         </div>
                         <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${progressBg} shadow-sm`} style={{ width: `${progressPercentage}%` }}></div>
                         </div>
                       </div>
                       <div className={`p-3 rounded-xl border ${progressAlertBg}`}>
                         <p className={`text-[10px] font-bold ${progressColor} tracking-wide`}>{progressMessage}</p>
                       </div>
                     </div>
                   )}

                   {/* FITUR BARU: TIMER INTERMITTENT FASTING */}
                   <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4">
                     <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none"><Timer className="w-40 h-40 text-white" /></div>
                     <div className="flex justify-between items-center relative z-10 mb-6">
                        <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-wide text-sm"><Timer className="text-teal-400 w-4 h-4" /> {t.fastingTitle}</h3>
                        <span className="text-[9px] bg-teal-500/20 text-teal-300 px-2 py-1 rounded border border-teal-500/30 uppercase tracking-widest font-black">PRO</span>
                     </div>
                     
                     <div className="flex justify-center mb-6 relative z-10">
                        <div className={`w-40 h-40 rounded-full border-[6px] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.1)] transition-all duration-1000 ${isFasting ? 'border-teal-400 bg-teal-900/20' : 'border-slate-700 bg-slate-800/50'}`}>
                           <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{formatFastingTime(fastingDuration)}</span>
                           <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase mt-1 opacity-80">Target: 16 Jam</span>
                        </div>
                     </div>

                     <div className="text-center relative z-10 mb-6">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{lang === 'id' ? 'Fase Tubuh Saat Ini' : 'Current Body Phase'}</p>
                        <p className={`text-xs font-black ${phaseColor} tracking-wide uppercase bg-slate-800 inline-block px-4 py-2 rounded-xl border border-white/5 shadow-inner`}>
                          {fastingPhase}
                        </p>
                     </div>

                     <button onClick={toggleFasting} className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 uppercase tracking-widest transition-all relative z-10 shadow-lg text-xs ${isFasting ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20' : 'bg-teal-500 text-white hover:bg-teal-400'}`}>
                        {isFasting ? <><X className="w-4 h-4"/> {t.stopFasting}</> : <><PlayCircle className="w-4 h-4"/> {t.startFasting}</>}
                     </button>
                   </div>

                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 tracking-wide uppercase text-sm"><Activity className="text-teal-500 w-4 h-4" /> {t.bmiProjection}</h3>
                     {bmiValue ? (
                       <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                         <span className="text-xs font-black text-slate-500 tracking-widest">BMI SCORE</span>
                         <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{bmiValue}</span>
                       </div>
                     ) : <p className="text-[10px] text-rose-500 bg-rose-50 p-4 rounded-xl flex items-start gap-2 font-bold tracking-wide uppercase"><Bell className="w-4 h-4 mt-0.5" /> {t.bmiWarning}</p>}
                   </div>

                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 tracking-wide uppercase text-sm"><Utensils className="text-orange-500 w-4 h-4" /> {t.todayMenu}</h3>
                        <button onClick={() => setMenuVariant(v => v + 1)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 active:rotate-45 transition border border-slate-200"><RefreshCw className="w-4 h-4 text-slate-500" /></button>
                     </div>
                     <div className="space-y-3">
                        {[ 
                          {title: t.breakfast, m: activeMealDB.sarapan[(currentDay + menuVariant) % activeMealDB.sarapan.length]},
                          {title: t.lunch, m: activeMealDB.siang[(currentDay + menuVariant) % activeMealDB.siang.length]},
                          {title: t.dinner, m: activeMealDB.malam[(currentDay + menuVariant) % activeMealDB.malam.length]},
                          {title: t.snack, m: activeMealDB.snack[(currentDay + menuVariant) % activeMealDB.snack.length]}
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">{item.title}</p>
                                <p className="text-sm font-black text-slate-800 leading-tight mb-1">{item.m.menu}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{t.estPrice} <span className="text-slate-600">{formatPrice(item.m.price)}</span></p>
                              </div>
                              <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap shadow-sm mt-1">{item.m.cal} CAL</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200/60">
                               <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(item.m.menu + (lang === 'id' ? ' terdekat' : ' near me'))}`, '_blank')} className="w-full bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-black py-2.5 rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-widest transition shadow-sm active:scale-95">
                                 <MapPin className="w-3.5 h-3.5" /> {t.findResto}
                               </button>
                            </div>
                          </div>
                        ))}
                     </div>

                     {/* FITUR BARU: DAFTAR BELANJA MINGGUAN */}
                     <button onClick={() => { setShowGroceryModal(true); setCheckedGroceries({}); }} className="w-full mt-4 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl flex items-center justify-center gap-3 hover:bg-orange-100 transition-all shadow-sm group">
                        <div className="p-2 bg-orange-500 text-white rounded-lg group-hover:scale-110 transition"><ShoppingCart className="w-4 h-4" /></div>
                        <div className="text-left">
                          <p className="text-xs font-black text-orange-700 uppercase tracking-wide">{t.generateGrocery}</p>
                          <p className="text-[9px] font-bold text-orange-500/80 uppercase tracking-widest">{t.groceryDesc}</p>
                        </div>
                     </button>
                   </div>

                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Dumbbell className="w-32 h-32 text-teal-500" /></div>
                      <h3 className="font-black text-slate-800 flex items-center gap-2 tracking-wide uppercase text-sm relative z-10"><Dumbbell className="text-teal-500 w-4 h-4" /> {t.homeWorkout}</h3>
                      <div className="p-5 bg-teal-50 rounded-xl border border-teal-100 relative z-10 shadow-sm">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t.focusDay}</p>
                        <p className="text-xl font-black text-teal-900 italic tracking-tighter">{workoutSchedules[genderFocus][currentDay % 7].focus[lang]}</p>
                      </div>
                      <div className="space-y-4 relative z-10 mt-2">
                        {workoutSchedules[genderFocus][currentDay % 7].exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex-1 pr-4">
                              <p className="text-sm font-black text-slate-800 tracking-wide mb-1 uppercase">{ex.name[lang]}</p>
                              <p className="text-xs font-bold text-slate-500 leading-snug mb-2">{ex.desc[lang]}</p>
                              <p className="text-[10px] text-teal-600 font-black tracking-widest">{ex.time} <span className="text-slate-300 px-1">•</span> {ex.cal} CAL</p>
                            </div>
                            <button onClick={(e) => handleYouTubeClick(e, ex.name.en + " workout tutorial form")} className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-500 hover:text-white hover:scale-105 active:scale-95 transition flex items-center justify-center flex-shrink-0 shadow-sm">
                              <PlayCircle className="w-5 h-5 ml-0.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* EVENT OLAHRAGA (EKSKLUSIF PRO) */}
                   <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:bg-slate-50 transition" onClick={() => window.open(`https://news.google.com/search?q=marathon+OR+triathlon+OR+ironman+event+${locNameMap[location]}`, '_blank')}>
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-orange-50 rounded-xl text-orange-500 shadow-sm"><Award className="w-6 h-6" /></div>
                       <div>
                         <p className="font-black text-slate-800 tracking-wide text-sm">{t.sportsEventText} {locNameMap[location].toUpperCase()}</p>
                         <p className="text-[10px] font-bold text-slate-400">{lang === 'id' ? 'Cek jadwal Marathon, Triathlon & Ironman!' : 'Check upcoming Marathon, Triathlon & Ironman events!'}</p>
                       </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-400" />
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* TAB PROFIL LENGKAP */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <button onClick={shareProgress} className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 active:scale-95 transition-all tracking-widest uppercase italic">
                   <Share2 className="w-5 h-5" /> {t.shareTitle}
               </button>

               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <h2 className="font-black text-lg text-slate-800 flex items-center gap-2 tracking-wide uppercase"><Settings className="text-slate-400 w-5 h-5 inline" /> {t.settingsTitle}</h2>
                 
                 <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.langLabel}</label>
                        <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                          <button onClick={() => { setLang('id'); saveToCloud({ lang: 'id' }); }} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${lang === 'id' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>IDN</button>
                          <button onClick={() => { setLang('en'); saveToCloud({ lang: 'en' }); }} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${lang === 'en' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>ENG</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.locationLabel}</label>
                        <select className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:border-teal-400 transition" value={location} onChange={e => { setLocation(e.target.value); saveToCloud({location: e.target.value}); }}>
                          <option value="id">🇮🇩 Indonesia</option>
                          <option value="vn">🇻🇳 Vietnam</option>
                          <option value="my">🇲🇾 Malaysia</option>
                          <option value="sg">🇸🇬 Singapura</option>
                          <option value="th">🇹🇭 Thailand</option>
                          <option value="ph">🇵🇭 Filipina</option>
                        </select>
                    </div>

                    <div className="flex bg-slate-50/50 rounded-2xl p-2 border border-slate-100 shadow-inner gap-2">
                      <button type="button" onClick={() => setGenderFocus('pria')} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${genderFocus === 'pria' ? 'bg-white shadow-sm border border-teal-100 text-teal-600 ring-1 ring-teal-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 border border-transparent'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="10" cy="14" r="5"/><path d="M13.5 10.5 21 3"/><path d="M16 3h5v5"/></svg>
                        <span className="text-[10px] font-black tracking-widest uppercase">MALE</span>
                      </button>
                      <button type="button" onClick={() => setGenderFocus('wanita')} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${genderFocus === 'wanita' ? 'bg-white shadow-sm border border-teal-100 text-teal-600 ring-1 ring-teal-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 border border-transparent'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="10" r="5"/><path d="M12 15v7"/><path d="M9 19h6"/></svg>
                        <span className="text-[10px] font-black tracking-widest uppercase">FEMALE</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.height}</label>
                          <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-400 transition font-bold text-slate-800" value={height || ''} onChange={e => setHeight(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.age}</label>
                          <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-400 transition font-bold text-slate-800" value={age || ''} onChange={e => setAge(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.yourTarget}</label>
                        <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-teal-400 transition font-bold text-slate-800" value={targetWeight || ''} onChange={e => setTargetWeight(e.target.value)} />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.syncCalendar}</p>
                   <div className="flex gap-2">
                     <button onClick={() => {
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=TinyThrive+Workout&details=Waktunya%20menghancurkan%20kalori!&dates=${todayDateStr.replace(/-/g,'')}T170000Z/${todayDateStr.replace(/-/g,'')}T180000Z`;
                        window.open(url, '_blank');
                     }} className="flex-1 py-3.5 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] hover:bg-blue-100 transition flex items-center justify-center gap-2 uppercase tracking-widest">
                       <CalendarPlus className="w-4 h-4" /> Google
                     </button>
                     <button onClick={() => {
                        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:TinyThrive Workout\nDESCRIPTION:Waktunya olahraga!\nDTSTART:${todayDateStr.replace(/-/g,'')}T170000Z\nDTEND:${todayDateStr.replace(/-/g,'')}T180000Z\nEND:VEVENT\nEND:VCALENDAR`;
                        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.setAttribute('download', 'TinyThrive_Reminder.ics');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                     }} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-black rounded-xl text-[10px] hover:bg-slate-200 transition flex items-center justify-center gap-2 uppercase tracking-widest">
                       <Calendar className="w-4 h-4" /> Apple
                     </button>
                   </div>
                 </div>

                 <button onClick={handleSaveProfile} className="w-full py-4 bg-slate-900 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition tracking-widest uppercase">
                   <Save className="w-4 h-4" /> {t.saveProfile}
                 </button>
                 
                 <button onClick={() => { setIsLoggedIn(false); setAuthMode('login'); }} className="w-full py-4 text-rose-500 font-black bg-rose-50 hover:bg-rose-100 rounded-2xl active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                   <LogOut className="w-4 h-4" /> LOGOUT ACCOUNT
                 </button>
               </div>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t px-6 py-3 flex justify-around items-center z-50">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-teal-600 scale-110' : 'text-slate-400 hover:text-slate-500'} transition-all`}><Home className={`w-5 h-5 mb-1 ${activeTab === 'home' ? 'fill-teal-100' : ''}`} /></button>
          <button onClick={() => setActiveTab('pro')} className={`p-4 rounded-full -mt-10 shadow-xl transition-all ${activeTab === 'pro' ? 'bg-teal-500 text-white scale-110 shadow-[0_10px_20px_rgba(20,184,166,0.3)]' : 'bg-slate-900 text-teal-400'}`}><Star className={`w-6 h-6 ${activeTab === 'pro' ? 'fill-white' : ''}`} /></button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-teal-600 scale-110' : 'text-slate-400 hover:text-slate-500'} transition-all`}><UserCircle className={`w-5 h-5 mb-1 ${activeTab === 'profile' ? 'fill-teal-100' : ''}`} /></button>
        </nav>

        {/* MODAL DAFTAR BELANJA (GROCERY LIST) */}
        {showGroceryModal && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end justify-center p-0 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-6 space-y-6 animate-in slide-in-from-bottom-full duration-500 max-h-[85vh] overflow-y-auto no-scrollbar">
               <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
                 <h3 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2"><ListChecks className="w-6 h-6 text-orange-500" /> {t.groceryTitle}</h3>
                 <button onClick={() => setShowGroceryModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-4">
                   {lang === 'id' ? 'Estimasi kebutuhan bahan makanan minggu ini berdasarkan region Anda.' : 'Estimated weekly grocery needs based on your region.'}
                 </p>
                 {getGroceryItems().map((item, idx) => (
                    <div key={idx} onClick={() => setCheckedGroceries(prev => ({...prev, [idx]: !prev[idx]}))} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-orange-200 transition-all">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checkedGroceries[idx] ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                         {checkedGroceries[idx] && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-black transition-all ${checkedGroceries[idx] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item}</span>
                    </div>
                 ))}
               </div>

               <button onClick={() => { 
                 fallbackCopyTextToClipboard(getGroceryItems().join('\n'), lang === 'id' ? 'Daftar belanja disalin!' : 'List copied!');
               }} className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm transition active:scale-95">
                 <Share2 className="w-4 h-4" /> {lang === 'id' ? 'Salin Daftar (Teks)' : 'Copy List (Text)'}
               </button>
            </div>
          </div>
        )}

        {/* MODAL DESTINASI MAPS */}
        {showMapModal && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end justify-center p-0 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-6 space-y-6 animate-in slide-in-from-bottom-full duration-500 max-h-[85vh] overflow-y-auto no-scrollbar">
               <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-2">
                 <h3 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2"><Map className="w-5 h-5 text-teal-500" /> {t.destTitle}</h3>
                 <button onClick={() => setShowMapModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
               </div>
               
               {isLoadingPOI ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="relative flex items-center justify-center mb-6">
                      <div className="absolute w-20 h-20 bg-teal-200 rounded-full animate-ping-slow"></div>
                      <Compass className="w-10 h-10 text-teal-600 relative z-10 animate-spin" />
                   </div>
                   <p className="text-sm font-bold text-slate-500 animate-pulse">{t.scanning}</p>
                 </div>
               ) : poiList.length === 0 ? (
                 <div className="text-center py-8 text-slate-500 font-bold text-sm bg-slate-50 rounded-2xl border border-slate-100">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    {t.noDest}
                 </div>
               ) : (
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest text-center mb-2">Rekomendasi Berdasarkan Lokasi Anda</p>
                    {poiList.map((poi, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{poi.type}</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">{poi.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-teal-600 italic">{poi.steps.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Langkah</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Jarak: {poi.distKm} km</span>
                          <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`, '_blank')} className="bg-teal-500 hover:bg-teal-400 text-white text-[10px] font-black py-2 px-4 rounded-lg flex items-center gap-1 uppercase tracking-widest shadow-sm active:scale-95 transition">
                            <Navigation className="w-3 h-3" /> {t.openMap}
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* MODAL CHECKOUT MIDTRANS */}
        {checkoutTier && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end justify-center p-0 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 uppercase italic">{t.checkoutTitle}</h3>
                 <button onClick={() => setCheckoutTier(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Plus className="w-6 h-6 transform rotate-45" /></button>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-teal-500/30 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-[10px] font-black text-teal-600 uppercase mb-1">Selected Plan</p>
                    <p className="text-lg font-black text-slate-800 uppercase">{checkoutTier.name}</p>
                  </div>
                  <p className="text-2xl font-black text-teal-500 italic">{checkoutTier.price}</p>
               </div>
               
               {location !== 'id' && (
                 <p className="text-[10px] text-center text-slate-500 font-bold italic px-4 bg-slate-50 py-2 rounded-lg border border-slate-100">
                   <Bell className="w-3 h-3 inline mr-1 mb-0.5 text-orange-400" /> {t.billedInIDR}
                 </p>
               )}

               <button onClick={handlePayment} disabled={isProcessingPayment} className="w-full py-5 bg-teal-600 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 uppercase italic">
                 {isProcessingPayment ? <RefreshCw className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-6 h-6" />}
                 {isProcessingPayment ? t.processing : t.payNow}
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
