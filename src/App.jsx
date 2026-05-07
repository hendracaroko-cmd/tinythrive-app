import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Lock, Star, Droplets, Footprints, Utensils, ArrowRight, Zap, User, LogOut, Scale, Bell, Activity, Coffee, Dumbbell, Flame, Calendar, Target, MapPin, Globe, Award, PlayCircle, Home, UserCircle, Settings, CalendarPlus, RefreshCw, ShieldCheck, Save, FastForward, Share2, Plus, Fingerprint } from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const appIdRaw = typeof __app_id !== 'undefined' ? __app_id : 'tinythrive-v1';
const appId = appIdRaw.replace(/\//g, '_');

// --- DATABASE KONTEN OLAHRAGA ---
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
      { name: {id: "Squat Jumps", en: "Squat Jumps"}, desc: {id: "Dari posisi jongkok, lompat ke atas sekuat tenaga", en: "From squat position, jump up forcefully"}, cal: 60, time: "3 Set x 12" }, 
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

// --- DATABASE MAKANAN ---
const mealDB_id = {
  sarapan: [ { menu: "Roti Gandum Alpukat & Telur", cal: 320, price: 15000 }, { menu: "Oatmeal Pisang & Kacang", cal: 300, price: 12000 }, { menu: "Smoothie Bowl Buah Naga", cal: 350, price: 18000 }, { menu: "Telur Orak-Arik Tomat", cal: 280, price: 8000 }, { menu: "Pancake Oat Pisang", cal: 350, price: 15000 }, { menu: "Sandwich Dada Ayam", cal: 330, price: 16000 }, { menu: "Ubi Rebus & Yoghurt", cal: 250, price: 10000 } ],
  siang: [ { menu: "Nasi Merah & Ikan Bakar", cal: 500, price: 25000 }, { menu: "Gado-Gado & Telur Rebus", cal: 450, price: 20000 }, { menu: "Nasi Merah & Soto Bening Ayam", cal: 480, price: 25000 }, { menu: "Shirataki Goreng Sayur", cal: 400, price: 30000 }, { menu: "Dada Ayam Panggang & Kentang", cal: 520, price: 35000 }, { menu: "Nasi Merah & Sapi Lada Hitam", cal: 550, price: 35000 }, { menu: "Sup Ayam Jagung Manis", cal: 350, price: 20000 } ],
  malam: [ { menu: "Salad Sayur & Telur Rebus", cal: 250, price: 15000 }, { menu: "Sapo Tahu Brokoli", cal: 380, price: 28000 }, { menu: "Tumis Dada Ayam Sayur", cal: 420, price: 26000 }, { menu: "Ikan Dori Panggang Teflon", cal: 300, price: 25000 }, { menu: "Capcay Kuah Bakso Sapi", cal: 400, price: 24000 }, { menu: "Dada Ayam Rebus & Bayam", cal: 300, price: 20000 }, { menu: "Sup Sayur Tahu Telur", cal: 280, price: 12000 } ],
  snack: [ { menu: "Yoghurt & Buah Naga", cal: 150, price: 12000 }, { menu: "Edamame Rebus", cal: 120, price: 8000 }, { menu: "Pisang Panggang Kayu Manis", cal: 180, price: 6000 }, { menu: "Apel & Kacang Almond", cal: 200, price: 15000 }, { menu: "Jeruk Segar (2 Buah)", cal: 100, price: 5000 }, { menu: "Mangga Potong Dingin", cal: 150, price: 10000 }, { menu: "Kacang Tanah Rebus", cal: 180, price: 7000 } ]
};

const mealDB_en = {
  sarapan: [ { menu: "Avocado Egg Sourdough Toast", cal: 320, price: 6.50 }, { menu: "Banana Walnut Oatmeal", cal: 300, price: 4.00 }, { menu: "Mixed Berry Smoothie Bowl", cal: 350, price: 7.50 }, { menu: "Scrambled Eggs & Tomatoes", cal: 280, price: 3.50 }, { menu: "Protein Oat Pancakes", cal: 350, price: 6.00 }, { menu: "Grilled Chicken Sandwich", cal: 330, price: 5.50 }, { menu: "Sweet Potato & Greek Yogurt", cal: 250, price: 4.50 } ],
  siang: [ { menu: "Brown Rice & Grilled Salmon", cal: 500, price: 14.00 }, { menu: "Quinoa Salad & Boiled Eggs", cal: 450, price: 9.50 }, { menu: "Chicken Clear Soup & Rice", cal: 480, price: 8.00 }, { menu: "Veggie Shirataki Noodles", cal: 400, price: 11.00 }, { menu: "Roasted Chicken & Potatoes", cal: 520, price: 12.50 }, { menu: "Beef & Broccoli Stir-fry", cal: 550, price: 13.00 }, { menu: "Chicken Corn Chowder", cal: 350, price: 7.00 } ],
  malam: [ { menu: "Fresh Garden Salad & Egg", cal: 250, price: 6.00 }, { menu: "Tofu & Broccoli Stew", cal: 380, price: 9.00 }, { menu: "Chicken Breast Veggie Sauté", cal: 420, price: 10.50 }, { menu: "Pan-seared Dory Fish", cal: 300, price: 11.00 }, { menu: "Mixed Veggie & Meatball Soup", cal: 400, price: 8.50 }, { menu: "Boiled Chicken & Spinach", cal: 300, price: 7.50 }, { menu: "Clear Tofu & Veggie Soup", cal: 280, price: 5.00 } ],
  snack: [ { menu: "Greek Yogurt & Dragon Fruit", cal: 150, price: 4.50 }, { menu: "Steamed Edamame", cal: 120, price: 3.00 }, { menu: "Cinnamon Baked Banana", cal: 180, price: 2.50 }, { menu: "Apple Slices & Almonds", cal: 200, price: 5.00 }, { menu: "Fresh Oranges (2 pcs)", cal: 100, price: 2.00 }, { menu: "Chilled Mango Slices", cal: 150, price: 3.50 }, { menu: "Roasted Peanuts", cal: 180, price: 2.00 } ]
};

const mealDB_asia = {
  sarapan: [ { menu: "Matcha Oatmeal & Fruits", cal: 300, price: 5.00 }, { menu: "Soft Boiled Eggs & Soy Sauce", cal: 250, price: 3.00 }, { menu: "Congee with Lean Chicken", cal: 320, price: 4.50 }, { menu: "Tamagoyaki & Miso Soup", cal: 280, price: 5.50 }, { menu: "Steamed Sweet Potato", cal: 220, price: 2.50 }, { menu: "Soy Milk & Whole Grain Bun", cal: 290, price: 3.50 }, { menu: "Tofu Salad with Sesame", cal: 260, price: 4.00 } ],
  siang: [ { menu: "Chicken Teriyaki & Brown Rice", cal: 500, price: 8.50 }, { menu: "Vietnamese Pho (Chicken)", cal: 450, price: 9.00 }, { menu: "Sushi Rolls (Tuna/Salmon)", cal: 480, price: 12.00 }, { menu: "Pad Thai with Tofu", cal: 420, price: 8.00 }, { menu: "Bibimbap (Less Rice)", cal: 520, price: 10.00 }, { menu: "Indian Yellow Dal & Roti", cal: 400, price: 7.50 }, { menu: "Stir-fried Bok Choy & Beef", cal: 450, price: 9.50 } ],
  malam: [ { menu: "Sashimi Salad", cal: 300, price: 11.00 }, { menu: "Steamed Fish with Ginger", cal: 350, price: 10.00 }, { menu: "Chicken Satay (No Skin)", cal: 380, price: 7.00 }, { menu: "Kimchi Soup with Tofu", cal: 320, price: 8.50 }, { menu: "Tom Yum Seafood Clear Soup", cal: 300, price: 9.50 }, { menu: "Mapo Tofu (Less Oil)", cal: 400, price: 7.50 }, { menu: "Garlic Spinach & Egg", cal: 250, price: 5.00 } ],
  snack: [ { menu: "Edamame", cal: 120, price: 3.00 }, { menu: "Roasted Seaweed", cal: 50, price: 2.00 }, { menu: "Baozi (Veggie)", cal: 180, price: 2.50 }, { menu: "Sliced Papaya", cal: 100, price: 3.00 }, { menu: "Matcha Greek Yogurt", cal: 150, price: 4.00 }, { menu: "Roasted Chestnuts", cal: 200, price: 5.00 }, { menu: "Rice Crackers", cal: 110, price: 2.00 } ]
};

const mealDB_eu = {
  sarapan: [ { menu: "Greek Yogurt & Honey", cal: 280, price: 5.50 }, { menu: "French Omelette & Spinach", cal: 320, price: 6.00 }, { menu: "Muesli with Cold Milk", cal: 300, price: 4.50 }, { menu: "Smoked Salmon Toast", cal: 350, price: 8.00 }, { menu: "English Breakfast (Light)", cal: 400, price: 9.00 }, { menu: "Croissant & Black Coffee", cal: 250, price: 4.00 }, { menu: "Boiled Eggs & Asparagus", cal: 200, price: 5.00 } ],
  siang: [ { menu: "Mediterranean Quinoa Salad", cal: 450, price: 10.00 }, { menu: "Grilled Lemon Herb Chicken", cal: 500, price: 12.00 }, { menu: "Whole Wheat Pasta Primavera", cal: 480, price: 11.00 }, { menu: "Nicoise Salad", cal: 400, price: 13.00 }, { menu: "Spanish Paella (Seafood)", cal: 550, price: 15.00 }, { menu: "Ratatouille & Sourdough", cal: 350, price: 9.50 }, { menu: "Swedish Meatballs (Lean)", cal: 500, price: 12.50 } ],
  malam: [ { menu: "Caprese Salad", cal: 300, price: 8.50 }, { menu: "Baked Cod with Olive Oil", cal: 350, price: 14.00 }, { menu: "Chicken Souvlaki", cal: 380, price: 10.50 }, { menu: "Minestrone Soup", cal: 280, price: 7.00 }, { menu: "Zucchini Noodles & Pesto", cal: 320, price: 9.00 }, { menu: "Roast Beef & Root Veggies", cal: 450, price: 15.00 }, { menu: "Gazpacho (Cold Soup)", cal: 200, price: 6.00 } ],
  snack: [ { menu: "Olive & Feta Cheese", cal: 180, price: 4.50 }, { menu: "Almonds & Walnuts", cal: 200, price: 5.00 }, { menu: "Grapes & Sliced Cheese", cal: 150, price: 4.00 }, { menu: "Dark Chocolate (70%)", cal: 150, price: 3.00 }, { menu: "Biscotti & Tea", cal: 120, price: 3.50 }, { menu: "Hummus & Carrot Sticks", cal: 160, price: 4.00 }, { menu: "Tzatziki & Pita Bites", cal: 190, price: 5.00 } ]
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
    reportCard: "Laporan Hari Ini",
    tabHome: "Beranda",
    tabPro: "Program",
    tabProfile: "Profil",
    settingsTitle: "Pengaturan Profil",
    syncCalendar: "Setel Alarm Kalender (Hari Ini)",
    syncCalendarDesc: "Buat pengingat otomatis di kalender HP-mu.",
    stepTargetLabel: "Target Langkah",
    changeMenu: "Ganti Variasi Menu",
    checkoutTitle: "Pilih Metode Pembayaran",
    payNow: "Lanjutkan ke Pembayaran",
    processing: "Memproses...",
    saveProfile: "Simpan Profil",
    savedAlert: "Profil Tersimpan!",
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
    mostPopular: "PALING POPULER",
    bestValue: "PILIHAN TERBAIK",
    detecting: "Mendeteksi...",
    sevenDayGraph: "Grafik 7 Hari",
    predictionTitle: "Prediksi Pencapaian Target 🚀",
    predictionFree: "Jalur Gratis",
    predictionPro: "Jalur PRO",
    daysToTarget: "hari",
    kgLeft: "kg lagi",
    proProgressTitle: "Progres Target Anda 🎯",
    weightLost: "Turun",
    remaining: "Sisa",
    shareTitle: "Bagikan Pencapaian 🚀"
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
    resetSim: "Reset",
    weightJourney: "Weight Journey",
    yourTarget: "Your Target",
    timePrediction: "Time Prediction",
    freeTrack: "Free Track",
    freeDesc: "Basic habit tracking only",
    proTrack: "PRO Track",
    proDesc: "Structured Diet + Special Exercise",
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
    reportCard: "Today's Report",
    tabHome: "Home",
    tabPro: "Program",
    tabProfile: "Profile",
    settingsTitle: "Profile Settings",
    syncCalendar: "Set Calendar Alarm (Today)",
    syncCalendarDesc: "Auto-reminders on your phone calendar.",
    stepTargetLabel: "Step Target",
    changeMenu: "Change Menu Variation",
    checkoutTitle: "Choose Payment Method",
    payNow: "Continue to Payment",
    processing: "Processing...",
    saveProfile: "Save Profile",
    savedAlert: "Profile Saved!",
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
    mostPopular: "MOST POPULAR",
    bestValue: "BEST VALUE",
    detecting: "Detecting...",
    sevenDayGraph: "7-Day Graph",
    predictionTitle: "Target Prediction 🚀",
    predictionFree: "Free Track",
    predictionPro: "PRO Track",
    daysToTarget: "days",
    kgLeft: "kg left",
    proProgressTitle: "Your Target Progress 🎯",
    weightLost: "Lost",
    remaining: "Remaining",
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPremium, setIsPremium] = useState(false);
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
  const [location, setLocation] = useState('id'); 
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
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
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
            lastLoginDate: todayDateStr,
            waterCount: 0,
            currentSteps: 0,
            habits: { sugar: false },
            streak: d.streak ? d.streak + 1 : 1 
          };
          saveToCloud(resetData);
          setWaterCount(0);
          setCurrentSteps(0);
          setHabits({ sugar: false });
          setStreak(resetData.streak);
        } else {
          if (d.waterCount !== undefined) setWaterCount(d.waterCount);
          if (d.currentSteps !== undefined) setCurrentSteps(d.currentSteps);
          if (d.habits) setHabits(d.habits);
          if (d.streak !== undefined) setStreak(d.streak);
        }

        if (d.weightHistory) setWeightHistory(d.weightHistory);
        if (d.isPremium !== undefined) setIsPremium(d.isPremium);
        if (d.height) setHeight(d.height);
        if (d.age) setAge(d.age);
        if (d.activityFactor) setActivityFactor(d.activityFactor);
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.stepTarget) setStepTarget(d.stepTarget);
        if (d.genderFocus) setGenderFocus(d.genderFocus);
        if (d.location) setLocation(d.location);
        if (d.lang) setLang(d.lang);
        if (d.isOnboardingComplete !== undefined) setIsOnboardingComplete(d.isOnboardingComplete);
        
        if (!d.lastLoginDate) saveToCloud({ lastLoginDate: todayDateStr });

      } else {
        saveToCloud({ streak: 1, isPremium: false, lang: 'id', location: 'id', habits: { sugar: false }, lastLoginDate: todayDateStr, isOnboardingComplete: false });
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
    } catch (e) {
      console.error("Cloud Save Error:", e);
    }
  };

  const handleSaveProfile = () => {
    saveToCloud({ height, age, targetWeight, genderFocus, location, lang });
    showToast(lang === 'id' ? '✅ Profil berhasil disimpan!' : '✅ Profile successfully saved!');
  };

  const handlePayment = () => {
    let url = ADMIN_LINK_BULANAN;
    if (checkoutTier?.id === 'week') url = ADMIN_LINK_MINGGUAN;
    if (checkoutTier?.id === 'quarter') url = ADMIN_LINK_3BULAN;
    window.open(url, '_blank');
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutTier(null);
      setIsPremium(true);
      saveToCloud({ isPremium: true });
    }, 2500);
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

  const toggleGPSTracking = () => {
    if (isTracking) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setLastLocation(null);
    } else {
      if (!navigator.geolocation) {
        showToast(lang === 'id' ? 'Geolokasi tidak didukung oleh browser Anda.' : 'Geolocation not supported.');
        return;
      }
      showToast(lang === 'id' ? '📍 Mencoba akses GPS... Pastikan layar tetap menyala.' : '📍 Trying to access GPS... Keep screen active.');

      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; 
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLastLocation(prevLoc => {
            if (prevLoc) {
              const distMeters = calculateDistance(prevLoc.lat, prevLoc.lon, latitude, longitude);
              if (distMeters > 3) {
                const userHeight = height ? parseFloat(height) : 165;
                const stepLengthMeters = (userHeight * 0.414) / 100;
                const estimatedSteps = Math.round(distMeters / stepLengthMeters);
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
          console.error("GPS Error:", err);
          showToast(lang === 'id' ? `Akses GPS Ditolak: ${err.message}. Gunakan Simulasi Manual.` : `GPS Blocked: ${err.message}. Use manual simulation.`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
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
    showToast(lang === 'id' ? '👣 Langkah ditambahkan secara manual!' : '👣 Steps added manually!');
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    if(!inputWeight || !targetWeight || !height || !age) {
        showToast(lang === 'id' ? "⚠️ Mohon lengkapi semua data" : "⚠️ Please complete all data");
        return;
    }
    
    const newRecord = { id: Date.now(), weight: inputWeight, day: todayDateStr };
    const newHistory = [...weightHistory, newRecord];
    setWeightHistory(newHistory);
    setInputWeight('');
    
    // Calculate TDEE
    let bmr = (10 * parseFloat(inputWeight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
    bmr += (genderFocus === 'pria') ? 5 : -161;
    const tdeeTarget = Math.round((bmr * parseFloat(activityFactor)) - 500);

    saveToCloud({ 
        weightHistory: newHistory, 
        height, targetWeight, age, activityFactor, genderFocus, 
        isOnboardingComplete: true,
        tdeeTarget
    });
    setIsOnboardingComplete(true);
  };

  const shareProgress = async () => {
      const textToShare = lang === 'id' 
        ? `Hari ini saya berhasil mencapai ${currentSteps} langkah kaki dan konsisten selama ${streak} hari di TinyThrive! Ayo gabung dan mulai hidup sehatmu.` 
        : `Today I reached ${currentSteps} steps and a ${streak}-day streak on TinyThrive! Join me in living healthier.`;

      if (navigator.share) {
          try { 
              await navigator.share({ title: 'TinyThrive Progress', text: textToShare, url: window.location.href }); 
          } catch (err) { 
              fallbackCopyTextToClipboard(textToShare, lang === 'id' ? "🔗 Browser memblokir Share. Teks disalin ke Clipboard!" : "🔗 Browser blocked Share. Text copied to Clipboard!");
          }
      } else {
          fallbackCopyTextToClipboard(textToShare, lang === 'id' ? "🔗 Fitur Share tidak didukung. Teks disalin ke Clipboard!" : "🔗 Share not supported. Text copied to Clipboard!");
      }
  };

  const handleYouTubeClick = (e, query) => {
    e.preventDefault();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    fallbackCopyTextToClipboard(url, lang === 'id' ? "🎬 Link YouTube disalin ke Clipboard! (Jika pop-up diblokir)" : "🎬 YouTube link copied! (If popup was blocked)");
  };

  const getActiveMealDB = () => {
    if (location === 'asia') return mealDB_asia;
    if (location === 'eu') return mealDB_eu;
    if (location === 'us') return mealDB_en;
    return mealDB_id;
  };
  const activeMealDB = getActiveMealDB();
  const formatPrice = (price) => location === 'id' ? `Rp ${price.toLocaleString('id-ID')}` : `$${price.toFixed(2)}`;

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

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    body, * { font-family: 'Outfit', sans-serif !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  // === RENDER METHODS ===
  
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Zap className="animate-bounce text-teal-500 w-12 h-12" />
      </div>
    );
  }

  // --- LAYAR LOGIN (CLEAN BRIGHT SPORTY) ---
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

          <button onClick={() => { const newLang = lang === 'id' ? 'en' : 'id'; setLang(newLang); saveToCloud({lang: newLang}); }} className="absolute top-4 right-4 z-10 bg-black/5 hover:bg-black/10 text-slate-600 rounded-full px-3 py-1.5 flex items-center gap-1 text-[10px] font-black backdrop-blur-md transition-all border border-black/5 shadow-sm uppercase tracking-widest">
            <Globe className="w-3 h-3" /> {lang === 'id' ? 'EN' : 'ID'}
          </button>
          
          <div className="pt-20 pb-12 px-6 text-center bg-gradient-to-b from-teal-50 to-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><Zap className="w-48 h-48 text-teal-400" /></div>
            
            <div className="relative z-10">
              <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20 transform -rotate-3 border border-teal-100">
                <Zap className="w-12 h-12 text-teal-500 fill-teal-500 transform rotate-3" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter italic text-slate-800">TINYTHRIVE</h1>
              <p className="text-teal-600 font-bold text-xs tracking-[0.2em] uppercase">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="px-8 pb-12 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input type="email" required className="w-full bg-teal-50/50 border border-teal-100 px-12 py-4 rounded-2xl text-slate-800 outline-none focus:border-teal-400 focus:bg-white transition placeholder:text-teal-600/50 font-bold" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input type="password" required className="w-full bg-teal-50/50 border border-teal-100 px-12 py-4 rounded-2xl text-slate-800 outline-none focus:border-teal-400 focus:bg-white transition placeholder:text-teal-600/50 font-bold" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 tracking-widest italic uppercase">
                {t.loginBtn} <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="relative mt-8 mb-6">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-teal-100"></div></div>
               <div className="relative flex justify-center text-[10px]"><span className="bg-white px-4 text-teal-600 font-black tracking-widest uppercase">{lang === 'id' ? 'Atau' : 'Or'}</span></div>
            </div>

            <button type="button" onClick={() => {
                setIsScanningFingerprint(true);
                setTimeout(() => { setIsLoggedIn(true); setIsScanningFingerprint(false); }, 2000);
              }}
              className="w-full bg-white border-2 border-teal-50 hover:border-teal-200 text-teal-700 font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <div className="p-1.5 bg-teal-50 group-hover:bg-teal-100 rounded-lg transition-colors"><Fingerprint className="w-5 h-5 text-teal-500" /></div>
              {lang === 'id' ? 'Login via Biometrik' : 'Login via Biometrics'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style>{globalStyles}</style>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in slide-in-from-bottom-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100"><Target className="w-8 h-8 text-teal-600" /></div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 italic tracking-tight">{t.onboardTitle}</h2>
                <p className="text-xs text-slate-500 tracking-wide">{t.onboardDesc}</p>
            </div>
            <form onSubmit={handleCompleteOnboarding} className="space-y-5">
                <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-200">
                  <button type="button" onClick={() => setGenderFocus('pria')} className={`flex-1 py-3 text-xs font-black rounded-lg transition tracking-widest uppercase ${genderFocus === 'pria' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>🧔 {lang === 'id' ? 'PRIA' : 'MALE'}</button>
                  <button type="button" onClick={() => setGenderFocus('wanita')} className={`flex-1 py-3 text-xs font-black rounded-lg transition tracking-widest uppercase ${genderFocus === 'wanita' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>👩 {lang === 'id' ? 'WANITA' : 'FEMALE'}</button>
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
                    {lang === 'id' ? 'Buat Program Saya' : 'Generate Program'} <FastForward className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    );
  }

  // === MAIN APP RETURN ===
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center overflow-x-hidden pb-24">
      <style>{globalStyles}</style>
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen">
        
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl z-[300] shadow-2xl text-sm font-bold text-center max-w-[90%] animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-2 border border-slate-700">
            <Bell className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="leading-snug">{toastMsg}</span>
          </div>
        )}

        <header className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter italic text-white">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" /> TINYTHRIVE
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
              <p className="text-white font-bold text-lg leading-none">{email.split('@')[0] || 'Athlete'}</p>
            </div>
            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-inner">
              <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black tracking-widest text-white">{streak} {lang === 'id' ? 'HARI' : 'DAYS'}</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          
          {/* TAB: BERANDA */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
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
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex justify-center items-center gap-1"><FastForward className="w-3 h-3" /> {t.predictionPro}</p>
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
                <form onSubmit={handleAddWeight} className="flex gap-2">
                  <input type="number" step="0.1" className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-400 transition font-bold text-slate-800" placeholder={t.currentWeightPlaceholder} value={inputWeight || ''} onChange={e => setInputWeight(e.target.value)} />
                  <button type="submit" className="bg-slate-900 text-white font-black px-6 rounded-xl hover:bg-slate-800 active:scale-95 transition tracking-widest uppercase text-xs shadow-md">{t.save}</button>
                </form>
              </div>

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

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border transition-colors duration-300 ${habits.sugar ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><Coffee className="w-6 h-6" /></div>
                    <div><p className="font-black text-slate-800 tracking-wide">{t.sugar}</p><p className="text-xs font-bold text-slate-400">{t.sugarDesc}</p></div>
                  </div>
                  <button onClick={() => { const val = !habits.sugar; setHabits({...habits, sugar: val}); saveToCloud({habits: {...habits, sugar: val}}); }} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${habits.sugar ? 'bg-rose-500' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${habits.sugar ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

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
                    <button onClick={toggleGPSTracking} className={`flex-1 py-3.5 text-[10px] font-black rounded-xl border uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm italic ${isTracking ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600' : 'bg-white border-teal-100 text-teal-600 hover:bg-teal-50'}`}>
                      <MapPin className={`w-4 h-4 ${isTracking ? 'animate-bounce' : ''}`} />
                      {isTracking ? 'Berhenti' : 'Mulai GPS'}
                    </button>
                    <button onClick={simulateManualSteps} className="flex-1 py-3.5 text-[10px] font-black rounded-xl border border-white/20 bg-black/10 text-white hover:bg-black/20 uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm italic">
                      <Plus className="w-4 h-4" /> {lang === 'id' ? 'Input Manual' : 'Input Manual'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROGRAM (PRO MODE) */}
          {activeTab === 'pro' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {!isPremium ? (
                 <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-xl border border-teal-400">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><Zap className="w-48 h-48 text-white" /></div>
                    
                    <div className="relative z-10">
                      <div className="text-center space-y-3 mb-6">
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-white/30 transform rotate-3 backdrop-blur-sm">
                          <Lock className="text-white w-8 h-8 transform -rotate-3" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t.unlockPotential}</h2>
                        <p className="text-teal-50 text-xs font-bold tracking-wide">{t.unlockDesc}</p>
                      </div>
                      <div className="space-y-3 relative z-10">
                        <button onClick={() => setCheckoutTier({id:'week', name:t.tierWeek, price:t.tierWeekPrice})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center hover:bg-black/30 transition shadow-inner">
                          <span className="font-bold tracking-wide">{t.tierWeek}</span>
                          <span className="font-black text-yellow-300">{t.tierWeekPrice}</span>
                        </button>
                        <button onClick={() => setCheckoutTier({id:'month', name:t.tierMonth, price:t.tierMonthPrice})} className="w-full p-5 bg-white rounded-xl flex flex-col shadow-[0_10px_20px_rgba(0,0,0,0.15)] transform scale-[1.02] border border-teal-100">
                          <div className="flex justify-between items-center w-full text-slate-900">
                            <span className="font-black tracking-wide">{t.tierMonth}</span>
                            <span className="font-black text-xl text-teal-600">{t.tierMonthPrice}</span>
                          </div>
                          <span className="text-[10px] font-black text-teal-500 mt-1 uppercase tracking-widest">{t.mostPopular}</span>
                        </button>
                        <button onClick={() => setCheckoutTier({id:'quarter', name:t.tierQuarter, price:t.tierQuarterPrice})} className="w-full p-4 bg-black/20 border border-white/10 rounded-xl flex flex-col hover:bg-black/30 transition shadow-inner">
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold tracking-wide">{t.tierQuarter}</span>
                            <span className="font-black text-yellow-300">{t.tierQuarterPrice}</span>
                          </div>
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
                          {title: t.breakfast, m: activeMealDB.sarapan[(currentDay + menuVariant) % 7]},
                          {title: t.lunch, m: activeMealDB.siang[(currentDay + menuVariant) % 7]},
                          {title: t.dinner, m: activeMealDB.malam[(currentDay + menuVariant) % 7]},
                          {title: t.snack, m: activeMealDB.snack[(currentDay + menuVariant) % 7]}
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">{item.title}</p>
                              <p className="text-sm font-black text-slate-800">{item.m.menu}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{t.estPrice} <span className="text-slate-600">{formatPrice(item.m.price)}</span></p>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap shadow-sm">{item.m.cal} CAL</span>
                          </div>
                        ))}
                     </div>
                   </div>

                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Dumbbell className="w-32 h-32 text-teal-500" /></div>
                      <h3 className="font-black text-slate-800 flex items-center gap-2 tracking-wide uppercase text-sm relative z-10"><Dumbbell className="text-teal-500 w-4 h-4" /> {t.homeWorkout}</h3>
                      <div className="p-5 bg-teal-50 rounded-xl border border-teal-100 relative z-10 shadow-sm">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t.focusDay}</p>
                        <p className="text-xl font-black text-teal-900 italic tracking-tighter">{workoutSchedules[genderFocus][currentDay].focus[lang]}</p>
                      </div>
                      <div className="space-y-4 relative z-10 mt-2">
                        {workoutSchedules[genderFocus][currentDay].exercises.map((ex, i) => (
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
                 </div>
               )}
            </div>
          )}

          {/* TAB: PROFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <button onClick={shareProgress} className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 active:scale-95 transition-all tracking-widest uppercase italic">
                   <Share2 className="w-5 h-5" /> {t.shareTitle}
               </button>

               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <h2 className="font-black text-lg text-slate-800 flex items-center gap-2 tracking-wide uppercase"><Settings className="text-slate-400 w-5 h-5" /> {t.settingsTitle}</h2>
                 
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
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                          <button onClick={() => setLocation('id')} className={`py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${location === 'id' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>🇮🇩 IDN</button>
                          <button onClick={() => setLocation('asia')} className={`py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${location === 'asia' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>🌏 ASIA</button>
                          <button onClick={() => setLocation('eu')} className={`py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${location === 'eu' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>🇪🇺 EUR</button>
                          <button onClick={() => setLocation('us')} className={`py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${location === 'us' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>🇺🇸 USA</button>
                        </div>
                    </div>

                    <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                      <button onClick={() => setGenderFocus('pria')} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${genderFocus === 'pria' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400'}`}>🧔 MALE</button>
                      <button onClick={() => setGenderFocus('wanita')} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition tracking-widest uppercase ${genderFocus === 'wanita' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400'}`}>👩 FEMALE</button>
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
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=TinyThrive+Workout&details=Waktunya%20menghancurkan%20kalori!&dates=${todayDateStr}T170000Z/${todayDateStr}T180000Z`;
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
               </div>
               
               <div className="flex flex-col gap-3">
                 <button onClick={() => {
                   setIsLoggedIn(false);
                   setIsOnboardingComplete(false); 
                 }} className="w-full py-4 text-rose-500 font-black bg-rose-50 hover:bg-rose-100 rounded-2xl active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                   <LogOut className="w-4 h-4" /> LOGOUT ACCOUNT
                 </button>
               </div>
            </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION (SPORTY THEME) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-all ${activeTab === 'home' ? 'text-teal-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}>
            <Home className={`w-5 h-5 mb-1 ${activeTab === 'home' ? 'fill-teal-100' : ''}`} />
            <span className="text-[9px] font-black tracking-widest uppercase">{t.tabHome}</span>
          </button>
          <button onClick={() => setActiveTab('pro')} className={`p-4 rounded-full -mt-10 shadow-xl transition-all ${activeTab === 'pro' ? 'bg-teal-500 text-white scale-110 shadow-[0_10px_20px_rgba(20,184,166,0.3)]' : 'bg-slate-900 text-teal-400'}`}>
            <Star className={`w-6 h-6 ${activeTab === 'pro' ? 'fill-white' : ''}`} />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-all ${activeTab === 'profile' ? 'text-teal-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}>
            <UserCircle className={`w-5 h-5 mb-1 ${activeTab === 'profile' ? 'fill-teal-100' : ''}`} />
            <span className="text-[9px] font-black tracking-widest uppercase">{t.tabProfile}</span>
          </button>
        </nav>

        {/* CHECKOUT MODAL (DARK THEME) */}
        {checkoutTier && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end justify-center p-0 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-slate-200">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide italic">{t.checkoutTitle}</h3>
                 <button onClick={() => setCheckoutTier(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition">
                   <Plus className="w-6 h-6 transform rotate-45" />
                 </button>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-teal-500/30 flex justify-between items-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Award className="w-24 h-24 text-teal-500" /></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{lang === 'id' ? 'Paket Terpilih' : 'Selected Plan'}</p>
                    <p className="text-lg font-black text-slate-800 tracking-wide uppercase">{checkoutTier.name}</p>
                  </div>
                  <p className="text-2xl font-black text-teal-500 relative z-10 italic">{checkoutTier.price}</p>
               </div>
               <button onClick={handlePayment} disabled={isProcessingPayment} className="w-full py-5 bg-teal-600 hover:bg-teal-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest uppercase italic">
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
