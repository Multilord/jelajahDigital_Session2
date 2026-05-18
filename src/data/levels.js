/**
 * levels.js — Question bank & constants for Jelajah Dunia AI workshop.
 *
 * 23 questions total:
 *   Level 1 (Pengenalan AI): 7 questions
 *   Level 2 (Kuasa Prompt):  8 questions
 *   Level 3 (Misi Pac-Man):  8 questions
 *
 * All student-facing text is in child-friendly Bahasa Melayu.
 * Uses "game mini ala Pac-Man" — never "maze game", "pagar sesat", or "pagaran".
 */

// ── Scoring constants ─────────────────────────────────────────────────
export const POINTS = {
  CORRECT_ANSWER: 10,
  WRONG_ANSWER: 0,
  LEVEL_COMPLETE_BONUS: 20,
  ALL_LEVELS_BONUS: 50,
  GAME_CREATE_BONUS: 30,
  GAME_IMPROVE_BONUS: 20,
};

// ── Level definitions ─────────────────────────────────────────────────
export const LEVELS = [
  {
    id: "level1",
    title: "Level 1: Pengenalan AI",
    subtitle: "Kenali AI sebagai pembantu pintar",
    intro:
      "Dalam level ini, kamu akan semak semula apa itu AI, di mana kita jumpa AI, dan cara guna AI dengan selamat.",
    icon: "🧠",
    questions: [
      {
        id: "l1q1",
        question: "Apakah maksud AI dalam bengkel ini?",
        options: [
          "A. Robot yang ada kuasa sihir",
          "B. Pembantu komputer pintar yang boleh membantu kita belajar dan mencipta idea",
          "C. Permainan video sahaja",
          "D. Nama satu makanan",
        ],
        answer: 1,
        explanation:
          "AI ialah pembantu pintar yang boleh memberi cadangan, menjawab soalan dan membantu kita berfikir.",
      },
      {
        id: "l1q2",
        question: "Di manakah kita mungkin pernah nampak AI?",
        options: [
          "A. Cadangan video YouTube",
          "B. Autocorrect",
          "C. Google Translate",
          "D. Semua di atas",
        ],
        answer: 3,
        explanation:
          "AI boleh muncul dalam banyak aplikasi harian seperti video, tulisan, terjemahan dan game.",
      },
      {
        id: "l1q3",
        question: "AI bukan sihir kerana...",
        options: [
          "A. AI belajar daripada data dan contoh",
          "B. AI tahu semua benda secara ajaib",
          "C. AI tidak pernah salah",
          "D. AI boleh baca fikiran manusia",
        ],
        answer: 0,
        explanation:
          "AI memberi jawapan berdasarkan corak daripada data dan contoh.",
      },
      {
        id: "l1q4",
        question: "Antara berikut, yang manakah AI boleh bantu?",
        options: [
          "A. Memberi idea cerita",
          "B. Membantu ringkaskan nota",
          "C. Membuat kuiz latihan",
          "D. Semua di atas",
        ],
        answer: 3,
        explanation:
          "AI boleh membantu pembelajaran dan kreativiti, tetapi kita tetap perlu berfikir sendiri.",
      },
      {
        id: "l1q5",
        question: "Mengapa kita perlu semak jawapan AI?",
        options: [
          "A. AI kadang-kadang boleh tersilap",
          "B. AI sentiasa betul",
          "C. AI tidak boleh bercakap",
          "D. AI hanya untuk game",
        ],
        answer: 0,
        explanation:
          "AI boleh memberi jawapan yang salah atau kurang sesuai, jadi kita mesti semak.",
      },
      {
        id: "l1q6",
        question: "Apakah perkara yang tidak patut dikongsi dengan AI?",
        options: [
          "A. Nama penuh, alamat dan password",
          "B. Tema game",
          "C. Idea watak",
          "D. Warna kegemaran untuk game",
        ],
        answer: 0,
        explanation: "Maklumat peribadi perlu dirahsiakan.",
      },
      {
        id: "l1q7",
        question: "Apakah peranan terbaik AI?",
        options: [
          "A. Menggantikan otak kita sepenuhnya",
          "B. Menjadi pembantu kepada idea dan pembelajaran kita",
          "C. Membuat semua kerja tanpa kita faham",
          "D. Menyalin jawapan untuk kita",
        ],
        answer: 1,
        explanation:
          "AI ialah pembantu, bukan pengganti pemikiran sendiri.",
      },
    ],
  },
  {
    id: "level2",
    title: "Level 2: Kuasa Prompt",
    subtitle: "Belajar cara bercakap dengan AI",
    intro:
      "Dalam level ini, kamu akan belajar maksud prompt dan cara menulis prompt yang jelas.",
    icon: "✨",
    questions: [
      {
        id: "l2q1",
        question: "Apakah itu prompt?",
        options: [
          "A. Arahan atau soalan yang kita beri kepada AI",
          "B. Sejenis virus komputer",
          "C. Nama robot",
          "D. Markah dalam game",
        ],
        answer: 0,
        explanation:
          "Prompt ialah cara kita bercakap atau memberi arahan kepada AI.",
      },
      {
        id: "l2q2",
        question: "Prompt yang jelas akan membantu AI untuk...",
        options: [
          "A. Memberi jawapan yang lebih sesuai",
          "B. Menjadi keliru",
          "C. Menutup komputer",
          "D. Menghilangkan semua data",
        ],
        answer: 0,
        explanation:
          "Lagi jelas prompt, lagi mudah AI faham apa yang kita mahu.",
      },
      {
        id: "l2q3",
        question: "Pilih prompt yang lebih baik.",
        options: [
          'A. "Buat game."',
          'B. "Bantu saya cipta game mini ala Pac-Man untuk kanak-kanak umur 10 tahun dengan hero, musuh, markah dan cara menang."',
        ],
        answer: 1,
        explanation:
          "Prompt B lebih jelas kerana ada tugas, konteks, butiran dan tujuan.",
      },
      {
        id: "l2q4",
        question: "Apakah 4 rahsia prompt yang bagus?",
        options: [
          "A. Tugas, Konteks, Butiran, Format",
          "B. Warna, Suara, Gambar, Lagu",
          "C. Cepat, Lambat, Besar, Kecil",
          "D. Nama, Umur, Alamat, Password",
        ],
        answer: 0,
        explanation:
          "Prompt bagus biasanya ada tugas, konteks, butiran dan format jawapan.",
      },
      {
        id: "l2q5",
        question: '"Bertindak sebagai pereka game" ialah contoh...',
        options: [
          "A. Role prompting",
          "B. Simple prompting",
          "C. Password prompting",
          "D. Random prompting",
        ],
        answer: 0,
        explanation:
          "Role prompting bermaksud kita minta AI memainkan peranan tertentu.",
      },
      {
        id: "l2q6",
        question: '"Terangkan langkah demi langkah" ialah contoh...',
        options: [
          "A. Step-by-step prompting",
          "B. Creative prompting",
          "C. Silent prompting",
          "D. Wrong prompting",
        ],
        answer: 0,
        explanation:
          "Step-by-step prompting meminta AI beri jawapan secara berperingkat.",
      },
      {
        id: "l2q7",
        question:
          "Kalau jawapan AI terlalu panjang, prompt refinement yang sesuai ialah...",
        options: [
          'A. "Pendekkan kepada 5 poin sahaja."',
          'B. "Jangan jawab."',
          'C. "Padam semua."',
          'D. "Buat secara rawak."',
        ],
        answer: 0,
        explanation:
          "Refinement prompting membantu kita memperbaiki jawapan AI.",
      },
      {
        id: "l2q8",
        question: "Apakah sikap yang betul semasa guna AI?",
        options: [
          "A. Salin semua tanpa faham",
          "B. Semak, faham dan tambah idea sendiri",
          "C. Kongsi password",
          "D. Percaya semua jawapan AI",
        ],
        answer: 1,
        explanation: "Kita perlu guna AI secara bertanggungjawab.",
      },
    ],
  },
  {
    id: "level3",
    title: "Level 3: Misi Pac-Man",
    subtitle: "Reka idea game mini ala Pac-Man",
    intro:
      "Dalam level ini, kamu akan gunakan prompt untuk fikirkan tema, hero, musuh, item, markah dan cara menang.",
    icon: "🎮",
    questions: [
      {
        id: "l3q1",
        question:
          "Dalam game mini ala Pac-Man, hero biasanya perlu...",
        options: [
          "A. Bergerak, mengutip item dan elak musuh",
          "B. Tidur sepanjang game",
          "C. Menutup skrin",
          "D. Membuang semua markah",
        ],
        answer: 0,
        explanation:
          "Konsep Pac-Man melibatkan pergerakan, item kutipan, musuh dan markah.",
      },
      {
        id: "l3q2",
        question: "Apakah elemen penting dalam game?",
        options: [
          "A. Hero, musuh, objektif, markah dan cara menang/kalah",
          "B. Hanya warna latar belakang",
          "C. Hanya lagu",
          "D. Hanya nama game",
        ],
        answer: 0,
        explanation:
          "Game yang baik perlu ada watak, cabaran, misi dan peraturan.",
      },
      {
        id: "l3q3",
        question: "Apakah maksud item kutipan?",
        options: [
          "A. Benda yang hero kumpul untuk mendapat markah",
          "B. Musuh utama",
          "C. Butang keluar",
          "D. Password rahsia",
        ],
        answer: 0,
        explanation:
          "Item kutipan memberi markah atau membantu hero dalam game.",
      },
      {
        id: "l3q4",
        question: "Pilih prompt terbaik untuk mencari idea game.",
        options: [
          'A. "Buat benda."',
          'B. "Hai AI! Beri saya 3 idea game mini ala Pac-Man bertema angkasa untuk kanak-kanak umur 10 tahun. Setiap idea mesti ada nama game, hero, musuh, item kutipan, markah dan cara menang."',
        ],
        answer: 1,
        explanation: "Prompt B jelas dan lengkap.",
      },
      {
        id: "l3q5",
        question: "Apakah fungsi kuasa khas atau power-up?",
        options: [
          "A. Menjadikan game lebih menarik dan memberi kelebihan sementara kepada hero",
          "B. Menutup game terus",
          "C. Menghapuskan semua idea",
          "D. Menggantikan nama pasukan",
        ],
        answer: 0,
        explanation:
          "Power-up boleh menambah keseronokan dan cabaran dalam game.",
      },
      {
        id: "l3q6",
        question: "Selepas AI beri idea, apakah yang patut kita buat?",
        options: [
          "A. Terima semua tanpa baca",
          "B. Semak, pilih dan perhalusi idea",
          "C. Buang semua idea",
          "D. Kongsi password",
        ],
        answer: 1,
        explanation: "Kita perlu faham dan perbaiki idea AI.",
      },
      {
        id: "l3q7",
        question:
          'Dalam prompt "Tulis arahan cara bermain game ala Pac-Man ini," apakah yang perlu AI terangkan?',
        options: [
          "A. Cara hero bergerak, kutip item, dapat markah, elak musuh, menang dan kalah",
          "B. Alamat rumah pemain",
          "C. Password WiFi",
          "D. Nama penuh semua murid",
        ],
        answer: 0,
        explanation:
          "Arahan game perlu jelas supaya pemain faham cara bermain.",
      },
      {
        id: "l3q8",
        question: "Sebelum bina game, pasukan perlu sediakan...",
        options: [
          "A. Tema, hero, musuh, item kutipan, markah dan cara menang",
          "B. Makanan sahaja",
          "C. Alamat rumah",
          "D. Password telefon",
        ],
        answer: 0,
        explanation:
          "Ini ialah inventori idea sebelum masuk ke hands-on game creation.",
      },
    ],
  },
];

// ── Prompt starters for game mini ala Pac-Man ─────────────────────────
export const PROMPT_STARTERS = [
  "Cipta game mini ala Pac-Man bertema angkasa lepas. Hero ialah roket kecil yang mengutip bintang dan mengelak alien.",
  "Cipta game mini ala Pac-Man bertema selamatkan kucing. Hero ialah kucing comel yang mengutip ikan dan mengelak robot.",
  "Cipta game mini ala Pac-Man bertema hutan buah-buahan. Hero mengutip epal emas dan mengelak monster daun.",
  "Cipta game mini ala Pac-Man bertema bawah air. Hero ialah kapal selam yang mengutip mutiara dan mengelak sotong.",
  "Cipta game mini ala Pac-Man bertema sekolah robot. Hero ialah robot pelajar yang mengutip cip pintar dan mengelak virus.",
];

// ── Amendment starters ────────────────────────────────────────────────
export const AMENDMENT_STARTERS = [
  "Jadikan game lebih mudah untuk kanak-kanak umur 10 tahun.",
  "Tambah satu kuasa khas yang membantu hero.",
  "Tukar musuh menjadi lebih lucu dan kurang menakutkan.",
  "Tambahkan arahan permainan yang lebih jelas.",
  "Tukar warna game kepada gaya neon arcade.",
];
