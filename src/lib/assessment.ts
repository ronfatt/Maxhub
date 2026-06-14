export type QuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false"
  | "matching"
  | "hotspot"
  | "drag-drop"
  | "step-order"
  | "tool-selection"
  | "scenario-choice"
  | "rubric-response";

export type AssessmentStatus = "draft" | "published" | "archived";

export type CompetencyArea =
  | "technical-operations"
  | "whiteboard-smart-ink"
  | "ai-courseware"
  | "ai-activity"
  | "smart-quiz"
  | "hybrid-learning"
  | "lesson-analytics"
  | "classroom-engagement"
  | "ai-pedagogy"
  | "data-intervention";

export type AssessmentQuestion = {
  id: string;
  section: "A" | "B" | "C";
  type: QuestionType;
  prompt: string;
  score: number;
  competency: CompetencyArea;
  difficulty: "foundation" | "intermediate" | "advanced";
  subject?: string;
  domainLabel?: string;
  options?: Array<{
    id: string;
    label: string;
    isCorrect?: boolean;
  }>;
  simulation?: {
    screen: string;
    expectedAction: string;
    correctTarget?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    requiredSteps?: string[];
    correctOrder?: string[];
    stepOptions?: Array<{
      id: string;
      label: string;
    }>;
    guidedActions?: Array<{
      action: string;
      instruction: string;
    }>;
    dragItems?: Array<{
      id: string;
      label: string;
    }>;
    dropZones?: Array<{
      id: string;
      label: string;
      accepts: string;
    }>;
  };
  rubric?: string[];
  explanation?: string;
  recommendedModule?: string;
};

export type AchievementRule = {
  minPercentage: number;
  label: string;
  certificateEligible: boolean;
};

export type AssessmentPack = {
  id: string;
  name: string;
  version: string;
  status: AssessmentStatus;
  totalScore: number;
  sections: Array<{
    id: "A" | "B" | "C";
    title: string;
    totalScore: number;
  }>;
  achievementRules: AchievementRule[];
  retakePolicy: {
    minimumDaysBeforeRetake: number;
    maximumAttemptsPerYear: number;
  };
  questions: AssessmentQuestion[];
};

type PortalMCQSeed = {
  id: number;
  domain: string;
  subject: string;
  question: string;
  options: Array<{ key: string; text: string }>;
  correct: string;
  explanation: string;
};

type PortalSimulationSeed = {
  id: number;
  title: string;
  situation: string;
  points: number;
  steps?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  stepsToComplete?: Array<{ action: string; instruction: string }>;
};

const portalMCQSeed: PortalMCQSeed[] = [
  {
    id: 1,
    domain: "Quick Start & Whiteboard",
    subject: "Bahasa Inggeris Tahun 5",
    question: "Guru ingin mengelilingi jawapan murid semasa aktiviti \"spot the mistake\" pada paparan interaktif. Apakah alat EasiClass yang paling sesuai untuk menarik perhatian murid tanpa meninggalkan kesan dakwat kekal?",
    options: [
      { key: "A", text: "Laser Pointer" },
      { key: "B", text: "Marker" },
      { key: "C", text: "Compass" },
      { key: "D", text: "Countdown" },
    ],
    correct: "A",
    explanation: "Laser Pointer membolehkan guru melakar secara sementara untuk menarik perhatian murid tanpa mengotori kanvas whiteboard.",
  },
  {
    id: 2,
    domain: "Smart Ink",
    subject: "Matematik Tingkatan 2",
    question: "Guru melukis fungsi y = x² menggunakan tulisan tangan pada skrin. Apakah ciri EasiClass yang boleh membantu menukarkan lukisan tangan ini menjadi bentuk graf fungsi yang tepat secara automatik?",
    options: [
      { key: "A", text: "Clone Mode" },
      { key: "B", text: "Smart Ink" },
      { key: "C", text: "Mask Tool" },
      { key: "D", text: "Mind Map" },
    ],
    correct: "B",
    explanation: "Smart Ink boleh menukar lakaran tangan formula matematik terus kepada graf fungsi yang tepat dan dinamik.",
  },
  {
    id: 3,
    domain: "Maxhub Headcount",
    subject: "Guru Kelas",
    question: "Sebelum memulakan PdP, guru perlu mengambil kehadiran murid secara pintar dan pantas menggunakan kamera paparan interaktif MAXHUB. Apakah alat yang perlu digunakan?",
    options: [
      { key: "A", text: "Headcount" },
      { key: "B", text: "Protractor" },
      { key: "C", text: "Random" },
      { key: "D", text: "Laser" },
    ],
    correct: "A",
    explanation: "Headcount adalah alat pengesan dan pengira kehadiran murid berasaskan kecerdasan pintar pada paparan MAXHUB.",
  },
  {
    id: 4,
    domain: "AI Preparation",
    subject: "Sejarah Tingkatan 1",
    question: "Guru ingin menghasilkan bahan pengajaran lengkap mengenai topik \"Zaman Mesolitik\" dalam masa yang singkat menggunakan bantuan kecerdasan buatan. Apakah fungsi yang perlu digunakan?",
    options: [
      { key: "A", text: "AI Lesson Builder / AI Courseware Generator" },
      { key: "B", text: "Smart Ink" },
      { key: "C", text: "Laser Pointer" },
      { key: "D", text: "Compass" },
    ],
    correct: "A",
    explanation: "AI Lesson Builder (AI Courseware Generator) boleh menjana set slaid pengajaran lengkap mengikut standard kurikulum dalam masa beberapa minit sahaja.",
  },
  {
    id: 5,
    domain: "AI Interactive Learning",
    subject: "Fizik Tingkatan 4",
    question: "Guru ingin menunjukkan eksperimen litar elektrik tanpa menggunakan peralatan makmal sebenar. Apakah ciri EasiClass yang paling sesuai?",
    options: [
      { key: "A", text: "Live Session" },
      { key: "B", text: "Ready-to-use Simulations" },
      { key: "C", text: "Geometry Tool" },
      { key: "D", text: "Role Talk" },
    ],
    correct: "B",
    explanation: "EasiClass menyediakan lebih daripada 100 simulasi eksperimen sains sedia guna.",
  },
  {
    id: 6,
    domain: "Whiteboard Interaction",
    subject: "Sains Tahun 6",
    question: "Semasa sesi pembentangan kumpulan, guru mahu memilih seorang murid secara rawak untuk menjawab soalan kuiz. Alat manakah yang sesuai digunakan bagi memastikan proses pemilihan adalah adil?",
    options: [
      { key: "A", text: "Countdown" },
      { key: "B", text: "Random Picker" },
      { key: "C", text: "Timer" },
      { key: "D", text: "Magnifier" },
    ],
    correct: "B",
    explanation: "Alat 'Random' (Random Picker) membantu memilih murid atau kumpulan secara rawak dan adil semasa PdP.",
  },
  {
    id: 7,
    domain: "Resource Integration",
    subject: "Reka Bentuk dan Teknologi",
    question: "Guru ingin mengimport fail pembentangan PowerPoint (.pptx) sedia ada daripada Google Drive ke dalam platform EasiClass. Adakah platform ini menyokong format tersebut?",
    options: [
      { key: "A", text: "Ya, EasiClass menyokong format PPTX, Google Slaid, Notebook, dan Flipchart" },
      { key: "B", text: "Tidak, ia hanya menyokong format PDF asli" },
      { key: "C", text: "Hanya fail video MP4 sahaja yang boleh diimport" },
      { key: "D", text: "EasiClass hanya membenarkan pembinaan slaid baharu sepenuhnya" },
    ],
    correct: "A",
    explanation: "EasiClass menyokong keserasian universal untuk mengimport fail PPTX, Google Slaid, Smart Notebook, dan ActivInspire Flipchart.",
  },
  {
    id: 8,
    domain: "Class Insights",
    subject: "Fizik Tingkatan 4",
    question: "Selepas tamat kelas hibrid, guru ingin melihat rekod kehadiran keseluruhan murid serta keputusan maklum balas kuiz mereka. Di manakah guru boleh menyemak data analitik ini?",
    options: [
      { key: "A", text: "Hanya dalam Microsoft Teams" },
      { key: "B", text: "Menyemak menu 'Lesson History' dan 'Class Insight' di EasiClass" },
      { key: "C", text: "Sistem akan menghantar fail excel ke e-mel pentadbir sekolah sahaja" },
      { key: "D", text: "Data murid dipadam secara automatik dan tidak boleh disemak" },
    ],
    correct: "B",
    explanation: "Menu 'Lesson History' dan 'Class Insight' merekodkan penglibatan murid, markah kuiz, serta kehadiran murid sepanjang sesi pengajaran dijalankan.",
  },
  {
    id: 9,
    domain: "Convenient Subject Tools",
    subject: "Matematik Tahun 4",
    question: "Guru ingin menunjukkan cara mengukur sudut poligon secara tepat semasa pengajaran geometri. Alat subjek EasiClass manakah yang paling sesuai ditarik keluar ke atas kanvas?",
    options: [
      { key: "A", text: "Ruler" },
      { key: "B", text: "Protractor" },
      { key: "C", text: "Compass" },
      { key: "D", text: "Set Square" },
    ],
    correct: "B",
    explanation: "Protractor (jangka sudut) disediakan khusus sebagai sebahagian daripada alat matematik digital untuk mengukur sudut secara langsung di papan putih.",
  },
  {
    id: 10,
    domain: "Whiteboard Gamification",
    subject: "Bahasa Melayu Tingkatan 4",
    question: "Guru ingin mengadakan pertandingan kuiz berkumpulan secara interaktif di papan putih, di mana dua wakil murid boleh bersaing menjawab soalan secara serentak di kawasan skrin yang dibahagikan. Apakah ciri yang paling sesuai?",
    options: [
      { key: "A", text: "Group Competition / Team Game Mode" },
      { key: "B", text: "Mind Map" },
      { key: "C", text: "Mask Tool" },
      { key: "D", text: "Desktop Mode" },
    ],
    correct: "A",
    explanation: "Group Competition/Team Game membahagikan skrin whiteboard kepada zon perlawanan bagi membolehkan persaingan kuiz gamifikasi secara langsung.",
  },
  {
    id: 11,
    domain: "AI Interactive Activities",
    subject: "Pendidikan Islam Tahun 4",
    question: "Guru ingin membina aktiviti permainan interaktif seperti padanan suku kata Jawi ke Rumi secara pantas menggunakan templat yang menyeronokkan. Di manakah ciri ini boleh dibina?",
    options: [
      { key: "A", text: "AI Lesson Builder" },
      { key: "B", text: "AI Activity / Game Template" },
      { key: "C", text: "Smart Quiz" },
      { key: "D", text: "Subject Tools" },
    ],
    correct: "B",
    explanation: "Ciri AI Activity menyediakan templat permainan gamifikasi siap sedia (seperti padanan kata, penyusunan huruf, dll) untuk diisi dengan kandungan pengajaran.",
  },
  {
    id: 12,
    domain: "Quick Classroom Tools",
    subject: "Kimia Tingkatan 5",
    question: "Semasa menjalankan aktiviti eksperimen kumpulan, guru mahu menetapkan tempoh masa selama 5 minit yang dipaparkan dengan saiz besar di skrin untuk memudahkan murid bersiap sedia. Alat manakah yang sesuai?",
    options: [
      { key: "A", text: "Timer / Countdown" },
      { key: "B", text: "Clock" },
      { key: "C", text: "Calculator" },
      { key: "D", text: "Laser Pointer" },
    ],
    correct: "A",
    explanation: "Alat Timer/Countdown membolehkan penetapan had masa aktiviti yang dipaparkan secara terapung di skrin.",
  },
  {
    id: 13,
    domain: "Pedagogy-Driven Whiteboard",
    subject: "Sains Tingkatan 1",
    question: "Guru ingin menutup sebahagian rajah label struktur sel haiwan di skrin dan mendedahkannya satu persatu semasa sesi soal jawab. Alat whiteboard manakah yang paling sesuai digunakan?",
    options: [
      { key: "A", text: "Mask Tool" },
      { key: "B", text: "Clone Mode" },
      { key: "C", text: "Spotlight" },
      { key: "D", text: "Eraser" },
    ],
    correct: "A",
    explanation: "Mask Tool berfungsi untuk menutup kandungan tertentu pada slaid dan boleh dibuka klik demi klik bagi tujuan perbincangan interaktif.",
  },
  {
    id: 14,
    domain: "AI Preparation",
    subject: "Bahasa Inggeris Tingkatan 3",
    question: "Semasa kelas berlangsung, guru mendapati murid memerlukan latihan tambahan tentang 'Active & Passive Voice'. Guru ingin menjana set kuiz tatabahasa baharu menggunakan AI secara spontan. Fungsi manakah yang paling tepat?",
    options: [
      { key: "A", text: "Smart Quiz (AI Generator)" },
      { key: "B", text: "AI Image" },
      { key: "C", text: "Role Talk" },
      { key: "D", text: "Floating Lesson View" },
    ],
    correct: "A",
    explanation: "Smart Quiz membolehkan guru menjana kuiz berasaskan topik pilihan secara instan menggunakan AI semasa di dalam kelas.",
  },
  {
    id: 15,
    domain: "AI Graphics Generation",
    subject: "Geografi Tingkatan 1",
    question: "Guru ingin memaparkan imej haiwan Artik yang realistik bagi membantu visualisasi murid. Guru mahu imej tersebut dijana secara langsung melalui prompt teks dalam EasiClass. Ciri manakah yang digunakan?",
    options: [
      { key: "A", text: "AI Image Generator" },
      { key: "B", text: "Snapshot Upload" },
      { key: "C", text: "Web Browser Link" },
      { key: "D", text: "Desktop Screenshot" },
    ],
    correct: "A",
    explanation: "AI Image Generator membolehkan guru menjana grafik visual unik berasaskan arahan teks (prompt) di bawah menu Media.",
  },
  {
    id: 16,
    domain: "Pedagogy-Driven Whiteboard",
    subject: "Matematik Tingkatan 1",
    question: "Apabila guru meluaskan kanvas whiteboard untuk menulis jalan kerja matematik, slaid pengajaran asal akan bertukar menjadi tetingkap kecil yang terapung di skrin. Apakah nama ciri ini?",
    options: [
      { key: "A", text: "Floating Lesson View" },
      { key: "B", text: "Split Screen" },
      { key: "C", text: "Desktop Mode" },
      { key: "D", text: "Dual Canvas" },
    ],
    correct: "A",
    explanation: "Floating Lesson View mengekalkan slaid pengajaran asal sebagai tetingkap terapung kecil semasa guru menulis panjang lebar pada kanvas lanjutan.",
  },
  {
    id: 17,
    domain: "Post-Class Sharing",
    subject: "Bahasa Melayu Tingkatan 5",
    question: "Selepas tamat sesi pengajaran, guru ingin murid menyalin semua nota dan catatan contohan pada papan putih digital tersebut dengan mengimbas kod QR. Pilihan menu manakah yang betul?",
    options: [
      { key: "A", text: "QR Share" },
      { key: "B", text: "Save Project" },
      { key: "C", text: "Export to PDF" },
      { key: "D", text: "Add Slaid" },
    ],
    correct: "A",
    explanation: "Ciri 'QR Share' menjana kod QR secara langsung pada skrin papan putih bagi membolehkan murid mengimbas dan memuat turun salinan nota pengajaran.",
  },
  {
    id: 18,
    domain: "LMS Integration",
    subject: "Sejarah Tingkatan 4",
    question: "Adakah EasiClass membenarkan guru mengimport terus pangkalan data senarai nama murid daripada Google Classroom, Microsoft Teams, atau Canvas LMS?",
    options: [
      { key: "A", text: "Ya, EasiClass menyokong integrasi penuh dengan LMS utama untuk mengimport senarai kelas" },
      { key: "B", text: "Tidak, senarai nama murid wajib dimasukkan secara manual satu persatu" },
      { key: "C", text: "Hanya menyokong platform WhatsApp Group sahaja" },
      { key: "D", text: "Hanya melalui fail txt yang dikodkan khas" },
    ],
    correct: "A",
    explanation: "EasiClass direka dengan integrasi sistem pengurusan pembelajaran (LMS) popular untuk memudahkan pemindahan pengurusan bilik darjah.",
  },
  {
    id: 19,
    domain: "AI Interactive Learning",
    subject: "Sains Tingkatan 4",
    question: "Murid Tingkatan 4 bertanya soalan tambahan tentang eksperimen Schrodinger's Cat. Apakah fungsi yang paling sesuai?",
    options: [
      { key: "A", text: "AI Chatbot" },
      { key: "B", text: "Geometry" },
      { key: "C", text: "Marker" },
      { key: "D", text: "Compass" },
    ],
    correct: "A",
    explanation: "AI Chatbot boleh menjawab soalan tambahan atau teori sains murid secara interaktif dan segera.",
  },
  {
    id: 20,
    domain: "School Administration",
    subject: "Pengetua / Pentadbir Sekolah",
    question: "Sebagai pentadbir sekolah, anda ingin melihat statistik penglibatan guru, analisis data kelas, dan laporan prestasi penggunaan EasiClass di peringkat sekolah. Di manakah maklumat ini boleh diperoleh?",
    options: [
      { key: "A", text: "Admin Portal / School Console" },
      { key: "B", text: "Teacher Portal" },
      { key: "C", text: "Student Portal" },
      { key: "D", text: "Google Drive Peribadi" },
    ],
    correct: "A",
    explanation: "Admin Portal atau School Console memberikan visualisasi data komprehensif bagi tadbir urus dan pemantauan penggunaan perisian di seluruh sekolah.",
  },
];

const portalSimulationSeed: PortalSimulationSeed[] = [
  {
    id: 1,
    title: "Tugasan 1: Susunan Langkah Menjana 'AI Courseware'",
    situation: "Situasi: Anda ingin menyediakan PdP Sains Tahun 5 bertajuk \"Sistem Suria\". Susun langkah-langkah di bawah mengikut urutan yang betul.",
    steps: [
      { id: "step-2", text: "Masukkan topik pengajaran (cth: Sistem Suria)" },
      { id: "step-5", text: "Klik butang 'Generate Courseware' (Langkah Akhir)" },
      { id: "step-1", text: "Klik butang 'Generate with AI'" },
      { id: "step-4", text: "Bina dan semak draf struktur (Generate Outline)" },
      { id: "step-3", text: "Semak dan tetapkan objektif pembelajaran" },
    ],
    correctOrder: ["step-1", "step-2", "step-3", "step-4", "step-5"],
    points: 2,
  },
  {
    id: 2,
    title: "Tugasan 2: Simulasi Menjana 'AI Image' Gunung Kinabalu",
    situation: "Situasi: Bagi mata pelajaran Geografi, anda memerlukan imej Gunung Kinabalu yang dijana oleh AI. Tunjukkan lokasi AI Image Generator dan jana imej tersebut secara interaktif.",
    stepsToComplete: [
      { action: "CLICK_MEDIA", instruction: "1. Klik butang 'Media' pada menu alatan." },
      { action: "CLICK_AI_GENERATOR", instruction: "2. Klik pada pilihan 'AI Image Generator'." },
      { action: "TYPE_PROMPT", instruction: "3. Taipkan prompt 'Gunung Kinabalu' di kotak carian." },
      { action: "CLICK_GENERATE", instruction: "4. Klik butang 'Generate' untuk menghasilkan gambar." },
    ],
    points: 2,
  },
  {
    id: 3,
    title: "Tugasan 3: Tukar Gambar Soalan Buku Teks kepada Aktiviti AI",
    situation: "Situasi: Anda telah mengambil gambar (snapshot) soalan daripada buku teks fizikal. Anda mahu menukarkannya kepada aktiviti digital interaktif.",
    stepsToComplete: [
      { action: "CLICK_UPLOAD", instruction: "1. Klik 'Upload Snapshot' untuk muat naik imej buku teks." },
      { action: "CLICK_AI_CONVERT", instruction: "2. Klik butang 'AI Convert / Scan OCR'." },
      { action: "CHOOSE_ACTIVITY", instruction: "3. Pilih jenis aktiviti 'Interactive Game Quiz'." },
      { action: "CLICK_APPLY", instruction: "4. Klik 'Generate Activity' untuk memasukkan aktiviti ke dalam slaid." },
    ],
    points: 2,
  },
  {
    id: 4,
    title: "Tugasan 4: Susunan Langkah Menjana 'Smart Quiz' Fotosintesis",
    situation: "Situasi: Anda ingin menjana set kuiz interaktif pantas berdasarkan topik \"Fotosintesis\". Susun langkah-langkah di bawah dengan urutan yang betul.",
    steps: [
      { id: "quiz-3", text: "Pilih jenis soalan (cth: Aneka Pilihan / Benar Salah)" },
      { id: "quiz-1", text: "Klik butang 'Smart Quiz'" },
      { id: "quiz-4", text: "Klik butang 'Generate'" },
      { id: "quiz-2", text: "Masukkan topik pengajaran (cth: Fotosintesis)" },
    ],
    correctOrder: ["quiz-1", "quiz-2", "quiz-3", "quiz-4"],
    points: 2,
  },
  {
    id: 5,
    title: "Tugasan 5: Simulasi Aktiviti Pertuturan 'Role Talk' Bahasa Inggeris",
    situation: "Situasi: Sebagai Guru Bahasa Inggeris, anda mahu menjadikan dialog perbualan buku teks sebagai aktiviti latihan pertuturan AI interaktif bersama murid.",
    stepsToComplete: [
      { action: "CLICK_ROLE_TALK", instruction: "1. Klik butang 'Role Talk' daripada menu alatan AI." },
      { action: "CHOOSE_CHARACTER", instruction: "2. Pilih watak dialog atau masukkan skrip dialog interaktif." },
      { action: "ASSIGN_STUDENT", instruction: "3. Agihkan watak tersebut kepada murid pilihan." },
      { action: "START_SPEAKING", instruction: "4. Klik 'Start Speaking / Mulakan Simulasi' untuk memulakan aktiviti pertuturan." },
    ],
    points: 2,
  },
];

function mapDomainToCompetency(domain: string): CompetencyArea {
  const normalized = domain.toLowerCase();

  if (normalized.includes("smart ink") || normalized.includes("whiteboard") || normalized.includes("subject") || normalized.includes("quick")) {
    return "whiteboard-smart-ink";
  }

  if (normalized.includes("headcount") || normalized.includes("tools")) {
    return "technical-operations";
  }

  if (normalized.includes("ai preparation") || normalized.includes("lesson") || normalized.includes("graphics")) {
    return "ai-courseware";
  }

  if (normalized.includes("interactive") || normalized.includes("activity")) {
    return "ai-activity";
  }

  if (normalized.includes("insights") || normalized.includes("post-class")) {
    return "lesson-analytics";
  }

  if (normalized.includes("lms")) {
    return "hybrid-learning";
  }

  return "classroom-engagement";
}

export const importedMCQQuestions: AssessmentQuestion[] = portalMCQSeed.map((question) => ({
  id: `A-${String(question.id).padStart(3, "0")}`,
  section: "A",
  type: "single-choice",
  prompt: question.question,
  score: 1,
  competency: mapDomainToCompetency(question.domain),
  difficulty: question.id <= 8 ? "foundation" : question.id <= 16 ? "intermediate" : "advanced",
  subject: question.subject,
  domainLabel: question.domain,
  options: question.options.map((option) => ({
    id: option.key,
    label: option.text,
    isCorrect: option.key === question.correct ? true : undefined,
  })),
  explanation: question.explanation,
  recommendedModule: question.domain,
}));

export const sectionBSimulationTaskBank: AssessmentQuestion[] = portalSimulationSeed.map((task, index) => ({
  id: `B-${String(task.id).padStart(3, "0")}`,
  section: "B",
  type: task.steps ? "step-order" : task.id === 2 ? "hotspot" : task.id === 3 ? "drag-drop" : "tool-selection",
  prompt: `${task.title}. ${task.situation}`,
  score: task.points,
  competency: (["ai-courseware", "ai-courseware", "ai-activity", "smart-quiz", "ai-pedagogy"] as CompetencyArea[])[index],
  difficulty: index < 2 ? "intermediate" : "advanced",
  subject: index === 1 ? "Geografi" : index === 4 ? "Bahasa Inggeris" : "Sains",
  domainLabel: "Digital Performance Simulation",
  simulation: {
    screen: "easiclass-simulator",
    expectedAction: task.steps ? "order-workflow" : task.id === 2 ? "click-correct-hotspot" : task.id === 3 ? "drop-snapshot-to-ai-activity" : "complete-guided-actions",
    correctTarget: task.id === 2 ? { x: 58, y: 34, width: 24, height: 18 } : undefined,
    correctOrder: task.correctOrder,
    requiredSteps: task.steps?.map((step) => step.text),
    stepOptions: task.steps?.map((step) => ({ id: step.id, label: step.text })),
    guidedActions: task.stepsToComplete,
    dragItems: task.id === 3
      ? [
          { id: "snapshot", label: "Snapshot Buku Teks" },
          { id: "pdf", label: "PDF nota guru" },
          { id: "browser", label: "Web browser link" },
        ]
      : undefined,
    dropZones: task.id === 3
      ? [
          { id: "ai-activity", label: "AI Activity / OCR Converter", accepts: "snapshot" },
          { id: "whiteboard", label: "Whiteboard canvas", accepts: "marker" },
        ]
      : undefined,
  },
  rubric: task.steps
    ? ["Urutan betul = 2 markah"]
    : task.id === 3
      ? ["Drag Snapshot Buku Teks into AI Activity / OCR Converter = full marks"]
    : task.stepsToComplete?.map((step) => `${step.instruction.replace(/^\d+\.\s*/, "")} = partial mark`),
  recommendedModule: task.title.replace(/^Tugasan \d+:\s*/, ""),
}));

export const missionScenarioQuestions: AssessmentQuestion[] = [
  {
    id: "C-001",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Smart Quiz menunjukkan majoriti murid salah pada satu konsep fotosintesis. Apakah tindakan profesional terbaik selepas melihat data tersebut?",
    score: 3,
    competency: "lesson-analytics",
    difficulty: "intermediate",
    subject: "Sains",
    domainLabel: "Analysis Mission",
    options: [
      { id: "A", label: "Teruskan topik seterusnya kerana kuiz sudah selesai" },
      { id: "B", label: "Gunakan Lesson Analytics untuk kenal pasti miskonsepsi dan lakukan reteaching", isCorrect: true },
      { id: "C", label: "Padam soalan itu daripada rekod" },
      { id: "D", label: "Minta semua murid ulang kuiz tanpa penerangan" },
    ],
    explanation: "Analitik perlu digunakan untuk mengenal pasti miskonsepsi dan merancang intervensi.",
    recommendedModule: "Data-Driven Intervention",
  },
  {
    id: "C-002",
    section: "C",
    type: "scenario-choice",
    prompt:
      "AI menjana bahan Sejarah yang kelihatan menarik tetapi guru belum pasti ketepatannya. Apakah pilihan paling sesuai sebelum digunakan?",
    score: 3,
    competency: "ai-pedagogy",
    difficulty: "advanced",
    subject: "Sejarah",
    domainLabel: "AI Mission",
    options: [
      { id: "A", label: "Terus guna kerana AI lebih pantas" },
      { id: "B", label: "Semak fakta, ubah suai kandungan, dan pastikan sesuai dengan objektif PdP", isCorrect: true },
      { id: "C", label: "Buang semua kandungan AI" },
      { id: "D", label: "Minta murid tentukan sama ada kandungan betul" },
    ],
    explanation: "AI output perlu disahkan oleh guru dan disesuaikan dengan objektif pembelajaran.",
    recommendedModule: "AI Validation and Ethics",
  },
  {
    id: "C-003",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Dalam kelas Bahasa Inggeris, murid pasif ketika latihan speaking. Guru mahu menggunakan Role Talk untuk meningkatkan keyakinan murid. Apakah reka bentuk aktiviti paling sesuai?",
    score: 3,
    competency: "ai-pedagogy",
    difficulty: "intermediate",
    subject: "Bahasa Inggeris",
    domainLabel: "Teacher Mission",
    options: [
      { id: "A", label: "Berikan skrip yang sama kepada semua murid tanpa peranan" },
      { id: "B", label: "Tetapkan watak, beri contoh sebutan, dan jalankan latihan Role Talk berpasangan", isCorrect: true },
      { id: "C", label: "Gantikan guru dengan AI sepanjang kelas" },
      { id: "D", label: "Gunakan Role Talk hanya sebagai hiasan slaid" },
    ],
    explanation: "Role Talk paling bernilai apabila murid diberikan peranan, model bahasa, dan peluang bertutur secara interaktif.",
    recommendedModule: "Role Talk Pedagogy",
  },
  {
    id: "C-004",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Guru Matematik mendapati murid lemah memahami pecahan. Apakah penggunaan EasiClass yang paling sesuai untuk membina kefahaman secara visual?",
    score: 3,
    competency: "whiteboard-smart-ink",
    difficulty: "foundation",
    subject: "Matematik",
    domainLabel: "Teacher Mission",
    options: [
      { id: "A", label: "Gunakan Smart Ink, subject tools, dan contoh visual langkah demi langkah", isCorrect: true },
      { id: "B", label: "Hanya beri nota PDF tanpa aktiviti" },
      { id: "C", label: "Mulakan kuiz tanpa penerangan semula" },
      { id: "D", label: "Padam semua anotasi murid" },
    ],
    explanation: "Matematik memerlukan visualisasi, anotasi, dan alat subjek untuk membantu murid membina konsep.",
    recommendedModule: "Smart Ink and Subject Tools",
  },
  {
    id: "C-005",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Sekolah mahu merancang PLC selepas laporan menunjukkan ramai guru lemah dalam Hybrid Learning. Apakah tindakan terbaik School Admin?",
    score: 3,
    competency: "hybrid-learning",
    difficulty: "advanced",
    subject: "School Leadership",
    domainLabel: "Leadership Mission",
    options: [
      { id: "A", label: "Abaikan data kerana latihan memerlukan masa" },
      { id: "B", label: "Susun PLC berfokus Live Session, collaboration, dan class management berdasarkan competency gap", isCorrect: true },
      { id: "C", label: "Minta semua guru ulang peperiksaan tanpa latihan" },
      { id: "D", label: "Hanya hantar sijil kepada guru yang sudah lulus" },
    ],
    explanation: "Data competency perlu diterjemahkan kepada PLC yang spesifik dan boleh dilaksanakan.",
    recommendedModule: "PLC Planning from Analytics",
  },
  {
    id: "C-006",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Guru ingin menggunakan AI Image untuk topik geografi tempatan. Apakah prompt paling sesuai untuk menghasilkan bahan yang relevan dan boleh digunakan dalam PdP?",
    score: 3,
    competency: "ai-courseware",
    difficulty: "intermediate",
    subject: "Geografi",
    domainLabel: "AI Mission",
    options: [
      { id: "A", label: "Gambar cantik" },
      { id: "B", label: "Realistic image of Mount Kinabalu landscape for Form 1 Geography lesson, clear labels, classroom presentation style", isCorrect: true },
      { id: "C", label: "Apa-apa sahaja tentang Malaysia" },
      { id: "D", label: "Buatkan semua kerja guru" },
    ],
    explanation: "Prompt yang baik menyatakan objek, konteks, tahap, tujuan PdP, dan gaya visual.",
    recommendedModule: "Prompt Engineering Basics",
  },
  {
    id: "C-007",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Selepas aktiviti Smart Quiz, seorang murid mendapat markah rendah tetapi aktif bertanya soalan. Apakah intervensi yang paling seimbang?",
    score: 3,
    competency: "data-intervention",
    difficulty: "advanced",
    subject: "Classroom Intervention",
    domainLabel: "Analysis Mission",
    options: [
      { id: "A", label: "Label murid tersebut sebagai gagal" },
      { id: "B", label: "Gabungkan data kuiz dengan pemerhatian kelas dan beri sokongan susulan yang spesifik", isCorrect: true },
      { id: "C", label: "Abaikan pertanyaan murid" },
      { id: "D", label: "Bandingkan murid tersebut secara terbuka" },
    ],
    explanation: "Keputusan intervensi perlu menggabungkan analytics dengan judgement profesional guru.",
    recommendedModule: "Intervention Planning",
  },
  {
    id: "C-008",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Dalam kelas hibrid, murid di rumah tidak dapat mengikuti aktiviti kerana guru hanya menulis di papan tanpa share session. Apakah keputusan terbaik?",
    score: 3,
    competency: "hybrid-learning",
    difficulty: "intermediate",
    subject: "Hybrid Learning",
    domainLabel: "Teacher Mission",
    options: [
      { id: "A", label: "Teruskan kelas untuk murid fizikal sahaja" },
      { id: "B", label: "Aktifkan Live Session, kongsi paparan, dan gunakan collaboration/feedback tools", isCorrect: true },
      { id: "C", label: "Minta murid rumah membaca buku sendiri" },
      { id: "D", label: "Matikan semua aktiviti interaktif" },
    ],
    explanation: "Hybrid learning memerlukan akses paparan, aktiviti kolaborasi, dan maklum balas untuk murid jarak jauh.",
    recommendedModule: "Hybrid Learning Lab",
  },
  {
    id: "C-009",
    section: "C",
    type: "scenario-choice",
    prompt:
      "PPD mahu mengenal pasti sekolah yang memerlukan latihan tambahan berdasarkan dashboard. Apakah indikator paling berguna?",
    score: 3,
    competency: "lesson-analytics",
    difficulty: "advanced",
    subject: "PPD Leadership",
    domainLabel: "Leadership Mission",
    options: [
      { id: "A", label: "Bilangan guru sahaja tanpa melihat prestasi" },
      { id: "B", label: "Pass rate, competency gap, retake count, dan participation trend mengikut sekolah", isCorrect: true },
      { id: "C", label: "Warna logo sekolah" },
      { id: "D", label: "Jumlah sijil dicetak sahaja" },
    ],
    explanation: "PPD memerlukan gabungan participation, pass rate, retake dan competency gap untuk merancang sokongan.",
    recommendedModule: "District Analytics",
  },
  {
    id: "C-010",
    section: "C",
    type: "scenario-choice",
    prompt:
      "Guru Sains mahu menukar gambar soalan buku teks kepada aktiviti interaktif. Apakah semakan penting sebelum aktiviti diberikan kepada murid?",
    score: 3,
    competency: "ai-activity",
    difficulty: "intermediate",
    subject: "Sains",
    domainLabel: "AI Mission",
    options: [
      { id: "A", label: "Terus publish tanpa semakan kerana OCR automatik" },
      { id: "B", label: "Semak hasil OCR, jawapan, tahap kesukaran, dan kesesuaian aktiviti dengan objektif", isCorrect: true },
      { id: "C", label: "Padam objektif pembelajaran" },
      { id: "D", label: "Gunakan aktiviti hanya jika murid meminta" },
    ],
    explanation: "AI Activity daripada snapshot perlu disahkan dari segi OCR, jawapan, tahap, dan objektif PdP.",
    recommendedModule: "AI Activity Review",
  },
];

export const sampleAssessmentPack: AssessmentPack = {
  id: "sabah-maxhub-easiclass-2026-pilot",
  name: "Sabah MAXHUB EasiClass Certification 2026 - Pilot",
  version: "1.0",
  status: "published",
  totalScore: 180,
  sections: [
    { id: "A", title: "Knowledge Assessment", totalScore: 80 },
    { id: "B", title: "Digital Simulation", totalScore: 40 },
    { id: "C", title: "Mission-Based Assessment", totalScore: 60 },
  ],
  achievementRules: [
    {
      minPercentage: 85,
      label: "MAXHUB Certified Educator - Advanced",
      certificateEligible: true,
    },
    {
      minPercentage: 70,
      label: "MAXHUB Certified Educator",
      certificateEligible: true,
    },
    {
      minPercentage: 50,
      label: "Digital Classroom Practitioner",
      certificateEligible: true,
    },
    {
      minPercentage: 0,
      label: "Retake Required",
      certificateEligible: false,
    },
  ],
  retakePolicy: {
    minimumDaysBeforeRetake: 7,
    maximumAttemptsPerYear: 3,
  },
  questions: [
    ...importedMCQQuestions,
    ...sectionBSimulationTaskBank,
    ...missionScenarioQuestions,
  ],
};

export function resolveAchievement(
  score: number,
  totalScore: number,
  rules: AchievementRule[],
) {
  const percentage = Math.round((score / totalScore) * 100);
  const sortedRules = [...rules].sort((a, b) => b.minPercentage - a.minPercentage);
  const achievement = sortedRules.find((rule) => percentage >= rule.minPercentage) ?? sortedRules.at(-1);

  return {
    score,
    totalScore,
    percentage,
    achievementLabel: achievement?.label ?? "Unclassified",
    certificateEligible: achievement?.certificateEligible ?? false,
  };
}
