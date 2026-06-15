"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardList,
  FileBadge,
  Gauge,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Medal,
  PencilRuler,
  QrCode,
  RefreshCcw,
  School,
  ShieldCheck,
  TabletSmartphone,
  Upload,
  Plus,
  Pencil,
  Archive,
  ArrowLeft,
  ArrowRight,
  Building2,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  Filter,
  Flag,
  Languages,
  ListChecks,
  LogOut,
  Mail,
  Map as MapIcon,
  MapPin,
  Route,
  Settings,
  Timer,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { resolveAchievement, sampleAssessmentPack } from "@/lib/assessment";
import type { AssessmentQuestion, CompetencyArea, QuestionType } from "@/lib/assessment";

type UserRole = "candidate" | "school-admin" | "ppd-admin" | "jpns-admin" | "super-admin";
type View =
  | "candidate"
  | "exam"
  | "certificate"
  | "retake"
  | "school"
  | "ppd"
  | "jpns"
  | "admin"
  | "users"
  | "settings";
type ExamPhase = "briefing" | "knowledge" | "simulation" | "mission" | "review" | "result";

type NavItem = {
  view: View;
  icon: typeof LayoutDashboard;
  label: string;
};

type CompetencyResult = {
  area: CompetencyArea;
  label: string;
  earned: number;
  total: number;
  percentage: number;
  recommendation: string;
};

type EditableQuestion = AssessmentQuestion & {
  status: "draft" | "published" | "review";
  version: string;
  lastEdited: string;
};

type AdminAuditEntry = {
  id: string;
  action: string;
  actor: string;
  time: string;
  detail: string;
};

type SavedExamAttempt = {
  phase: ExamPhase;
  questionIndex: number;
  missionIndex: number;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  timerMinutes: number;
  activeSimulationId: string;
  simulationCompleted: Record<string, boolean>;
  simulationScores: Record<string, number>;
  hotspotAttempts: Record<string, string>;
  dragPlacements: Record<string, string>;
  simulationAttemptLog: string[];
  stepOrders: Record<string, string[]>;
  guidedProgress: Record<string, number>;
  simulationPrompts: Record<string, string>;
  lastSavedIso: string;
};

const roleProfiles: Record<
  UserRole,
  {
    label: string;
    description: string;
    initials: string;
    scope: string;
    defaultView: View;
    nav: NavItem[];
  }
> = {
  candidate: {
    label: "Teacher / Candidate",
    description: "Register, sit exams, view results, download certificates, manage retakes.",
    initials: "TC",
    scope: "Teacher Portal",
    defaultView: "candidate",
    nav: [
      { view: "candidate", icon: LayoutDashboard, label: "Home" },
      { view: "exam", icon: PencilRuler, label: "Exam" },
      { view: "certificate", icon: FileBadge, label: "Cert" },
      { view: "retake", icon: RefreshCcw, label: "Retake" },
    ],
  },
  "school-admin": {
    label: "School Admin",
    description: "View school participation, pass rate, teacher progress, and weak competencies.",
    initials: "SA",
    scope: "SK Tanjung Aru",
    defaultView: "school",
    nav: [
      { view: "school", icon: School, label: "School" },
      { view: "certificate", icon: FileBadge, label: "Certs" },
    ],
  },
  "ppd-admin": {
    label: "PPD Admin",
    description: "Monitor district schools, training needs, competency distribution, and retakes.",
    initials: "PA",
    scope: "PPD Kota Kinabalu",
    defaultView: "ppd",
    nav: [
      { view: "ppd", icon: Building2, label: "District" },
      { view: "school", icon: School, label: "Schools" },
    ],
  },
  "jpns-admin": {
    label: "JPNS Admin",
    description: "View Sabah-wide data, PPD comparisons, school maturity, and PLC recommendations.",
    initials: "JA",
    scope: "Sabah State",
    defaultView: "jpns",
    nav: [
      { view: "jpns", icon: BarChart3, label: "JPNS" },
      { view: "ppd", icon: Building2, label: "PPD" },
      { view: "school", icon: School, label: "Schools" },
    ],
  },
  "super-admin": {
    label: "Super Admin",
    description: "Manage question banks, assessment packs, users, certificates, and system settings.",
    initials: "SU",
    scope: "System",
    defaultView: "admin",
    nav: [
      { view: "admin", icon: Layers3, label: "Packs" },
      { view: "users", icon: UserCog, label: "Users" },
      { view: "jpns", icon: BarChart3, label: "Reports" },
      { view: "settings", icon: Settings, label: "Settings" },
    ],
  },
};

const candidate = {
  name: "Nur Aina Abdullah",
  id: "SME-CAN-2026-0142",
  school: "SK Tanjung Aru",
  ppd: "Kota Kinabalu",
  subject: "Science",
  role: "Teacher",
  attempt: 1,
  retakesLeft: 2,
  nextRetake: "19 Jun 2026",
};

const sections = [
  {
    id: "A",
    title: "Knowledge Assessment",
    score: 68,
    total: 80,
    status: "Completed",
    icon: BookOpenCheck,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "B",
    title: "Digital Simulation",
    score: 32,
    total: 40,
    status: "In review",
    icon: TabletSmartphone,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "C",
    title: "Mission Assessment",
    score: 46,
    total: 60,
    status: "Completed",
    icon: ClipboardList,
    tone: "bg-amber-100 text-amber-700",
  },
];

const sectionVisuals = {
  A: {
    name: "Knowledge",
    band: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-600 text-white",
    bar: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  B: {
    name: "Simulation",
    band: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    icon: "bg-sky-100 text-sky-700",
    active: "bg-sky-600 text-white",
    bar: "bg-sky-500",
    ring: "ring-sky-200",
  },
  C: {
    name: "Mission",
    band: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    icon: "bg-amber-100 text-amber-700",
    active: "bg-amber-500 text-slate-950",
    bar: "bg-amber-500",
    ring: "ring-amber-200",
  },
};

const phaseVisuals: Record<ExamPhase, (typeof sectionVisuals)[keyof typeof sectionVisuals]> = {
  briefing: sectionVisuals.B,
  knowledge: sectionVisuals.A,
  simulation: sectionVisuals.B,
  mission: sectionVisuals.C,
  review: sectionVisuals.A,
  result: sectionVisuals.B,
};

const simulationTypeVisuals: Record<string, { label: string; chip: string; panel: string; bar: string }> = {
  "step-order": {
    label: "Arrange workflow",
    chip: "bg-emerald-100 text-emerald-800",
    panel: "border-emerald-200 bg-emerald-50",
    bar: "bg-emerald-500",
  },
  hotspot: {
    label: "Hotspot click",
    chip: "bg-sky-100 text-sky-800",
    panel: "border-sky-200 bg-sky-50",
    bar: "bg-sky-500",
  },
  "drag-drop": {
    label: "Drag-drop",
    chip: "bg-amber-100 text-amber-900",
    panel: "border-amber-200 bg-amber-50",
    bar: "bg-amber-500",
  },
  "tool-selection": {
    label: "Guided actions",
    chip: "bg-rose-100 text-rose-800",
    panel: "border-rose-200 bg-rose-50",
    bar: "bg-rose-500",
  },
};

const surfaceVisuals = [
  {
    border: "border-sky-200",
    bg: "bg-sky-50",
    icon: "bg-sky-100 text-sky-700",
    text: "text-sky-800",
    bar: "bg-sky-500",
    active: "bg-sky-600 text-white",
  },
  {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-800",
    bar: "bg-emerald-500",
    active: "bg-emerald-600 text-white",
  },
  {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    text: "text-amber-900",
    bar: "bg-amber-500",
    active: "bg-amber-500 text-slate-950",
  },
  {
    border: "border-rose-200",
    bg: "bg-rose-50",
    icon: "bg-rose-100 text-rose-700",
    text: "text-rose-800",
    bar: "bg-rose-500",
    active: "bg-rose-600 text-white",
  },
];

const competencies = [
  { label: "Technical Operations", value: 92, color: "bg-emerald-500" },
  { label: "AI Courseware", value: 86, color: "bg-cyan-500" },
  { label: "Smart Quiz", value: 78, color: "bg-indigo-500" },
  { label: "Hybrid Learning", value: 72, color: "bg-fuchsia-500" },
  { label: "Lesson Analytics", value: 64, color: "bg-amber-500" },
];

const assessmentPacks = [
  {
    name: "Sabah Pilot Certification",
    version: "v1.0",
    status: "Published",
    items: "80 MCQ / 12 Simulation / 20 Mission",
  },
  {
    name: "Retake Pack",
    version: "v1.0",
    status: "Draft",
    items: "80 MCQ / 10 Simulation / 18 Mission",
  },
  {
    name: "PPD Training Diagnostic",
    version: "v0.8",
    status: "Review",
    items: "40 MCQ / 6 Simulation / 10 Mission",
  },
];

const initialEditableQuestions: EditableQuestion[] = sampleAssessmentPack.questions.slice(0, 12).map((question, index) => ({
  ...question,
  status: index < 6 ? "published" : index < 10 ? "draft" : "review",
  version: index < 6 ? "v1.0" : "v1.1",
  lastEdited: index < 6 ? "Published pack" : "Today",
}));

const initialAuditEntries: AdminAuditEntry[] = [
  {
    id: "AUD-001",
    action: "Published",
    actor: "Super Admin",
    time: "09:12",
    detail: "Sabah Pilot Certification v1.0 activated",
  },
  {
    id: "AUD-002",
    action: "Scoring Rule",
    actor: "Assessment Lead",
    time: "10:04",
    detail: "Section B partial scoring enabled",
  },
  {
    id: "AUD-003",
    action: "Certificate",
    actor: "System",
    time: "11:18",
    detail: "SME-2026-000142 issued to Nur Aina Abdullah",
  },
];

function buildPublishChecklist(questions: EditableQuestion[], draftItems: number, reviewItems: number) {
  const publishQueue = questions.filter((question) => question.status === "draft" || question.status === "review");
  const sectionCounts = sampleAssessmentPack.questions.reduce(
    (acc, question) => ({ ...acc, [question.section]: acc[question.section] + 1 }),
    { A: 0, B: 0, C: 0 } as Record<"A" | "B" | "C", number>,
  );
  const scoreBlueprintOk = sampleAssessmentPack.sections.every((section) =>
    (section.id === "A" && section.totalScore === 80) ||
    (section.id === "B" && section.totalScore === 40) ||
    (section.id === "C" && section.totalScore === 60),
  );

  return [
    {
      label: "Draft queue ready",
      detail: `${draftItems} draft items staged`,
      passed: draftItems > 0,
    },
    {
      label: "Admin review cleared",
      detail: reviewItems === 0 ? "No items waiting for review" : `${reviewItems} imported items need approval`,
      passed: reviewItems === 0,
    },
    {
      label: "Section blueprint locked",
      detail: `A${sectionCounts.A} / B${sectionCounts.B} / C${sectionCounts.C} mapped to 80/40/60 marks`,
      passed: scoreBlueprintOk,
    },
    {
      label: "Answer keys and simulation steps",
      detail: "Every queued item has an answer key or Section B scoring steps",
      passed: publishQueue.every((question) =>
        question.section === "B"
          ? Boolean(question.simulation?.stepOptions?.length || question.simulation?.guidedActions?.length)
          : Boolean(question.options?.some((option) => option.isCorrect)),
      ),
    },
    {
      label: "Competency mapping",
      detail: "All queued items are linked to a competency area",
      passed: publishQueue.every((question) => Boolean(question.competency)),
    },
  ];
}

const districtStats = [
  { label: "Kota Kinabalu", pass: 82, teachers: 428 },
  { label: "Sandakan", pass: 74, teachers: 316 },
  { label: "Tawau", pass: 69, teachers: 287 },
  { label: "Keningau", pass: 63, teachers: 204 },
];

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

const examAttemptStorageKey = "maxhub-demo-exam-attempt";

function readSavedExamAttempt() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(examAttemptStorageKey);
    if (!value) return null;
    return JSON.parse(value) as SavedExamAttempt;
  } catch {
    return null;
  }
}

function writeSavedExamAttempt(attempt: SavedExamAttempt) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(examAttemptStorageKey, JSON.stringify(attempt));
}

function clearSavedExamAttempt() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(examAttemptStorageKey);
}

function formatSavedTime(iso?: string) {
  if (!iso) return "Not saved yet";
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "Saved recently";
  return `Saved ${date.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`;
}

const competencyLabels: Record<CompetencyArea, string> = {
  "technical-operations": "Technical Operations",
  "whiteboard-smart-ink": "Whiteboard & Smart Ink",
  "ai-courseware": "AI Courseware",
  "ai-activity": "AI Activity",
  "smart-quiz": "Smart Quiz",
  "hybrid-learning": "Hybrid Learning",
  "lesson-analytics": "Lesson Analytics",
  "classroom-engagement": "Classroom Engagement",
  "ai-pedagogy": "AI Pedagogy",
  "data-intervention": "Data Intervention",
};

const competencyRecommendations: Record<CompetencyArea, string> = {
  "technical-operations": "Repeat the quick-start operations lab and practise attendance, import, and classroom setup.",
  "whiteboard-smart-ink": "Practise Smart Ink, subject tools, masking, and visual explanation workflows.",
  "ai-courseware": "Review prompt structure, AI courseware generation, and teacher validation checkpoints.",
  "ai-activity": "Practise turning snapshots and content into reviewed AI activities before publishing.",
  "smart-quiz": "Run a Smart Quiz cycle: generate, launch, review responses, and reteach weak concepts.",
  "hybrid-learning": "Practise live session sharing, remote learner feedback, and hybrid classroom routines.",
  "lesson-analytics": "Use Lesson History and Class Insight to turn results into reteaching decisions.",
  "classroom-engagement": "Try random picker, team competition, timers, and interaction routines in a lesson.",
  "ai-pedagogy": "Focus on ethical AI use, role-based activities, and teacher judgement before using AI output.",
  "data-intervention": "Build a simple intervention plan from quiz data, observation, and student follow-up needs.",
};

function getQuestionWeight(question: AssessmentQuestion, sectionCounts: Record<"A" | "B" | "C", number>, sectionBMultiplier: number) {
  if (question.section === "A") return 80 / Math.max(sectionCounts.A, 1);
  if (question.section === "C") return 60 / Math.max(sectionCounts.C, 1);
  return question.score * sectionBMultiplier;
}

function calculateStepOrderScore(question: AssessmentQuestion, orderIds: string[]) {
  const expected = question.simulation?.correctOrder ?? [];
  if (expected.length === 0) return 0;

  const correctPositions = expected.filter((stepId, index) => stepId === orderIds[index]).length;
  return Number(((correctPositions / expected.length) * question.score).toFixed(2));
}

function calculateGuidedScore(question: AssessmentQuestion, completedActions: number) {
  const actions = question.simulation?.guidedActions ?? [];
  if (actions.length === 0) return 0;

  return Number(((Math.min(completedActions, actions.length) / actions.length) * question.score).toFixed(2));
}

function getCompetencyStatus(percentage: number) {
  if (percentage >= 85) return "Advanced";
  if (percentage >= 70) return "Ready";
  if (percentage >= 50) return "Developing";
  return "Needs support";
}

function buildCompetencyReport({
  knowledgeQuestions,
  simulationQuestions,
  missionQuestions,
  answers,
  simulationScores,
}: {
  knowledgeQuestions: AssessmentQuestion[];
  simulationQuestions: AssessmentQuestion[];
  missionQuestions: AssessmentQuestion[];
  answers: Record<string, string>;
  simulationScores: Record<string, number>;
}) {
  const sectionCounts = {
    A: knowledgeQuestions.length,
    B: simulationQuestions.length,
    C: missionQuestions.length,
  };
  const rawSimulationTotal = simulationQuestions.reduce((sum, question) => sum + question.score, 0);
  const sectionBMultiplier = rawSimulationTotal > 0 ? 40 / rawSimulationTotal : 0;
  const totals = new Map<CompetencyArea, { earned: number; total: number }>();

  [...knowledgeQuestions, ...simulationQuestions, ...missionQuestions].forEach((question) => {
    const weight = getQuestionWeight(question, sectionCounts, sectionBMultiplier);
    const current = totals.get(question.competency) ?? { earned: 0, total: 0 };
    const isCorrect = question.options?.find((option) => option.id === answers[question.id])?.isCorrect;
    const earned =
      question.section === "B"
        ? (simulationScores[question.id] ?? 0) * sectionBMultiplier
        : isCorrect
          ? weight
          : 0;

    totals.set(question.competency, {
      earned: current.earned + earned,
      total: current.total + weight,
    });
  });

  return Array.from(totals.entries())
    .map(([area, value]) => ({
      area,
      label: competencyLabels[area],
      earned: Math.round(value.earned),
      total: Math.round(value.total),
      percentage: value.total > 0 ? Math.round((value.earned / value.total) * 100) : 0,
      recommendation: competencyRecommendations[area],
    }))
    .sort((a, b) => a.percentage - b.percentage);
}

export default function Home() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [view, setView] = useState<View>("candidate");
  const [selectedTool, setSelectedTool] = useState("AI Courseware");
  const [publishedPack, setPublishedPack] = useState("Sabah Pilot Certification");
  const [language, setLanguage] = useState<"EN" | "BM" | "中文">("EN");
  const activeProfile = role ? roleProfiles[role] : null;

  const totalScore = useMemo(
    () => sections.reduce((sum, section) => sum + section.score, 0),
    [],
  );
  const assessmentResult = resolveAchievement(
    totalScore,
    sampleAssessmentPack.totalScore,
    sampleAssessmentPack.achievementRules,
  );
  const percentage = assessmentResult.percentage;

  function signIn(nextRole: UserRole) {
    setRole(nextRole);
    setView(roleProfiles[nextRole].defaultView);
  }

  if (!role || !activeProfile) {
    return <RoleLogin onSignIn={signIn} />;
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white px-5 py-6 lg:block">
          <Brand />
          <nav className="mt-8 space-y-2">
            {activeProfile.nav.map((item) => (
              <NavButton
                key={item.view}
                view={item.view}
                active={view}
                onClick={setView}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} className="text-emerald-600" />
              {activeProfile.scope}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Signed in as {activeProfile.label}. Only permitted modules are visible.
            </p>
            <button
              onClick={() => setRole(null)}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6 lg:static lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="lg:hidden">
                <Brand compact />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-slate-500">{activeProfile.label}</p>
                <h1 className="text-2xl font-bold tracking-tight">MAXHUB EasiClass Educator Certification</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 md:flex">
                  <Languages className="ml-1 text-slate-500" size={16} />
                  {(["EN", "BM", "中文"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setLanguage(item)}
                      className={classNames(
                        "h-8 rounded-md px-2 text-xs font-bold",
                        language === item ? "bg-slate-950 text-white" : "text-slate-500",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <span className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 md:inline-flex">
                  {activeProfile.scope}
                </span>
                <button
                  onClick={() => setRole(null)}
                  className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 lg:hidden"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
                <div className="grid size-10 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                  {activeProfile.initials}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-5 pb-24 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            {view === "candidate" && (
              <CandidateView
                achievementLabel={assessmentResult.achievementLabel}
                percentage={percentage}
                totalScore={totalScore}
                language={language}
                onNavigate={setView}
              />
            )}
            {view === "exam" && (
              <ExamView selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
            )}
            {view === "certificate" && (
              <CertificateView percentage={percentage} totalScore={totalScore} />
            )}
            {view === "retake" && <RetakeView />}
            {view === "school" && <SchoolAdminView />}
            {view === "ppd" && <PpdAdminView />}
            {view === "jpns" && <JpnsAdminView />}
            {view === "admin" && (
              <AdminView publishedPack={publishedPack} setPublishedPack={setPublishedPack} />
            )}
            {view === "users" && <UsersView />}
            {view === "settings" && <SettingsView />}
          </div>

          <MobileNav active={view} items={activeProfile.nav} onClick={setView} />
        </section>
      </div>
    </main>
  );
}

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={classNames("grid overflow-hidden rounded-lg", compact ? "h-10 w-24" : "h-12 w-32", inverse ? "bg-white" : "bg-white border border-slate-200")}>
        <Image
          src="/brand/maxhub-logo.jpg"
          alt="MAXHUB"
          width={1280}
          height={720}
          className="h-full w-full object-contain"
        />
      </div>
      {!compact && (
        <div>
          <p className={classNames("text-sm font-bold tracking-wide", inverse ? "text-white" : "text-slate-950")}>MAXHUB</p>
          <p className={classNames("text-xs font-medium", inverse ? "text-slate-300" : "text-slate-500")}>EasiClass Certification</p>
        </div>
      )}
      {compact && (
        <div>
          <p className="text-sm font-bold text-slate-950">MAXHUB</p>
          <p className="text-xs text-slate-500">Certification</p>
        </div>
      )}
    </div>
  );
}

function RoleLogin({ onSignIn }: { onSignIn: (role: UserRole) => void }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("teacher@sabah.edu.my");
  const [detectedRole, setDetectedRole] = useState<UserRole>("candidate");
  const [authNotice, setAuthNotice] = useState("Role detected: Teacher / Candidate.");
  const roleOrder: UserRole[] = [
    "candidate",
    "school-admin",
    "ppd-admin",
    "jpns-admin",
    "super-admin",
  ];

  function detectRole(value: string) {
    setEmail(value);
    const nextRole = value.includes("school")
      ? "school-admin"
      : value.includes("ppd")
        ? "ppd-admin"
        : value.includes("jpns")
          ? "jpns-admin"
          : value.includes("admin")
            ? "super-admin"
            : "candidate";
    setDetectedRole(nextRole);
    setAuthNotice(`Role detected: ${roleProfiles[nextRole].label}.`);
  }

  function chooseRole(nextRole: UserRole) {
    setDetectedRole(nextRole);
    setEmail(
      nextRole === "candidate"
        ? "teacher@sabah.edu.my"
        : nextRole === "school-admin"
          ? "school@sabah.edu.my"
          : nextRole === "ppd-admin"
            ? "ppd@sabah.edu.my"
            : nextRole === "jpns-admin"
              ? "jpns@sabah.edu.my"
              : "admin@sabah.edu.my",
    );
    setAuthNotice(`Role detected: ${roleProfiles[nextRole].label}.`);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col">
        <header className="overflow-hidden rounded-[1.35rem] bg-[#071f54] text-white shadow-xl">
          <div className="h-2 bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400" />
          <div className="p-5 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <Brand inverse />
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
              Sabah 2026
            </span>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-cyan-200">Sabah MAXHUB Educator Certification</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                Official digital teaching certification.
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-black text-sky-100">Register</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black text-emerald-100">Assess</span>
                <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-black text-amber-100">Certify</span>
                <span className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-black text-rose-100">Report</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/10 p-3">
              {[
                ["180", "Score"],
                ["90m", "Exam"],
                ["QR", "Verify"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-white/10 p-3 text-center">
                  <p className="text-lg font-black">{value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-cyan-100">{label}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </header>

        <section className="mt-5 grid flex-1 gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="overflow-hidden rounded-[1.35rem] border border-sky-200 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
            <div className="p-4 md:p-5">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
              {(["login", "register", "forgot"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={classNames(
                    "h-10 rounded-md text-sm font-bold capitalize",
                    mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            {mode === "login" && (
              <div className="mt-5 space-y-4">
                <AuthField label="Email" value={email} onChange={detectRole} placeholder="teacher@sabah.edu.my" />
                <AuthField label="Password" value="password123" onChange={() => null} placeholder="Password" type="password" />
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                  <p className="text-sm font-bold text-cyan-900">{authNotice}</p>
                  <label className="mt-3 block">
                    <span className="text-xs font-black uppercase tracking-wide text-cyan-700">Access profile</span>
                    <select
                      value={detectedRole}
                      onChange={(event) => chooseRole(event.target.value as UserRole)}
                      className="mt-2 h-11 w-full rounded-lg border border-cyan-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none"
                    >
                      {roleOrder.map((roleKey) => (
                        <option key={roleKey} value={roleKey}>
                          {roleProfiles[roleKey].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => onSignIn(detectedRole)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0575dd] text-sm font-black text-white shadow-lg shadow-blue-500/20"
                >
                  <LockKeyhole size={18} />
                  Sign in
                </button>
              </div>
            )}

            {mode === "register" && <RegistrationForm onComplete={() => onSignIn("candidate")} />}

            {mode === "forgot" && (
              <div className="mt-5 space-y-4">
                <AuthField label="Email" value={email} onChange={setEmail} placeholder="your@email.com" />
                <button
                  onClick={() => setAuthNotice("Password reset link prepared for the registered email.")}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0575dd] text-sm font-black text-white"
                >
                  <Mail size={18} />
                  Send reset link
                </button>
                <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{authNotice}</p>
              </div>
            )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400" />
            <div className="p-4 md:p-5">
            <p className="text-sm font-semibold text-slate-500">Certification workspaces</p>
            <h2 className="mt-1 text-xl font-black">One platform, role-based access</h2>
            <div className="mt-4 space-y-3">
              {roleOrder.map((roleKey, index) => {
                const profile = roleProfiles[roleKey];
                const visual = surfaceVisuals[index % surfaceVisuals.length];

                return (
                  <button
                    key={roleKey}
                    onClick={() => onSignIn(roleKey)}
                    className={classNames("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:bg-white", visual.border, visual.bg)}
                  >
                    <div className={classNames("grid size-11 shrink-0 place-items-center rounded-xl text-xs font-black", visual.icon)}>
                      {profile.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black">{profile.label}</h3>
                      <p className="truncate text-sm text-slate-500">{profile.scope}</p>
                    </div>
                    <ChevronRight className="shrink-0 text-slate-400" size={20} />
                  </button>
                );
              })}
            </div>
            </div>
          </div>
        </section>

        <footer className="mt-5 flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Powered by</p>
          <Image
            src="/brand/samasama-works-logo.jpg"
            alt="Samasama Works"
            width={1280}
            height={720}
            className="h-12 w-56 object-contain"
          />
        </footer>
      </div>
    </main>
  );
}

function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-slate-950"
      />
    </label>
  );
}

function RegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const fields = [
    "Full Name",
    "IC / Staff ID",
    "School",
    "PPD District",
    "Position",
    "Teaching Subject",
    "Phone",
    "Email",
  ];

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="text-sm font-bold text-slate-700">{field}</span>
            <input
              defaultValue={field === "Full Name" ? candidate.name : field === "School" ? candidate.school : ""}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">MAXHUB Experience</span>
        <select className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-950">
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>
      {submitted && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Registration submitted. Candidate profile is ready for assessment.
        </p>
      )}
      <button
        onClick={() => {
          setSubmitted(true);
          setTimeout(onComplete, 350);
        }}
        className="h-12 w-full rounded-lg bg-slate-950 text-sm font-black text-white"
      >
        Submit registration
      </button>
    </div>
  );
}

function NavButton({
  view,
  active,
  onClick,
  icon: Icon,
  label,
}: {
  view: View;
  active: View;
  onClick: (view: View) => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      onClick={() => onClick(view)}
      className={classNames(
        "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition",
        active === view
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
    >
      <Icon size={19} />
      {label}
    </button>
  );
}

function MobileNav({
  active,
  items,
  onClick,
}: {
  active: View;
  items: NavItem[];
  onClick: (view: View) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 shadow-[0_-12px_24px_rgba(15,23,42,0.08)] lg:hidden">
      <div
        className="mx-auto grid max-w-md gap-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => onClick(view)}
            className={classNames(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition",
              active === view ? "bg-slate-950 text-white" : "text-slate-500",
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function CandidateView({
  achievementLabel,
  percentage,
  totalScore,
  language,
  onNavigate,
}: {
  achievementLabel: string;
  percentage: number;
  totalScore: number;
  language: "EN" | "BM" | "中文";
  onNavigate: (view: View) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl bg-[#062a6f] p-5 text-white shadow-xl md:p-6">
        <div className="relative">
          <div className="absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/20" />
          <div className="absolute bottom-3 right-0 hidden text-7xl font-black text-white/5 sm:block">MAXHUB</div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-200">Your Certification · {language}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/60">{candidate.id}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">{candidate.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {candidate.school} · {candidate.ppd} · {candidate.subject}
              </p>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-300 text-[#062a6f]">
              <Medal size={30} />
            </div>
          </div>
        </div>
        <div className="relative mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Next step</p>
              <p className="mt-1 text-lg font-black">Continue Section B Simulation</p>
            </div>
            <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-[#062a6f]">{percentage}%</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["A", "Done", "68/80"],
              ["B", "Review", "32/40"],
              ["C", "Done", "46/60"],
            ].map(([id, status, score]) => {
              const visual = sectionVisuals[id as keyof typeof sectionVisuals];

              return (
                <div key={id} className="rounded-xl bg-white p-3 text-slate-950">
                  <span className={classNames("inline-flex size-8 items-center justify-center rounded-lg text-xs font-black", visual.icon)}>
                    {id}
                  </span>
                  <p className="mt-2 text-xs font-black text-slate-500">{status}</p>
                  <p className="text-sm font-black">{score}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate("exam")}
              className="h-11 rounded-lg bg-white text-sm font-black text-slate-950"
            >
              Continue Exam
            </button>
            <button
              onClick={() => onNavigate("certificate")}
              className="h-11 rounded-lg border border-white/25 text-sm font-black text-white"
            >
              My Certificate
            </button>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Metric label="Score" value={`${totalScore}/180`} />
          <Metric label="Result" value={`${percentage}%`} />
          <Metric label="Attempt" value={`#${candidate.attempt}`} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => onNavigate("exam")}
          className="flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-sky-600 p-4 text-left text-white shadow-md shadow-sky-200"
        >
          <span>
            <span className="block text-sm font-black">Continue</span>
            <span className="mt-1 block text-xs font-bold text-sky-100">Exam wizard</span>
          </span>
          <ArrowRight size={22} />
        </button>
        <button
          onClick={() => onNavigate("certificate")}
          className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-emerald-900"
        >
          <span>
            <span className="block text-sm font-black">Certificate</span>
            <span className="mt-1 block text-xs font-bold text-emerald-700">Ready</span>
          </span>
          <FileBadge size={22} />
        </button>
        <button
          onClick={() => setShowDetails((value) => !value)}
          className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900"
        >
          <span>
            <span className="block text-sm font-black">{showDetails ? "Hide details" : "View details"}</span>
            <span className="mt-1 block text-xs font-bold text-slate-500">Scores & support</span>
          </span>
          <ChevronRight className={showDetails ? "rotate-90 transition" : "transition"} size={22} />
        </button>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.id} className={classNames("overflow-hidden rounded-2xl border bg-white shadow-sm", sectionVisuals[section.id as keyof typeof sectionVisuals].border)}>
            <div className={classNames("h-2 bg-gradient-to-r", sectionVisuals[section.id as keyof typeof sectionVisuals].band)} />
            <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className={classNames("grid size-11 place-items-center rounded-xl", sectionVisuals[section.id as keyof typeof sectionVisuals].icon)}>
                <section.icon size={20} />
              </div>
              <span className={classNames("rounded-full px-2.5 py-1 text-xs font-black", sectionVisuals[section.id as keyof typeof sectionVisuals].bg, sectionVisuals[section.id as keyof typeof sectionVisuals].text)}>
                {section.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Section {section.id}</p>
            <h3 className="mt-1 min-h-10 text-base font-bold leading-5 text-slate-950">{section.title}</h3>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-2xl font-bold">{section.score}</p>
              <p className="text-sm font-medium text-slate-500">/{section.total}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={classNames("h-full rounded-full", sectionVisuals[section.id as keyof typeof sectionVisuals].bar)} style={{ width: `${Math.round((section.score / section.total) * 100)}%` }} />
            </div>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
        <div className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Achievement</p>
            <h3 className="text-xl font-bold text-slate-950">{achievementLabel}</h3>
          </div>
          <Award className="text-emerald-600" size={30} />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatusPill icon={ShieldCheck} label="Certificate Ready" />
          <StatusPill icon={CalendarClock} label={`Retakes ${candidate.retakesLeft}`} />
          <StatusPill icon={School} label={candidate.ppd} />
          <StatusPill icon={GraduationCap} label={candidate.role} />
        </div>
        </div>
      </section>

      {showDetails && (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Competency Report</h3>
          <Gauge className="text-slate-500" size={22} />
        </div>
        <div className="mt-4 space-y-4">
          {competencies.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-950">{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={classNames("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}

function ExamView({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: string;
  setSelectedTool: (value: string) => void;
}) {
  const tools = [
    { label: "AI Courseware", tone: "bg-sky-100 text-sky-800 border-sky-200" },
    { label: "AI Image", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "AI Activity", tone: "bg-amber-100 text-amber-900 border-amber-200" },
    { label: "Smart Quiz", tone: "bg-rose-100 text-rose-800 border-rose-200" },
    { label: "Role Talk", tone: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  ];
  const knowledgeQuestions = sampleAssessmentPack.questions.filter((question) => question.section === "A");
  const simulationQuestionBank = sampleAssessmentPack.questions.filter((question) => question.section === "B");
  const missionQuestions = sampleAssessmentPack.questions.filter((question) => question.section === "C");
  const defaultStepOrders = Object.fromEntries(
    simulationQuestionBank
      .filter((question) => question.simulation?.stepOptions)
      .map((question) => [
        question.id,
        question.simulation?.stepOptions?.map((step) => step.id) ?? [],
      ]),
  );
  const [savedAttemptSeed] = useState<SavedExamAttempt | null>(() => readSavedExamAttempt());
  const [phase, setPhaseState] = useState<ExamPhase>(savedAttemptSeed?.phase ?? "briefing");
  const [questionIndex, setQuestionIndexState] = useState(Math.min(savedAttemptSeed?.questionIndex ?? 0, Math.max(knowledgeQuestions.length - 1, 0)));
  const [missionIndex, setMissionIndexState] = useState(Math.min(savedAttemptSeed?.missionIndex ?? 0, Math.max(missionQuestions.length - 1, 0)));
  const [answers, setAnswersState] = useState<Record<string, string>>(savedAttemptSeed?.answers ?? {});
  const [flagged, setFlaggedState] = useState<Record<string, boolean>>(savedAttemptSeed?.flagged ?? {});
  const [timerMinutes, setTimerMinutesState] = useState(savedAttemptSeed?.timerMinutes ?? 90);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [showBriefingDetails, setShowBriefingDetails] = useState(false);
  const [simulationFeedback, setSimulationFeedback] = useState("Complete each task. The simulator records partial marks automatically.");
  const [activeSimulationId, setActiveSimulationIdState] = useState(savedAttemptSeed?.activeSimulationId ?? simulationQuestionBank[0]?.id ?? "");
  const [simulationCompleted, setSimulationCompletedState] = useState<Record<string, boolean>>(savedAttemptSeed?.simulationCompleted ?? {});
  const [simulationScores, setSimulationScoresState] = useState<Record<string, number>>(savedAttemptSeed?.simulationScores ?? {});
  const [hotspotAttempts, setHotspotAttemptsState] = useState<Record<string, string>>(savedAttemptSeed?.hotspotAttempts ?? {});
  const [dragPlacements, setDragPlacementsState] = useState<Record<string, string>>(savedAttemptSeed?.dragPlacements ?? {});
  const [simulationAttemptLog, setSimulationAttemptLogState] = useState<string[]>(savedAttemptSeed?.simulationAttemptLog ?? []);
  const [stepOrders, setStepOrdersState] = useState<Record<string, string[]>>(savedAttemptSeed?.stepOrders ?? defaultStepOrders);
  const [guidedProgress, setGuidedProgressState] = useState<Record<string, number>>(savedAttemptSeed?.guidedProgress ?? {});
  const [simulationPrompts, setSimulationPromptsState] = useState<Record<string, string>>(savedAttemptSeed?.simulationPrompts ?? {});
  const [autosaveText, setAutosaveText] = useState(formatSavedTime(savedAttemptSeed?.lastSavedIso));
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "flagged" | "unanswered">("all");
  const activeSimulation = simulationQuestionBank.find((question) => question.id === activeSimulationId) ?? simulationQuestionBank[0];
  const completedSimulation = simulationQuestionBank.filter((question) => simulationCompleted[question.id]).length;
  const rawSimulationScore = simulationQuestionBank.reduce((sum, question) => sum + (simulationScores[question.id] ?? 0), 0);
  const rawSimulationTotal = simulationQuestionBank.reduce((sum, question) => sum + question.score, 0);
  const knowledgeAnswered = knowledgeQuestions.filter((question) => answers[question.id]).length;
  const missionAnswered = missionQuestions.filter((question) => answers[question.id]).length;
  const totalDemoItems = knowledgeQuestions.length + missionQuestions.length + simulationQuestionBank.length;
  const answeredCount = knowledgeAnswered + missionAnswered + completedSimulation;
  const canSubmit =
    knowledgeAnswered === knowledgeQuestions.length &&
    missionAnswered === missionQuestions.length &&
    completedSimulation === simulationQuestionBank.length;
  const correctKnowledge = knowledgeQuestions.filter((question) =>
    question.options?.find((option) => option.id === answers[question.id])?.isCorrect,
  ).length;
  const correctMission = missionQuestions.filter((question) =>
    question.options?.find((option) => option.id === answers[question.id])?.isCorrect,
  ).length;
  const sectionAScore = Math.round((correctKnowledge / knowledgeQuestions.length) * 80);
  const sectionBScore = rawSimulationTotal > 0 ? Math.round((rawSimulationScore / rawSimulationTotal) * 40) : 0;
  const sectionCScore = Math.round((correctMission / missionQuestions.length) * 60);
  const previewScore = sectionAScore + sectionBScore + sectionCScore;
  const previewPercentage = Math.round((previewScore / 180) * 100);
  const achievement = resolveAchievement(previewScore, 180, sampleAssessmentPack.achievementRules);
  const competencyReport = useMemo(
    () =>
      buildCompetencyReport({
        knowledgeQuestions,
        simulationQuestions: simulationQuestionBank,
        missionQuestions,
        answers,
        simulationScores,
      }),
    [answers, knowledgeQuestions, missionQuestions, simulationQuestionBank, simulationScores],
  );
  const currentQuestion = knowledgeQuestions[questionIndex];
  const currentMission = missionQuestions[missionIndex];
  const reviewQuestions = [...knowledgeQuestions, ...missionQuestions].filter((question) => {
    if (reviewFilter === "flagged") return flagged[question.id];
    if (reviewFilter === "unanswered") return !answers[question.id];
    return true;
  });
  const currentVisual = phaseVisuals[phase];

  function persistAttempt(overrides: Partial<SavedExamAttempt> = {}) {
    const now = new Date().toISOString();
    const snapshot: SavedExamAttempt = {
      phase,
      questionIndex,
      missionIndex,
      answers,
      flagged,
      timerMinutes,
      activeSimulationId,
      simulationCompleted,
      simulationScores,
      hotspotAttempts,
      dragPlacements,
      simulationAttemptLog,
      stepOrders,
      guidedProgress,
      simulationPrompts,
      lastSavedIso: now,
      ...overrides,
    };

    writeSavedExamAttempt(snapshot);
    setAutosaveText("Saved just now");
  }

  function goToPhase(nextPhase: ExamPhase) {
    setPhaseState(nextPhase);
    persistAttempt({ phase: nextPhase });
  }

  function updateQuestionIndex(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, knowledgeQuestions.length - 1));
    setQuestionIndexState(boundedIndex);
    persistAttempt({ questionIndex: boundedIndex });
  }

  function updateMissionIndex(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, missionQuestions.length - 1));
    setMissionIndexState(boundedIndex);
    persistAttempt({ missionIndex: boundedIndex });
  }

  function saveAnswer(questionId: string, answer: string) {
    const nextAnswers = { ...answers, [questionId]: answer };
    setAnswersState(nextAnswers);
    persistAttempt({ answers: nextAnswers });
  }

  function toggleFlag(questionId: string) {
    const nextFlagged = { ...flagged, [questionId]: !flagged[questionId] };
    setFlaggedState(nextFlagged);
    persistAttempt({ flagged: nextFlagged });
  }

  function selectSimulation(questionId: string) {
    setActiveSimulationIdState(questionId);
    persistAttempt({ activeSimulationId: questionId });
  }

  function appendSimulationLog(entry: string, overrides: Partial<SavedExamAttempt> = {}) {
    const nextLog = [`${new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} · ${entry}`, ...simulationAttemptLog].slice(0, 8);
    setSimulationAttemptLogState(nextLog);
    persistAttempt({ simulationAttemptLog: nextLog, ...overrides });
    return nextLog;
  }

  function handleHotspotClick(question: AssessmentQuestion, hotspotId: string) {
    const nextHotspotAttempts = { ...hotspotAttempts, [question.id]: hotspotId };
    const correct = hotspotId === "ai-image-generator";
    const score = correct ? question.score : Math.min(0.5, question.score);

    setHotspotAttemptsState(nextHotspotAttempts);
    if (correct) {
      completeSimulationTask(
        question,
        score,
        "Correct hotspot selected: AI Image Generator. Full marks recorded.",
      );
      appendSimulationLog(`${question.id} hotspot correct`, {
        hotspotAttempts: nextHotspotAttempts,
        simulationCompleted: { ...simulationCompleted, [question.id]: true },
        simulationScores: { ...simulationScores, [question.id]: score },
      });
      return;
    }

    recordSimulationScore(question, score);
    setSimulationFeedback("Wrong hotspot. Partial attempt recorded. Try selecting the AI Image Generator inside Media.");
    appendSimulationLog(`${question.id} wrong hotspot: ${hotspotId}`, { hotspotAttempts: nextHotspotAttempts });
  }

  function handleDragDrop(question: AssessmentQuestion, zoneId: string, itemId: string) {
    const zone = question.simulation?.dropZones?.find((dropZone) => dropZone.id === zoneId);
    const nextDragPlacements = { ...dragPlacements, [question.id]: `${itemId}:${zoneId}` };
    const correct = zone?.accepts === itemId;
    const score = correct ? question.score : Math.min(0.5, question.score);

    setDragPlacementsState(nextDragPlacements);
    if (correct) {
      completeSimulationTask(
        question,
        score,
        "Correct drop: Snapshot Buku Teks sent to AI Activity / OCR Converter. Full marks recorded.",
      );
      appendSimulationLog(`${question.id} drag-drop correct`, {
        dragPlacements: nextDragPlacements,
        simulationCompleted: { ...simulationCompleted, [question.id]: true },
        simulationScores: { ...simulationScores, [question.id]: score },
      });
      return;
    }

    recordSimulationScore(question, score);
    setSimulationFeedback("Incorrect drop zone. Partial attempt recorded. Drag the textbook snapshot into AI Activity / OCR Converter.");
    appendSimulationLog(`${question.id} wrong drop: ${itemId} to ${zoneId}`, { dragPlacements: nextDragPlacements });
  }

  function moveSimulationStep(questionId: string, index: number, direction: "up" | "down") {
    const nextStepOrders = { ...stepOrders };
    const nextOrder = [...(nextStepOrders[questionId] ?? [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= nextOrder.length) return;

    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    nextStepOrders[questionId] = nextOrder;
    setStepOrdersState(nextStepOrders);
    persistAttempt({ stepOrders: nextStepOrders });
  }

  function isSimulationOrderCorrect(question: AssessmentQuestion) {
    const expected = question.simulation?.correctOrder ?? [];
    const actual = stepOrders[question.id] ?? [];

    return expected.length > 0 && expected.every((stepId, index) => stepId === actual[index]);
  }

  function recordSimulationScore(question: AssessmentQuestion, score: number) {
    const nextSimulationScores = {
      ...simulationScores,
      [question.id]: Math.max(simulationScores[question.id] ?? 0, Number(score.toFixed(2))),
    };
    setSimulationScoresState(nextSimulationScores);
    persistAttempt({ simulationScores: nextSimulationScores });
  }

  function completeSimulationTask(question: AssessmentQuestion, score: number, feedback: string) {
    const nextSimulationScores = {
      ...simulationScores,
      [question.id]: Math.max(simulationScores[question.id] ?? 0, Number(score.toFixed(2))),
    };
    const nextSimulationCompleted = { ...simulationCompleted, [question.id]: true };

    setSimulationScoresState(nextSimulationScores);
    setSimulationCompletedState(nextSimulationCompleted);
    setSimulationFeedback(feedback);
    persistAttempt({
      simulationScores: nextSimulationScores,
      simulationCompleted: nextSimulationCompleted,
    });
  }

  function checkSimulationOrder(question: AssessmentQuestion) {
    const score = calculateStepOrderScore(question, stepOrders[question.id] ?? []);

    if (isSimulationOrderCorrect(question)) {
      completeSimulationTask(
        question,
        question.score,
        `${question.recommendedModule ?? "Workflow"} accepted. Full marks recorded (${question.score}/${question.score}).`,
      );
      return;
    }

    recordSimulationScore(question, score);
    setSimulationFeedback(`Partial score saved (${score}/${question.score}). Reorder the workflow to improve before continuing.`);
  }

  function advanceGuidedSimulation(question: AssessmentQuestion) {
    const actions = question.simulation?.guidedActions ?? [];
    const currentStep = guidedProgress[question.id] ?? 0;
    const currentAction = actions[currentStep];
    const promptValue = simulationPrompts[question.id]?.trim() ?? "";

    if (currentAction?.action.includes("TYPE") && promptValue.length < 4) {
      setSimulationFeedback("Enter a meaningful prompt before continuing.");
      return;
    }

    const nextCompletedActions = Math.min(currentStep + 1, actions.length);
    const score = calculateGuidedScore(question, nextCompletedActions);
    const nextSimulationScores = {
      ...simulationScores,
      [question.id]: Math.max(simulationScores[question.id] ?? 0, Number(score.toFixed(2))),
    };
    setSimulationScoresState(nextSimulationScores);

    if (currentStep >= actions.length - 1) {
      completeSimulationTask(
        question,
        question.score,
        `${question.recommendedModule ?? "Guided task"} completed. Full guided score recorded (${question.score}/${question.score}).`,
      );
      return;
    }

    const nextGuidedProgress = { ...guidedProgress, [question.id]: nextCompletedActions };
    setGuidedProgressState(nextGuidedProgress);
    setSimulationFeedback(actions[currentStep + 1]?.instruction ?? "Continue the guided action.");
    persistAttempt({ guidedProgress: nextGuidedProgress, simulationScores: nextSimulationScores });
  }

  function resetAttempt() {
    clearSavedExamAttempt();
    setPhaseState("briefing");
    setQuestionIndexState(0);
    setMissionIndexState(0);
    setAnswersState({});
    setFlaggedState({});
    setTimerMinutesState(90);
    setActiveSimulationIdState(simulationQuestionBank[0]?.id ?? "");
    setSimulationCompletedState({});
    setSimulationScoresState({});
    setHotspotAttemptsState({});
    setDragPlacementsState({});
    setSimulationAttemptLogState([]);
    setStepOrdersState(defaultStepOrders);
    setGuidedProgressState({});
    setSimulationPromptsState({});
    setAutosaveText("New attempt");
    setRulesAccepted(false);
    setSimulationFeedback("Complete each task. The simulator records partial marks automatically.");
  }

  return (
    <div className={classNames("space-y-5", phase === "knowledge" || phase === "mission" ? "pb-20 sm:pb-0" : null)}>
      <section className={classNames("overflow-hidden rounded-2xl border bg-white shadow-sm", currentVisual.border)}>
        <div className={classNames("h-2 bg-gradient-to-r", currentVisual.band)} />
        <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={classNames("text-sm font-black", currentVisual.text)}>Certification Assessment</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Sabah MAXHUB Educator</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">180 marks</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">50% certificate</span>
              <span className={classNames("rounded-full px-2.5 py-1 text-xs font-black", currentVisual.bg, currentVisual.text)}>{currentVisual.name}</span>
            </div>
          </div>
          <div className={classNames("rounded-2xl px-3 py-2 text-right text-white bg-gradient-to-br", currentVisual.band)}>
            <p className="text-xs font-semibold text-white/80">Timer</p>
            <p className="text-lg font-black">{timerMinutes}:00</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatusPill icon={Timer} label={timerMinutes <= 10 ? "Time warning" : "Timer active"} />
          <StatusPill icon={Layers3} label={`${answeredCount}/${totalDemoItems} items`} />
          <StatusPill icon={ShieldCheck} label={phase === "result" ? "Submitted" : "In progress"} />
        </div>
        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Auto-save / Resume</p>
            <p className="mt-1 text-sm font-bold text-slate-700">
              {autosaveText} · {phase === "briefing" ? "Ready to start" : `Resume at ${phase}`}
            </p>
          </div>
          <button
            onClick={resetAttempt}
            className={classNames("h-9 rounded-lg border bg-white px-3 text-xs font-black", currentVisual.border, currentVisual.text)}
          >
            Start fresh
          </button>
        </div>
        </div>
      </section>

      {phase !== "briefing" && phase !== "result" && (
        <section className={classNames("sticky top-0 z-30 -mx-4 border-y bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden", currentVisual.border)}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Section Progress</p>
              <p className="text-sm font-black text-slate-950">
                {phase === "knowledge"
                  ? `A · ${questionIndex + 1}/${knowledgeQuestions.length}`
                  : phase === "simulation"
                    ? `B · ${completedSimulation}/${simulationQuestionBank.length} tasks`
                    : phase === "mission"
                      ? `C · ${missionIndex + 1}/${missionQuestions.length}`
                      : `Review · ${answeredCount}/${totalDemoItems}`}
              </p>
            </div>
            {(phase === "knowledge" || phase === "mission") && (
              <button
                onClick={() => setNavigatorOpen(true)}
                className={classNames("h-9 rounded-lg px-3 text-xs font-black", currentVisual.active)}
              >
                Questions
              </button>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={classNames("h-full rounded-full", currentVisual.bar)}
              style={{
                width: `${Math.round((answeredCount / Math.max(totalDemoItems, 1)) * 100)}%`,
              }}
            />
          </div>
        </section>
      )}

      {navigatorOpen && (phase === "knowledge" || phase === "mission") && (
        <section className="fixed inset-0 z-50 bg-slate-950/40 md:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[76vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Question Drawer</p>
                <h3 className="text-lg font-black text-slate-950">
                  {phase === "knowledge" ? "Section A Questions" : "Section C Missions"}
                </h3>
              </div>
              <button
                onClick={() => setNavigatorOpen(false)}
                className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700"
                aria-label="Close question drawer"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {(phase === "knowledge" ? knowledgeQuestions : missionQuestions).map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => {
                    if (phase === "knowledge") updateQuestionIndex(index);
                    else updateMissionIndex(index);
                    setNavigatorOpen(false);
                  }}
                  className={classNames(
                    "grid size-11 place-items-center rounded-lg text-sm font-black",
                    (phase === "knowledge" ? questionIndex : missionIndex) === index
                      ? currentVisual.active
                      : flagged[question.id]
                        ? "bg-amber-100 text-amber-700"
                        : answers[question.id]
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-slate-500">
              <span className="rounded-lg bg-emerald-50 p-2 text-center text-emerald-700">Answered</span>
              <span className="rounded-lg bg-amber-50 p-2 text-center text-amber-700">Flagged</span>
              <span className="rounded-lg bg-slate-50 p-2 text-center">Unanswered</span>
            </div>
          </div>
        </section>
      )}

      {phase === "briefing" && (
        <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-4 text-white md:p-5">
          <h3 className="text-xl font-black">Pre-Assessment Briefing</h3>
          <p className="mt-1 text-sm font-semibold text-white/85">Follow the steps. The system saves your progress automatically.</p>
          </div>
          <div className="p-4 md:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "A", title: "Answer MCQ", detail: "Knowledge", score: "80" },
              { id: "B", title: "Do Simulation", detail: "EasiClass tasks", score: "40" },
              { id: "C", title: "Choose Mission", detail: "Teaching cases", score: "60" },
            ].map((item) => {
              const visual = sectionVisuals[item.id as keyof typeof sectionVisuals];

              return (
                <div key={item.id} className={classNames("rounded-xl border p-4", visual.border, visual.bg)}>
                  <span className={classNames("grid size-10 place-items-center rounded-lg text-sm font-black", visual.active)}>{item.id}</span>
                  <h4 className="mt-3 font-black text-slate-950">{item.title}</h4>
                  <p className="mt-1 text-xs font-bold text-slate-500">{item.detail}</p>
                  <p className={classNames("mt-3 text-lg font-black", visual.text)}>{item.score} marks</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <StatusPill icon={FileBadge} label="50%+ certificate" />
            <StatusPill icon={RefreshCcw} label="Retake opens after 7 days" />
            <StatusPill icon={Gauge} label="Competency report generated" />
          </div>
          <button
            onClick={() => setShowBriefingDetails((value) => !value)}
            className="mt-4 flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700"
          >
            {showBriefingDetails ? "Hide full rules" : "View full rules"}
            <ChevronRight className={showBriefingDetails ? "rotate-90 transition" : "transition"} size={18} />
          </button>
          {showBriefingDetails && (
            <div className="mt-3 grid gap-3">
              <BriefingRow icon={BookOpenCheck} title="Section A · Knowledge Assessment" detail="80 MCQ based on classroom situations and EasiClass tools." score="80 marks" />
              <BriefingRow icon={TabletSmartphone} title="Section B · Digital Performance Simulation" detail="20 operation tasks with hotspot, step order, upload and generation actions." score="40 marks" />
              <BriefingRow icon={ClipboardList} title="Section C · Mission-Based Scenarios" detail="20 professional judgement missions for AI, pedagogy, analytics and intervention." score="60 marks" />
            </div>
          )}
          <label className="mt-5 flex items-start gap-3 rounded-lg bg-sky-50 p-3 text-sm font-semibold text-sky-900">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(event) => setRulesAccepted(event.target.checked)}
              className="mt-1"
            />
            <span>I understand the exam rules, retake policy, timer, and simulation scoring.</span>
          </label>
          <button
            onClick={() => {
              setTimerMinutesState(89);
              persistAttempt({ phase: "knowledge", timerMinutes: 89 });
              setPhaseState("knowledge");
            }}
            disabled={!rulesAccepted}
            className={classNames(
              "mt-5 h-12 w-full rounded-lg text-sm font-black",
              rulesAccepted ? "bg-sky-600 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500",
            )}
          >
            Start exam
          </button>
          </div>
        </section>
      )}

      {phase === "knowledge" && (
        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:block">
            <p className="text-sm font-semibold text-slate-500">Section A Navigator</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Question {questionIndex + 1} of {knowledgeQuestions.length}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {knowledgeQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => updateQuestionIndex(index)}
                  className={classNames(
                    "grid size-10 place-items-center rounded-lg text-sm font-black",
                    questionIndex === index
                      ? sectionVisuals.A.active
                      : flagged[question.id]
                        ? "bg-amber-100 text-amber-700"
                      : answers[question.id]
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <QuestionCard
            section={`Question ${questionIndex + 1}`}
            title="Bahagian A · MCQ"
            prompt={currentQuestion.prompt}
            meta={`${currentQuestion.subject ?? "General"} · Domain: ${currentQuestion.domainLabel ?? currentQuestion.competency}`}
            options={currentQuestion.options ?? []}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelect={(answer) => saveAnswer(currentQuestion.id, answer)}
            visual={sectionVisuals.A}
          />
          <div className="hidden grid-cols-2 gap-3 sm:grid xl:col-span-2">
            <button
              onClick={() => updateQuestionIndex(questionIndex - 1)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold"
            >
              <ArrowLeft size={17} />
              Previous
            </button>
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-bold text-amber-800"
            >
              <Flag size={17} />
              {flagged[currentQuestion.id] ? "Remove review flag" : "Flag for review"}
            </button>
            <button
              onClick={() => {
                if (questionIndex === knowledgeQuestions.length - 1) goToPhase("simulation");
                else updateQuestionIndex(questionIndex + 1);
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white"
            >
              Next
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {phase === "knowledge" && (
        <MobileExamControls
          primaryLabel={questionIndex === knowledgeQuestions.length - 1 ? "Section B" : "Next"}
          secondaryLabel="Previous"
          middleLabel={flagged[currentQuestion.id] ? "Unflag" : "Flag"}
          onPrevious={() => updateQuestionIndex(questionIndex - 1)}
          onMiddle={() => toggleFlag(currentQuestion.id)}
          onNext={() => {
            if (questionIndex === knowledgeQuestions.length - 1) goToPhase("simulation");
            else updateQuestionIndex(questionIndex + 1);
          }}
        />
      )}

      {phase === "simulation" && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Section B</p>
                <h3 className="text-xl font-black">Digital Performance Tasks</h3>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-black text-sky-700">{sectionBScore}/40 marks</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-sky-200 bg-sky-50">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#062a6f] via-sky-700 to-cyan-600 px-3 py-2 text-white">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <span className="size-2.5 rounded-full bg-amber-300" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs font-semibold">EasiClass Simulator</p>
              </div>
              <div className="grid min-h-[390px] bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-5">
                  {tools.map((tool) => (
                    <button
                      key={tool.label}
                      onClick={() => setSelectedTool(tool.label)}
                      className={classNames(
                        "min-h-12 rounded-lg border px-2 text-xs font-black transition md:text-sm",
                        selectedTool === tool.label ? "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-200" : tool.tone,
                      )}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
                  <div className="space-y-2">
                    {simulationQuestionBank.map((question, index) => (
                      (() => {
                        const typeVisual = simulationTypeVisuals[question.type] ?? simulationTypeVisuals["tool-selection"];

                        return (
                      <button
                        key={question.id}
                        onClick={() => selectSimulation(question.id)}
                        className={classNames(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                          activeSimulation?.id === question.id
                            ? "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-100"
                            : simulationCompleted[question.id]
                              ? "border-emerald-200 bg-emerald-50 text-slate-950"
                              : typeVisual.panel,
                        )}
                      >
                        <span className={classNames(
                          "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black",
                          activeSimulation?.id === question.id ? "bg-white text-slate-950" : "bg-white text-slate-600",
                        )}>
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black">{question.recommendedModule}</span>
                          <span className={classNames("mt-0.5 block text-xs font-semibold", activeSimulation?.id === question.id ? "text-slate-300" : "text-slate-500")}>
                            {simulationCompleted[question.id]
                              ? `Completed · ${simulationScores[question.id] ?? question.score}/${question.score}`
                              : `${simulationScores[question.id] ?? 0}/${question.score} · ${typeVisual.label}`}
                          </span>
                        </span>
                        {simulationCompleted[question.id] && <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />}
                      </button>
                        );
                      })()
                    ))}
                  </div>

                  {activeSimulation && (
                    <SimulationWorkbench
                      question={activeSimulation}
                      completed={Boolean(simulationCompleted[activeSimulation.id])}
                      score={simulationScores[activeSimulation.id] ?? 0}
                      hotspotAttempt={hotspotAttempts[activeSimulation.id] ?? ""}
                      dragPlacement={dragPlacements[activeSimulation.id] ?? ""}
                      orderIds={stepOrders[activeSimulation.id] ?? []}
                      progress={guidedProgress[activeSimulation.id] ?? 0}
                      promptValue={simulationPrompts[activeSimulation.id] ?? ""}
                      selectedTool={selectedTool}
                      onHotspotClick={(hotspotId) => handleHotspotClick(activeSimulation, hotspotId)}
                      onDragDrop={(zoneId, itemId) => handleDragDrop(activeSimulation, zoneId, itemId)}
                      onPromptChange={(value) => {
                        const nextPrompts = { ...simulationPrompts, [activeSimulation.id]: value };
                        setSimulationPromptsState(nextPrompts);
                        persistAttempt({ simulationPrompts: nextPrompts });
                      }}
                      onMoveStep={(index, direction) => moveSimulationStep(activeSimulation.id, index, direction)}
                      onCheckOrder={() => checkSimulationOrder(activeSimulation)}
                      onGuidedAction={() => advanceGuidedSimulation(activeSimulation)}
                    />
                  )}
                </div>
                <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm font-bold text-sky-800 ring-1 ring-sky-100">{simulationFeedback}</p>
                <div className="mt-3 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Attempt log</p>
                  <div className="mt-2 space-y-1">
                    {(simulationAttemptLog.length > 0 ? simulationAttemptLog : ["No simulation attempts recorded yet."]).map((entry) => (
                      <p key={entry} className="flex gap-2 text-xs font-semibold leading-5 text-slate-600">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-500" />
                        <span>{entry}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ExamCard icon={BookOpenCheck} section="Section A" title="Knowledge Assessment" detail={`${knowledgeAnswered}/${knowledgeQuestions.length} answered`} score={`${sectionAScore}/80`} />
            <ExamCard icon={TabletSmartphone} section="Section B" title="Digital Simulation" detail="step order, hotspot, upload, generation scoring" score={`${sectionBScore}/40`} />
            <ExamCard icon={ClipboardList} section="Section C" title="Mission Assessment" detail={`${missionAnswered}/${missionQuestions.length} mission scenarios`} score={`${sectionCScore}/60`} />
            <button
              onClick={() => goToPhase("mission")}
              disabled={completedSimulation !== simulationQuestionBank.length}
              className={classNames(
                "flex h-12 w-full items-center justify-center rounded-lg text-sm font-black transition",
                completedSimulation === simulationQuestionBank.length ? "bg-sky-600 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500",
              )}
            >
              {completedSimulation === simulationQuestionBank.length ? "Continue to Section C" : "Complete Section B tasks"}
            </button>
          </div>
        </section>
      )}

      {phase === "mission" && (
        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:block">
            <p className="text-sm font-semibold text-slate-500">Section C Navigator</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Mission {missionIndex + 1} of {missionQuestions.length}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {missionQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => updateMissionIndex(index)}
                  className={classNames(
                    "grid size-10 place-items-center rounded-lg text-sm font-black",
                    missionIndex === index
                      ? sectionVisuals.C.active
                      : answers[question.id]
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <QuestionCard
            section={`Mission ${missionIndex + 1}`}
            title={currentMission.domainLabel ?? "Bahagian C · Mission Scenario"}
            prompt={currentMission.prompt}
            meta={`${currentMission.subject ?? "Professional judgement"} · ${currentMission.score} marks`}
            options={currentMission.options ?? []}
            selectedAnswer={answers[currentMission.id] ?? null}
            visual={sectionVisuals.C}
            onSelect={(answer) => saveAnswer(currentMission.id, answer)}
          />
          <div className="hidden grid-cols-2 gap-3 sm:grid xl:col-span-2">
            <button
              onClick={() => updateMissionIndex(missionIndex - 1)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold"
            >
              <ArrowLeft size={17} />
              Previous
            </button>
            <button
              onClick={() => {
                if (missionIndex === missionQuestions.length - 1) goToPhase("review");
                else updateMissionIndex(missionIndex + 1);
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-bold text-slate-950"
            >
              {missionIndex === missionQuestions.length - 1 ? "Review" : "Next"}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {phase === "mission" && (
        <MobileExamControls
          primaryLabel={missionIndex === missionQuestions.length - 1 ? "Review" : "Next"}
          secondaryLabel="Previous"
          middleLabel="Questions"
          onPrevious={() => updateMissionIndex(missionIndex - 1)}
          onMiddle={() => setNavigatorOpen(true)}
          onNext={() => {
            if (missionIndex === missionQuestions.length - 1) goToPhase("review");
            else updateMissionIndex(missionIndex + 1);
          }}
        />
      )}

      {phase === "review" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
            <h3 className="text-xl font-black">Review Before Submission</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <AdminMetric icon={CheckCircle2} label="Answered" value={`${knowledgeAnswered + missionAnswered}/${knowledgeQuestions.length + missionQuestions.length}`} />
              <AdminMetric icon={Flag} label="Flagged" value={String(Object.values(flagged).filter(Boolean).length)} />
              <AdminMetric icon={TabletSmartphone} label="Simulation" value={`${completedSimulation}/${simulationQuestionBank.length}`} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {([
                ["all", "All"],
                ["flagged", "Flagged"],
                ["unanswered", "Unanswered"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setReviewFilter(value)}
                  className={classNames(
                    "h-10 rounded-lg text-xs font-black",
                    reviewFilter === value ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {reviewQuestions.map((question) => {
                const index = question.section === "A"
                  ? knowledgeQuestions.findIndex((item) => item.id === question.id)
                  : knowledgeQuestions.length + missionQuestions.findIndex((item) => item.id === question.id);

                return (
                <button
                  key={question.id}
                  onClick={() => {
                    if (question.section === "A") {
                      updateQuestionIndex(index);
                      goToPhase("knowledge");
                    } else {
                      updateMissionIndex(index - knowledgeQuestions.length);
                      goToPhase("mission");
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-bold"
                >
                  <span>{question.section === "A" ? "Question" : "Mission"} {question.section === "A" ? index + 1 : index - knowledgeQuestions.length + 1}</span>
                  <span className={answers[question.id] ? "text-emerald-700" : "text-rose-700"}>
                    {flagged[question.id] ? "Flagged" : answers[question.id] ? "Answered" : "Unanswered"}
                  </span>
                </button>
                );
              })}
              {reviewQuestions.length === 0 && (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                  No items in this filter.
                </p>
              )}
              {simulationQuestionBank.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => {
                    selectSimulation(question.id);
                    goToPhase("simulation");
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-bold"
                >
                  <span>Simulation Task {index + 1}</span>
                  <span className={simulationCompleted[question.id] ? "text-emerald-700" : "text-amber-700"}>
                    {simulationScores[question.id] ?? 0}/{question.score} marks
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => goToPhase("result")}
            disabled={!canSubmit}
            className={classNames(
              "h-12 w-full rounded-lg text-sm font-black",
              canSubmit ? "bg-emerald-600 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500",
            )}
          >
            {canSubmit ? "Submit final exam" : "Complete all sections before submit"}
          </button>
        </section>
      )}

      {phase === "result" && (
        <ResultView
          score={previewScore}
          percentage={previewPercentage}
          achievement={achievement.achievementLabel}
          sectionAScore={sectionAScore}
          sectionBScore={sectionBScore}
          sectionCScore={sectionCScore}
          competencyReport={competencyReport}
          onRetake={resetAttempt}
        />
      )}
    </div>
  );
}

function BriefingRow({
  icon: Icon,
  title,
  detail,
  score,
}: {
  icon: typeof BookOpenCheck;
  title: string;
  detail: string;
  score: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#062a6f] shadow-sm">
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-black text-slate-950">{title}</h4>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600">
            {score}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
    </div>
  );
}

function MobileExamControls({
  primaryLabel,
  secondaryLabel,
  middleLabel,
  onPrevious,
  onMiddle,
  onNext,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  middleLabel: string;
  onPrevious: () => void;
  onMiddle: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto_1fr] gap-2">
        <button onClick={onPrevious} className="h-12 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700">
          {secondaryLabel}
        </button>
        <button onClick={onMiddle} className="h-12 rounded-lg bg-slate-100 px-4 text-sm font-black text-slate-700">
          {middleLabel}
        </button>
        <button onClick={onNext} className="h-12 rounded-lg bg-slate-950 text-sm font-black text-white">
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

function SimulationWorkbench({
  question,
  completed,
  score,
  hotspotAttempt,
  dragPlacement,
  orderIds,
  progress,
  promptValue,
  selectedTool,
  onHotspotClick,
  onDragDrop,
  onPromptChange,
  onMoveStep,
  onCheckOrder,
  onGuidedAction,
}: {
  question: AssessmentQuestion;
  completed: boolean;
  score: number;
  hotspotAttempt: string;
  dragPlacement: string;
  orderIds: string[];
  progress: number;
  promptValue: string;
  selectedTool: string;
  onHotspotClick: (hotspotId: string) => void;
  onDragDrop: (zoneId: string, itemId: string) => void;
  onPromptChange: (value: string) => void;
  onMoveStep: (index: number, direction: "up" | "down") => void;
  onCheckOrder: () => void;
  onGuidedAction: () => void;
}) {
  const stepOptions = question.simulation?.stepOptions ?? [];
  const orderedSteps = orderIds
    .map((stepId) => stepOptions.find((step) => step.id === stepId))
    .filter((step): step is { id: string; label: string } => Boolean(step));
  const guidedActions = question.simulation?.guidedActions ?? [];
  const currentAction = guidedActions[Math.min(progress, Math.max(guidedActions.length - 1, 0))];
  const needsPrompt = currentAction?.action.includes("TYPE");
  const typeVisual = simulationTypeVisuals[question.type] ?? simulationTypeVisuals["tool-selection"];

  return (
    <div className={classNames("rounded-2xl border bg-white p-4 shadow-sm", typeVisual.panel)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={classNames("inline-flex rounded-full px-2.5 py-1 text-xs font-black", typeVisual.chip)}>{typeVisual.label}</p>
          <h4 className="mt-1 text-base font-black text-slate-950">{question.recommendedModule}</h4>
        </div>
        <span className={classNames(
          "rounded-full px-2.5 py-1 text-xs font-black",
          completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
        )}>
          {completed ? "Completed" : `${score}/${question.score} marks`}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{question.prompt}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={classNames("h-full rounded-full", typeVisual.bar)}
          style={{ width: `${Math.min(100, Math.round((score / Math.max(question.score, 1)) * 100))}%` }}
        />
      </div>

      {question.type === "step-order" ? (
        <div className="mt-4 space-y-2">
          {orderedSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-700">{step.label}</p>
              <button
                onClick={() => onMoveStep(index, "up")}
                disabled={index === 0 || completed}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-black disabled:opacity-40"
              >
                Up
              </button>
              <button
                onClick={() => onMoveStep(index, "down")}
                disabled={index === orderedSteps.length - 1 || completed}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-black disabled:opacity-40"
              >
                Down
              </button>
            </div>
          ))}
          <button
            onClick={onCheckOrder}
            disabled={completed}
            className={classNames(
              "mt-2 h-11 w-full rounded-lg text-sm font-black",
              completed ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white",
            )}
          >
            {completed ? "Sequence accepted" : "Check sequence"}
          </button>
        </div>
      ) : question.type === "hotspot" ? (
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-xl border border-sky-200 bg-slate-950 text-white">
            <div className="flex items-center justify-between bg-gradient-to-r from-sky-700 to-cyan-600 px-3 py-2">
              <p className="text-xs font-black">EasiClass Media Panel</p>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold">Click the correct hotspot</span>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
              {[
                { id: "whiteboard", label: "Whiteboard Tools", hint: "Marker, Eraser, Shape" },
                { id: "ai-image-generator", label: "AI Image Generator", hint: "Generate image from prompt" },
                { id: "smart-quiz", label: "Smart Quiz", hint: "Generate assessment items" },
                { id: "qr-share", label: "QR Share", hint: "Share notes to students" },
              ].map((hotspot) => (
                <button
                  key={hotspot.id}
                  onClick={() => onHotspotClick(hotspot.id)}
                  disabled={completed}
                  className={classNames(
                    "rounded-lg border p-3 text-left transition",
                    hotspotAttempt === hotspot.id
                      ? hotspot.id === "ai-image-generator"
                        ? "border-emerald-300 bg-emerald-500/20"
                        : "border-amber-300 bg-amber-500/20"
                      : "border-white/10 bg-white/10 hover:bg-white/15",
                  )}
                >
                  <span className="block text-sm font-black">{hotspot.label}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate-300">{hotspot.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="rounded-lg bg-cyan-50 p-3 text-xs font-bold leading-5 text-cyan-800">
            Task: open Media and select AI Image Generator for Gunung Kinabalu visual generation.
          </p>
        </div>
      ) : question.type === "drag-drop" ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-amber-800">Drag resources</p>
              <div className="mt-3 space-y-2">
                {(question.simulation?.dragItems ?? []).map((item) => (
                  <div
                    key={item.id}
                    draggable={!completed}
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
                    className={classNames(
                      "cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm font-black text-slate-700 active:cursor-grabbing",
                      dragPlacement.startsWith(item.id) ? "ring-2 ring-cyan-300" : null,
                    )}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-slate-950 to-sky-950 p-3 text-white">
              <p className="text-xs font-black uppercase tracking-wide text-amber-200">Lesson flow drop zones</p>
              <div className="mt-3 grid gap-2">
                {(question.simulation?.dropZones ?? []).map((zone) => (
                  <div
                    key={zone.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      onDragDrop(zone.id, event.dataTransfer.getData("text/plain"));
                    }}
                    className={classNames(
                      "min-h-20 rounded-lg border border-dashed p-3",
                      dragPlacement.endsWith(zone.id)
                        ? zone.accepts === dragPlacement.split(":")[0]
                          ? "border-emerald-300 bg-emerald-500/20"
                          : "border-amber-300 bg-amber-500/20"
                        : "border-white/20 bg-white/10",
                    )}
                  >
                    <p className="text-sm font-black">{zone.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {dragPlacement.endsWith(zone.id) ? `Dropped: ${dragPlacement.split(":")[0]}` : "Drop item here"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="rounded-lg bg-cyan-50 p-3 text-xs font-bold leading-5 text-cyan-800">
            Task: drag the textbook snapshot into AI Activity / OCR Converter to convert a physical question into an interactive activity.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-slate-950 to-rose-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-200">Current tool</p>
            <p className="mt-1 text-lg font-black">{selectedTool}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {currentAction?.instruction ?? "All guided actions completed."}
            </p>
          </div>
          {needsPrompt && (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Prompt input</span>
              <input
                value={promptValue}
                onChange={(event) => onPromptChange(event.target.value)}
                placeholder="Gunung Kinabalu"
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-950"
              />
            </label>
          )}
          <div className="grid gap-2">
            {guidedActions.map((action, index) => (
              <div
                key={action.action}
                className={classNames(
                  "flex items-start gap-2 rounded-lg p-2 text-sm",
                  index < progress || completed
                    ? "bg-emerald-50 text-emerald-800"
                    : index === progress
                      ? "bg-cyan-50 text-cyan-800"
                      : "bg-slate-50 text-slate-500",
                )}
              >
                <CheckCircle2 size={17} className={classNames("mt-0.5 shrink-0", index < progress || completed ? "text-emerald-600" : "text-slate-300")} />
                <span className="font-semibold leading-5">{action.instruction}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onGuidedAction}
            disabled={completed}
            className={classNames(
              "h-11 w-full rounded-lg text-sm font-black",
              completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-950 text-white",
            )}
          >
            {completed ? "Task completed" : progress >= guidedActions.length - 1 ? "Complete task" : "Perform next action"}
          </button>
        </div>
      )}

      {question.rubric && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Rubric</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-amber-800">{question.rubric.join(" ")}</p>
        </div>
      )}
    </div>
  );
}

function ResultView({
  score,
  percentage,
  achievement,
  sectionAScore,
  sectionBScore,
  sectionCScore,
  competencyReport,
  onRetake,
}: {
  score: number;
  percentage: number;
  achievement: string;
  sectionAScore: number;
  sectionBScore: number;
  sectionCScore: number;
  competencyReport: CompetencyResult[];
  onRetake: () => void;
}) {
  const passed = percentage >= 50;
  const weakestCompetency = competencyReport[0];

  return (
    <section className="space-y-5">
      <div className={classNames("rounded-lg p-5 text-white", passed ? "bg-emerald-700" : "bg-rose-700")}>
        <p className="text-sm font-semibold text-white/80">Final Result</p>
        <h3 className="mt-2 text-3xl font-black">{score}/180 · {percentage}%</h3>
        <p className="mt-2 text-sm leading-6 text-white/90">{achievement}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <AdminMetric icon={BookOpenCheck} label="Section A" value={`${sectionAScore}/80`} />
        <AdminMetric icon={TabletSmartphone} label="Section B" value={`${sectionBScore}/40`} />
        <AdminMetric icon={ClipboardList} label="Section C" value={`${sectionCScore}/60`} />
      </div>
      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-amber-400" />
        <div className="p-4 md:p-5">
        <h3 className="text-xl font-black">Next Action</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {passed
            ? weakestCompetency
              ? `Certificate is ready. Strongest next step: improve ${weakestCompetency.label} with the recommended module below.`
              : "Certificate is ready. Download the PDF or copy the public verification link for school submission."
            : `Retake opens on ${candidate.nextRetake}. Complete the recommended learning modules first.`}
        </p>
        </div>
      </section>
      <CompetencyPanel title="Question-level Competency Report" results={competencyReport} />
      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/verify/SME-2026-000142" className="text-left">
          <ActionTile icon={QrCode} title="Verify Certificate" label="public QR verification" />
        </Link>
        <button onClick={onRetake} className="text-left">
          <ActionTile icon={RefreshCcw} title="Retake Rules" label="7 days cooldown, 3 attempts" />
        </button>
        <Link href="/certificate/SME-2026-000142" className="text-left">
          <ActionTile icon={Download} title="Printable PDF" label="open certificate print view" />
        </Link>
      </div>
    </section>
  );
}

function QuestionCard({
  section,
  title,
  prompt,
  meta,
  options,
  selectedAnswer,
  onSelect,
  visual = sectionVisuals.B,
}: {
  section: string;
  title: string;
  prompt: string;
  meta?: string;
  options: Array<{ id: string; label: string; isCorrect?: boolean }>;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  visual?: (typeof sectionVisuals)[keyof typeof sectionVisuals];
}) {
  return (
    <div className={classNames("overflow-hidden rounded-2xl border bg-white shadow-sm", visual.border)}>
      <div className={classNames("h-2 bg-gradient-to-r", visual.band)} />
      <div className="p-4">
      <p className={classNames("text-sm font-black", visual.text)}>{section}</p>
      <h3 className="mt-1 text-lg font-bold">{title}</h3>
      {meta && <p className={classNames("mt-2 rounded-lg p-2 text-xs font-bold", visual.bg, visual.text)}>{meta}</p>}
      <p className="mt-3 text-sm leading-6 text-slate-700">{prompt}</p>
      <div className="mt-4 space-y-2">
        {options.map((option) => {
          const selected = selectedAnswer === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={classNames(
                "flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                selected
                  ? classNames("border-transparent shadow-md", visual.active)
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <span
                className={classNames(
                  "grid size-7 shrink-0 place-items-center rounded-md text-xs font-black",
                  selected ? "bg-white text-slate-950" : classNames(visual.bg, visual.text),
                )}
              >
                {option.id}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function CertificateView({ percentage, totalScore }: { percentage: number; totalScore: number }) {
  const [certificateNotice, setCertificateNotice] = useState("Certificate is ready for secure download.");
  const verificationLink = "/verify/SME-2026-000142";
  const isPassedTemplate = percentage >= 70;
  const certificateSubtitle = isPassedTemplate
    ? "MAXHUB Certified Educator (Passed)"
    : "Digital Classroom Practitioner (Participant)";

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400" />
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:p-5 md:items-center">
          <div>
            <p className="text-sm font-black text-emerald-800">Certificate status</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Ready for official verification</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{certificateNotice}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:min-w-72">
            <CertificateMeta label="Score" value={`${totalScore}/180`} />
            <CertificateMeta label="Result" value={`${percentage}%`} />
            <CertificateMeta label="Template" value={isPassedTemplate ? "Passed" : "Participant"} />
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-7">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="h-2 bg-gradient-to-r from-blue-700 via-sky-500 to-red-500" />
          <div className="p-5 md:p-8">
          <div className="flex items-start justify-between gap-4 text-xs font-semibold text-slate-400">
            <span>Issued: 2026-06-18</span>
            <span>Certificate ID: JPNS26-0001</span>
          </div>
          <div className="mt-5 flex flex-col items-center text-center">
            <div className="h-16 w-44 overflow-hidden rounded bg-white">
              <Image src="/brand/maxhub-logo.jpg" alt="MAXHUB" width={1280} height={720} className="h-full w-full object-contain" />
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-700">
              Ministry of Education<br />Sabah State Education Department
            </p>
          </div>
          <div className="mt-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">This certificate is proudly presented to</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">{candidate.name}</h2>
              <p className="mt-2 text-sm text-slate-500">for successfully completing the</p>
              <p className="mt-4 text-2xl font-black uppercase tracking-[0.16em] text-slate-950">Sabah MAXHUB Educator</p>
              <p className="mt-1 text-xl font-semibold text-slate-500">{certificateSubtitle}</p>
            </div>
            <Award className="shrink-0 text-amber-500" size={42} />
          </div>
          <div className="mt-8 border-y border-slate-300 py-6">
            <p className="text-sm font-semibold text-slate-500">Presented to</p>
            <h3 className="mt-2 text-2xl font-bold">{candidate.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {candidate.school}, {candidate.ppd}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <CertificateMeta label="Certificate ID" value="SME-2026-000142" />
            <CertificateMeta label="Score" value={`${totalScore}/180`} />
            <CertificateMeta label="Percentage" value={`${percentage}%`} />
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-serif text-2xl italic text-slate-900">Director Signature</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Issued 12 Jun 2026</p>
            </div>
            <Image src="/brand/samasama-works-logo.jpg" alt="Samasama Works" width={1280} height={720} className="hidden h-12 w-36 object-contain sm:block" />
            <Link
              href="/verify/SME-2026-000142"
              className="grid size-20 place-items-center rounded-lg border border-slate-300 bg-white text-center transition hover:bg-slate-50"
              aria-label="Verify certificate SME-2026-000142"
            >
              <QrCode size={48} />
            </Link>
          </div>
          <p className="mt-3 text-right text-xs font-bold text-slate-500">QR verifies /verify/SME-2026-000142</p>
          <div className="mt-7 h-2 rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-red-500" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <div className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Certificate templates</p>
            <h3 className="text-xl font-black">Official layouts</h3>
          </div>
          <FileBadge className="text-slate-500" size={24} />
        </div>
        <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
          <CertificateTemplatePreview
            title="Practitioner Participant"
            src="/brand/certificate-practitioner-template.jpg"
            active={!isPassedTemplate}
          />
          <CertificateTemplatePreview
            title="Certified Educator Passed"
            src="/brand/certificate-certified-template.jpg"
            active={isPassedTemplate}
          />
        </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/verify/SME-2026-000142">
          <ActionTile icon={QrCode} title="QR Verification" label="verify/sme-2026-000142" />
        </Link>
        <button
          onClick={() => setCertificateNotice(`Verification link copied: ${verificationLink}`)}
          className="text-left"
        >
          <ActionTile icon={Copy} title="Copy Verification Link" label="share with school / PPD" />
        </button>
        <button
          onClick={() => setCertificateNotice("Retake is not required because this candidate passed the certification.")}
          className="text-left"
        >
          <ActionTile icon={RefreshCcw} title="Retake Rule" label="7-day cooldown · 3 attempts/year" />
        </button>
      </section>
      <section className="grid gap-3 md:grid-cols-1">
        <Link
          href="/certificate/SME-2026-000142"
          onClick={() => setCertificateNotice("PDF certificate prepared: SME-2026-000142.pdf.")}
          className="text-left"
        >
          <ActionTile icon={FileBadge} title="PDF Certificate" label="open printable certificate" />
        </Link>
      </section>
    </div>
  );
}

function CertificateTemplatePreview({ title, src, active }: { title: string; src: string; active: boolean }) {
  return (
    <div className={classNames(
      "min-w-[82%] snap-start overflow-hidden rounded-lg border bg-slate-50 sm:min-w-[420px] md:min-w-0",
      active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200",
    )}>
      <Image src={src} alt={title} width={1280} height={905} className="aspect-[1280/905] w-full object-cover" />
      <div className="p-3">
        <p className="text-sm font-black text-slate-950">{active ? "Active · " : ""}{title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">Reference layout for generated certificate PDF.</p>
      </div>
    </div>
  );
}

function RetakeView() {
  return (
    <div className="space-y-5">
      <RoleHero
        icon={RefreshCcw}
        eyebrow="Retake System"
        title="Retake Eligibility"
        description="Teachers below 50% are locked for 7 days and receive recommended modules before the next attempt."
      />
      <section className="grid gap-3 md:grid-cols-3">
        <AdminMetric icon={CalendarClock} label="Next Available" value={candidate.nextRetake} />
        <AdminMetric icon={RefreshCcw} label="Attempts Left" value={String(candidate.retakesLeft)} />
        <AdminMetric icon={ShieldCheck} label="Current Status" value="Passed" />
      </section>
      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-amber-400 to-rose-500" />
        <div className="p-4 md:p-5">
        <h2 className="text-xl font-black">Recommended Learning Modules</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ActionTile icon={BookOpenCheck} title="Smart Quiz Review" label="20 minutes" />
          <ActionTile icon={TabletSmartphone} title="Hybrid Learning Lab" label="35 minutes" />
          <ActionTile icon={Gauge} title="Lesson Analytics" label="25 minutes" />
        </div>
        </div>
      </section>
    </div>
  );
}

function AdminView({
  publishedPack,
  setPublishedPack,
}: {
  publishedPack: string;
  setPublishedPack: (value: string) => void;
}) {
  const [questionCount, setQuestionCount] = useState(428);
  const [packLog, setPackLog] = useState("Sabah Pilot Certification is currently active.");
  const [packStatuses, setPackStatuses] = useState<Record<string, string>>({
    "Sabah Pilot Certification": "Published",
    "Retake Pack": "Draft",
    "PPD Training Diagnostic": "Review",
  });
  const [bankQuestions, setBankQuestions] = useState<EditableQuestion[]>(initialEditableQuestions);
  const [auditEntries, setAuditEntries] = useState<AdminAuditEntry[]>(initialAuditEntries);
  const [selectedQuestionId, setSelectedQuestionId] = useState(initialEditableQuestions[0]?.id ?? "");
  const [draftVersion, setDraftVersion] = useState("v1.1 Draft");
  const draftItems = bankQuestions.filter((question) => question.status === "draft").length;
  const reviewItems = bankQuestions.filter((question) => question.status === "review").length;
  const publishedItems = bankQuestions.filter((question) => question.status === "published").length;
  const publishChecklist = buildPublishChecklist(bankQuestions, draftItems, reviewItems);

  function addAuditEntry(action: string, detail: string, actor = "Super Admin") {
    setAuditEntries((current) => {
      const latestNumber = Number(current[0]?.id.replace("AUD-", "")) || current.length;

      return [
        {
          id: `AUD-${String(latestNumber + 1).padStart(3, "0")}`,
          action,
          actor,
          time: "Now",
          detail,
        },
        ...current,
      ].slice(0, 10);
    });
  }

  function saveQuestion(question: EditableQuestion) {
    setBankQuestions((current) => {
      const exists = current.some((item) => item.id === question.id);
      const nextQuestion = {
        ...question,
        status: "draft" as const,
        version: "v1.1",
        lastEdited: "Just now",
      };

      return exists ? current.map((item) => (item.id === question.id ? nextQuestion : item)) : [nextQuestion, ...current];
    });
    setSelectedQuestionId(question.id);
    setQuestionCount((count) => (bankQuestions.some((item) => item.id === question.id) ? count : count + 1));
    setPackLog(`${question.id} saved to ${draftVersion}. Publish review is now required.`);
    addAuditEntry("Draft Saved", `${question.id} saved to ${draftVersion}`);
  }

  function createQuestionDraft() {
    const nextId = `DRAFT-${String(bankQuestions.length + 1).padStart(3, "0")}`;
    const newQuestion: EditableQuestion = {
      id: nextId,
      section: "A",
      type: "single-choice",
      prompt: "New assessment item draft. Replace this prompt with the teacher-facing question.",
      score: 1,
      competency: "ai-courseware",
      difficulty: "foundation",
      subject: "General",
      domainLabel: "Draft Question",
      options: [
        { id: "A", label: "Option A" },
        { id: "B", label: "Option B", isCorrect: true },
        { id: "C", label: "Option C" },
        { id: "D", label: "Option D" },
      ],
      explanation: "Add answer rationale before publishing.",
      recommendedModule: "Admin Draft",
      status: "draft",
      version: "v1.1",
      lastEdited: "Just now",
    };

    setBankQuestions((current) => [newQuestion, ...current]);
    setSelectedQuestionId(nextId);
    setQuestionCount((count) => count + 1);
    setPackLog(`${nextId} created in ${draftVersion}.`);
    addAuditEntry("Draft Created", `${nextId} created in ${draftVersion}`);
  }

  function stageImportedPack() {
    const staged: EditableQuestion[] = sampleAssessmentPack.questions.slice(12, 18).map((question) => ({
      ...question,
      id: `${question.id}-IMP`,
      status: "review",
      version: "v1.1",
      lastEdited: "Import preview",
    }));

    setBankQuestions((current) => [...staged, ...current]);
    setSelectedQuestionId(staged[0]?.id ?? selectedQuestionId);
    setQuestionCount((count) => count + staged.length);
    setPackLog(`${staged.length} imported questions staged for admin review.`);
    addAuditEntry("Import Staged", `${staged.length} questions staged for review`);
  }

  function publishDraftVersion() {
    if (!publishChecklist.every((item) => item.passed)) {
      setPackLog("Publish blocked: complete the review checklist before activating this version.");
      addAuditEntry("Publish Blocked", "Review checklist failed; version was not activated");
      return;
    }

    setBankQuestions((current) =>
      current.map((question) =>
        question.status === "draft" || question.status === "review"
          ? { ...question, status: "published", version: "v1.1", lastEdited: "Published now" }
          : question,
      ),
    );
    setDraftVersion("v1.2 Draft");
    publishPack("Sabah Pilot Certification");
    setPackLog("Sabah Pilot Certification v1.1 published. A new v1.2 draft workspace is ready.");
    addAuditEntry("Published", "Sabah Pilot Certification v1.1 activated");
  }

  function approveReviewItems() {
    setBankQuestions((current) =>
      current.map((question) =>
        question.status === "review"
          ? { ...question, status: "draft", lastEdited: "Review approved" }
          : question,
      ),
    );
    setPackLog("Review items approved and moved into the draft publish queue.");
    addAuditEntry("Review Approved", `${reviewItems} review items moved into draft queue`);
  }

  function publishPack(packName: string) {
    setPublishedPack(packName);
    setPackStatuses((current) =>
      Object.fromEntries(
        Object.keys(current).map((name) => [name, name === packName ? "Published" : current[name] === "Published" ? "Archived" : current[name]]),
      ),
    );
    setPackLog(`${packName} has been published as the active assessment pack.`);
    addAuditEntry("Pack Published", `${packName} set as active assessment pack`);
  }

  function addQuestion() {
    createQuestionDraft();
  }

  function importPack() {
    stageImportedPack();
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric icon={Users} label="Candidates" value="1,235" />
        <AdminMetric icon={ShieldCheck} label="Pass Rate" value="76%" />
        <AdminMetric icon={FileBadge} label="Issued" value="938" />
        <AdminMetric icon={Layers3} label="Question Bank" value={String(questionCount)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
          <div className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Question Bank</p>
              <h2 className="text-xl font-bold">Assessment Packs</h2>
            </div>
            <button className="grid size-10 place-items-center rounded-lg bg-sky-600 text-white" aria-label="Upload pack">
              <Upload size={20} />
            </button>
          </div>
          <div className="mt-4 rounded-lg bg-cyan-50 p-3">
            <p className="text-sm font-bold text-cyan-900">Admin action log</p>
            <p className="mt-1 text-sm leading-6 text-cyan-800">{packLog}</p>
          </div>
          <div className="mt-4 space-y-3">
            {assessmentPacks.map((pack) => (
              <div
                key={pack.name}
                className={classNames(
                  "w-full rounded-lg border p-4 text-left transition",
                  publishedPack === pack.name
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{pack.name}</h3>
                    <p className={classNames("mt-1 text-sm", publishedPack === pack.name ? "text-slate-300" : "text-slate-500")}>
                      {pack.items}
                    </p>
                  </div>
                  <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-bold">{pack.version}</span>
                </div>
                <p className={classNames("mt-3 text-xs font-bold uppercase tracking-wide", publishedPack === pack.name ? "text-cyan-200" : "text-cyan-700")}>
                  {packStatuses[pack.name]}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => publishPack(pack.name)}
                    className={classNames(
                      "h-9 rounded-md text-xs font-bold",
                      publishedPack === pack.name ? "bg-white text-slate-950" : "bg-slate-950 text-white",
                    )}
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => {
                      setPackStatuses((current) => ({ ...current, [pack.name]: "Archived" }));
                      setPackLog(`${pack.name} archived for audit history.`);
                      addAuditEntry("Archived", `${pack.name} archived for audit history`);
                    }}
                    className={classNames(
                      "h-9 rounded-md border text-xs font-bold",
                      publishedPack === pack.name ? "border-white/30 text-white" : "border-slate-200 text-slate-700",
                    )}
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">JPNS Dashboard</p>
              <h2 className="text-xl font-bold">District Performance</h2>
            </div>
            <LineChart className="text-slate-500" size={24} />
          </div>
          <div className="mt-5 space-y-4">
            {districtStats.map((district) => (
              <div key={district.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{district.label}</span>
                  <span className="text-slate-500">{district.teachers} teachers · {district.pass}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-cyan-600" style={{ width: `${district.pass}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">PLC Recommendation</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Prioritize Lesson Analytics and Hybrid Learning clinics for schools below 70% pass rate.
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <button onClick={addQuestion} className="text-left">
          <ActionTile icon={Plus} title="Add Questions" label="MCQ, simulation, mission scenario" />
        </button>
        <button onClick={() => setPackLog("Scoring rubric opened: Section B partial marks adjusted.")} className="text-left">
          <ActionTile icon={Pencil} title="Edit Pack" label="scores, answers, competencies" />
        </button>
        <button onClick={importPack} className="text-left">
          <ActionTile icon={Upload} title="Replace Pack" label="Excel, CSV, JSON import" />
        </button>
        <button onClick={() => setPackLog("Version history opened: v1.0, v1.1 draft, retake pack.")} className="text-left">
          <ActionTile icon={Archive} title="Archive Version" label="draft, published, archived" />
        </button>
      </section>

      <AdminQuestionBankWorkspace
        questions={bankQuestions}
        selectedQuestionId={selectedQuestionId}
        draftVersion={draftVersion}
        draftItems={draftItems}
        reviewItems={reviewItems}
        publishedItems={publishedItems}
        publishChecklist={publishChecklist}
        onSelectQuestion={setSelectedQuestionId}
        onCreateQuestion={createQuestionDraft}
        onSaveQuestion={saveQuestion}
        onStageImport={stageImportedPack}
        onApproveReview={approveReviewItems}
        onPublishDraft={publishDraftVersion}
      />

      <AssessmentBlueprint />

      <section className="grid gap-5 xl:grid-cols-[1fr]">
        <ImportPreview onConfirm={importPack} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <AuditLog logs={auditEntries} />
        <NotificationsPanel />
      </section>
    </div>
  );
}

function AssessmentBlueprint() {
  const blueprint = [
    {
      section: "A",
      title: "Knowledge Assessment",
      format: "80 MCQ",
      marks: "80 marks",
      coverage: "Whiteboard, Smart Ink, Subject Tools, AI Preparation, Smart Quiz, Hybrid Learning",
    },
    {
      section: "B",
      title: "Digital Performance Simulation",
      format: "20 tasks x 2 marks",
      marks: "40 marks",
      coverage: "Click hotspot, step order, upload action, generation task, partial marks",
    },
    {
      section: "C",
      title: "Mission-Based Scenarios",
      format: "20 scenarios x 3 marks",
      marks: "60 marks",
      coverage: "Teacher missions, AI validation, analytics, intervention, leadership judgement",
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400" />
      <div className="p-4 md:p-5">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-slate-500" size={24} />
        <div>
          <p className="text-sm font-semibold text-slate-500">Certification Blueprint</p>
          <h2 className="text-xl font-black">Instrument Structure</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {blueprint.map((item) => {
          const visual = sectionVisuals[item.section as keyof typeof sectionVisuals];

          return (
          <div key={item.section} className={classNames("rounded-xl border p-4", visual.border, visual.bg)}>
            <div className="flex items-center justify-between gap-3">
              <span className={classNames("grid size-9 place-items-center rounded-lg text-sm font-black", visual.active)}>
                {item.section}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600">{item.marks}</span>
            </div>
            <h3 className="mt-4 font-black">{item.title}</h3>
            <p className={classNames("mt-1 text-sm font-bold", visual.text)}>{item.format}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.coverage}</p>
          </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function AdminQuestionBankWorkspace({
  questions,
  selectedQuestionId,
  draftVersion,
  draftItems,
  reviewItems,
  publishedItems,
  publishChecklist,
  onSelectQuestion,
  onCreateQuestion,
  onSaveQuestion,
  onStageImport,
  onApproveReview,
  onPublishDraft,
}: {
  questions: EditableQuestion[];
  selectedQuestionId: string;
  draftVersion: string;
  draftItems: number;
  reviewItems: number;
  publishedItems: number;
  publishChecklist: Array<{ label: string; detail: string; passed: boolean }>;
  onSelectQuestion: (id: string) => void;
  onCreateQuestion: () => void;
  onSaveQuestion: (question: EditableQuestion) => void;
  onStageImport: () => void;
  onApproveReview: () => void;
  onPublishDraft: () => void;
}) {
  const [filter, setFilter] = useState<"All" | "A" | "B" | "C">("All");
  const [savedNotice, setSavedNotice] = useState("");
  const selectedQuestion = questions.find((question) => question.id === selectedQuestionId) ?? questions[0];
  const filteredQuestions = filter === "All" ? questions : questions.filter((question) => question.section === filter);
  const publishBlocked = !publishChecklist.every((item) => item.passed);

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-sky-500 to-emerald-400" />
      <div className="p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-slate-500" size={24} />
          <div>
            <p className="text-sm font-semibold text-slate-500">Admin Question Bank</p>
            <h2 className="text-xl font-black">Editor & Publish Flow</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button onClick={onCreateQuestion} className="h-10 rounded-lg bg-sky-600 px-3 text-xs font-black text-white">
            New Draft
          </button>
          <button onClick={onStageImport} className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700">
            Stage Import
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric icon={FileText} label="Draft Version" value={draftVersion} />
        <AdminMetric icon={Pencil} label="Draft Items" value={String(draftItems)} />
        <AdminMetric icon={ClipboardCheck} label="Needs Review" value={String(reviewItems)} />
        <AdminMetric icon={ShieldCheck} label="Published Items" value={String(publishedItems)} />
      </div>

      <PublishReviewChecklist
        items={publishChecklist}
        reviewItems={reviewItems}
        onApproveReview={onApproveReview}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {(["All", "A", "B", "C"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={classNames(
                  "h-9 rounded-lg text-xs font-black",
                  filter === item ? "bg-sky-600 text-white" : "bg-white text-slate-600",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {filteredQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => onSelectQuestion(question.id)}
                className={classNames(
                  "w-full rounded-xl border p-3 text-left",
                  selectedQuestion?.id === question.id ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 bg-white text-slate-950",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide opacity-70">
                      {question.id} · Section {question.section}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-black">{question.prompt}</p>
                  </div>
                  <span
                    className={classNames(
                      "shrink-0 rounded-full px-2 py-1 text-[11px] font-black",
                      question.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : question.status === "review"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-cyan-100 text-cyan-700",
                    )}
                  >
                    {question.status}
                  </span>
                </div>
                <p className={classNames("mt-2 text-xs font-semibold", selectedQuestion?.id === question.id ? "text-slate-300" : "text-slate-500")}>
                  {competencyLabels[question.competency]} · {question.score} marks · {question.lastEdited}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedQuestion && (
          <QuestionBankEditor
            key={selectedQuestion.id}
            selectedQuestion={selectedQuestion}
            savedNotice={savedNotice}
            publishBlocked={publishBlocked}
            onSaveQuestion={(question) => {
              onSaveQuestion(question);
              setSavedNotice(`${question.id} saved to draft. It will not affect candidates until published.`);
            }}
            onPublishDraft={() => {
              onPublishDraft();
              setSavedNotice("Draft/review items published. Candidates will receive the active published version.");
            }}
          />
        )}
      </div>
      </div>
    </section>
  );
}

function PublishReviewChecklist({
  items,
  reviewItems,
  onApproveReview,
}: {
  items: Array<{ label: string; detail: string; passed: boolean }>;
  reviewItems: number;
  onApproveReview: () => void;
}) {
  const passedCount = items.filter((item) => item.passed).length;
  const ready = passedCount === items.length;

  return (
    <section className={classNames("mt-5 rounded-xl border p-4", ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">Pre-Publish Review Checklist</p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {passedCount}/{items.length} checks passed · {ready ? "ready to publish" : "review required"}
          </p>
        </div>
        <button
          onClick={onApproveReview}
          disabled={reviewItems === 0}
          className={classNames(
            "h-10 rounded-lg px-3 text-xs font-black",
            reviewItems === 0 ? "cursor-not-allowed bg-white/70 text-slate-400" : "bg-slate-950 text-white",
          )}
        >
          Approve Review Items
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2 rounded-lg bg-white p-3">
            {item.passed ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <XCircle className="mt-0.5 shrink-0 text-amber-600" size={18} />}
            <div>
              <p className="text-sm font-black text-slate-950">{item.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestionBankEditor({
  selectedQuestion,
  savedNotice,
  publishBlocked,
  onSaveQuestion,
  onPublishDraft,
}: {
  selectedQuestion: EditableQuestion;
  savedNotice: string;
  publishBlocked: boolean;
  onSaveQuestion: (question: EditableQuestion) => void;
  onPublishDraft: () => void;
}) {
  const initialOptionText =
    selectedQuestion.section === "B"
      ? (selectedQuestion.simulation?.stepOptions?.map((step) => step.label) ??
          selectedQuestion.simulation?.guidedActions?.map((action) => action.instruction) ??
          selectedQuestion.simulation?.requiredSteps ??
          []).join("\n")
      : (selectedQuestion.options ?? []).map((option) => `${option.id}. ${option.label}${option.isCorrect ? " *" : ""}`).join("\n");
  const [editingId] = useState(selectedQuestion.id);
  const [section, setSection] = useState<"A" | "B" | "C">(selectedQuestion.section);
  const [questionType, setQuestionType] = useState<QuestionType>(selectedQuestion.type);
  const [competency, setCompetency] = useState<CompetencyArea>(selectedQuestion.competency);
  const [score, setScore] = useState(String(selectedQuestion.score));
  const [subject, setSubject] = useState(selectedQuestion.subject ?? "General");
  const [domainLabel, setDomainLabel] = useState(selectedQuestion.domainLabel ?? "Question Bank");
  const [prompt, setPrompt] = useState(selectedQuestion.prompt);
  const [answerKey, setAnswerKey] = useState(selectedQuestion.options?.find((option) => option.isCorrect)?.id ?? "B");
  const [optionText, setOptionText] = useState(initialOptionText);
  const [explanation, setExplanation] = useState(selectedQuestion.explanation ?? selectedQuestion.rubric?.join("\n") ?? "");

  function buildEditedQuestion() {
    const lines = optionText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const parsedOptions = lines.map((line, index) => {
      const fallbackId = String.fromCharCode(65 + index);
      const idMatch = line.match(/^([A-D])[\).\s-]+/);
      const id = idMatch?.[1] ?? fallbackId;
      const label = line.replace(/^([A-D])[\).\s-]+/, "").replace(/\s\*$/, "");

      return {
        id,
        label,
        isCorrect: id === answerKey ? true : undefined,
      };
    });
    const simulationSteps = lines.map((line, index) => ({
      id: `step-${index + 1}`,
      label: line.replace(/^\d+[\).\s-]+/, ""),
    }));

    return {
      ...selectedQuestion,
      id: editingId,
      section,
      type: questionType,
      prompt,
      score: Number(score) || (section === "B" ? 2 : section === "C" ? 3 : 1),
      competency,
      subject,
      domainLabel,
      options: section === "B" ? undefined : parsedOptions,
      simulation:
        section === "B"
          ? {
              screen: "easiclass-simulator",
              expectedAction: questionType === "step-order" ? "order-workflow" : "complete-guided-actions",
              requiredSteps: simulationSteps.map((step) => step.label),
              correctOrder: simulationSteps.map((step) => step.id),
              stepOptions: simulationSteps,
            }
          : undefined,
      rubric: section === "B" ? [`Partial scoring enabled: ${simulationSteps.length || 1} required actions.`] : undefined,
      explanation,
      recommendedModule: domainLabel,
    } satisfies EditableQuestion;
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3 md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Selected Item</p>
          <h3 className="text-lg font-black">{editingId}</h3>
        </div>
        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">
          Saved as draft first
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <select value={section} onChange={(event) => setSection(event.target.value as "A" | "B" | "C")} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold">
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
        <select value={questionType} onChange={(event) => setQuestionType(event.target.value as QuestionType)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold">
          <option value="single-choice">single-choice</option>
          <option value="scenario-choice">scenario-choice</option>
          <option value="step-order">step-order</option>
          <option value="hotspot">hotspot</option>
          <option value="rubric-response">rubric-response</option>
        </select>
        <select value={competency} onChange={(event) => setCompetency(event.target.value as CompetencyArea)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold">
          {Object.entries(competencyLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input value={score} onChange={(event) => setScore(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold" placeholder="Subject" />
        <input value={domainLabel} onChange={(event) => setDomainLabel(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold" placeholder="Domain / module" />
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="mt-3 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm font-semibold leading-6"
      />

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_160px]">
        <textarea
          value={optionText}
          onChange={(event) => setOptionText(event.target.value)}
          className="min-h-28 rounded-lg border border-slate-200 p-3 text-sm leading-6"
          placeholder={section === "B" ? "One simulation step per line" : "A. Option one\nB. Correct option *"}
        />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Correct Answer</span>
          <select value={answerKey} onChange={(event) => setAnswerKey(event.target.value)} disabled={section === "B"} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100">
            {["A", "B", "C", "D"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
            Section B uses step sequence or guided actions for scoring.
          </p>
        </label>
      </div>

      <textarea
        value={explanation}
        onChange={(event) => setExplanation(event.target.value)}
        className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm leading-6"
        placeholder="Explanation, rubric, or admin review note"
      />

      {savedNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{savedNotice}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button onClick={() => onSaveQuestion(buildEditedQuestion())} className="h-11 rounded-lg bg-slate-950 text-sm font-black text-white">
          Save to Draft Version
        </button>
        <button
          onClick={onPublishDraft}
          disabled={publishBlocked}
          className={classNames(
            "h-11 rounded-lg text-sm font-black",
            publishBlocked ? "cursor-not-allowed bg-slate-200 text-slate-500" : "bg-emerald-600 text-white",
          )}
        >
          Publish Version
        </button>
      </div>
    </div>
  );
}

function ImportPreview({ onConfirm }: { onConfirm: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const sectionACount = sampleAssessmentPack.questions.filter((question) => question.section === "A").length;
  const sectionBCount = sampleAssessmentPack.questions.filter((question) => question.section === "B").length;
  const sectionCCount = sampleAssessmentPack.questions.filter((question) => question.section === "C").length;
  const detectedRows = [
    { section: "A", type: "MCQ", count: sectionACount, status: "Ready" },
    { section: "B", type: "Simulation rubric", count: sectionBCount, status: "Rubric mapped" },
    { section: "C", type: "Mission scenario", count: sectionCCount, status: "Needs review" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
      <div className="p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-800">
          <Upload size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">PDF / Excel Import Preview</p>
          <h2 className="text-xl font-black">Validate Instrument Pack</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <AdminMetric icon={CheckCircle2} label="Detected Items" value={String(sectionACount + sectionBCount + sectionCCount)} />
        <AdminMetric icon={ShieldCheck} label="Rubrics" value={String(sectionBCount)} />
        <AdminMetric icon={XCircle} label="Needs Review" value={String(sectionCCount)} />
      </div>
      <div className="mt-4 space-y-2">
        {detectedRows.map((row) => (
          <div key={row.section} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-sm font-black">Section {row.section} · {row.type}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{row.count} items detected from instrument files</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600">{row.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
        Mission scenarios need admin review for achievement level and competency mapping before publishing.
      </div>
      {confirmed && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Import confirmed and staged for review.</p>}
      <button
        onClick={() => {
          onConfirm();
          setConfirmed(true);
        }}
        className="mt-4 h-11 w-full rounded-lg bg-amber-500 text-sm font-black text-slate-950"
      >
        Confirm import
      </button>
      </div>
    </div>
  );
}

function AuditLog({ logs }: { logs: AdminAuditEntry[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">Audit Log</h2>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">Live</span>
      </div>
      <div className="mt-4 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 rounded-lg bg-emerald-50 p-3">
            <ListChecks className="shrink-0 text-emerald-600" size={20} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-800">{log.action}</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">{log.time}</span>
              </div>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{log.detail}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{log.actor}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [notice, setNotice] = useState("No recent notifications.");

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
      <div className="p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-sky-100 text-sky-700">
          <Bell size={22} />
        </div>
        <h2 className="text-xl font-black">Notifications</h2>
      </div>
      <p className="mt-2 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{notice}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button onClick={() => setNotice("Exam completion email sent to candidate.")} className="rounded-lg bg-sky-600 p-3 text-sm font-bold text-white">
          Exam email
        </button>
        <button onClick={() => setNotice("Certificate issued notification sent to school admin.")} className="rounded-lg bg-emerald-600 p-3 text-sm font-bold text-white">
          Certificate email
        </button>
        <button onClick={() => setNotice("Retake reminder scheduled for 19 Jun 2026.")} className="rounded-lg bg-amber-500 p-3 text-sm font-bold text-slate-950">
          Retake reminder
        </button>
      </div>
      </div>
    </div>
  );
}

function SchoolAdminView() {
  const [selectedTeacher, setSelectedTeacher] = useState("Nur Aina Abdullah");
  const [schoolAction, setSchoolAction] = useState("No school action generated yet.");
  const teacherRows = [
    ["Nur Aina Abdullah", "Certified", "81%", "Strong in AI Courseware, needs Lesson Analytics practice."],
    ["Daniel Wong", "In Progress", "Section B", "Simulation task pending: Smart Quiz workflow."],
    ["Siti Mariam", "Retake Required", "46%", "Recommended modules: Hybrid Learning and Smart Quiz."],
  ];
  const teacherDetail = teacherRows.find(([name]) => name === selectedTeacher) ?? teacherRows[0];

  return (
    <div className="space-y-5">
      <RoleHero
        icon={School}
        eyebrow="School Admin"
        title="SK Tanjung Aru Overview"
        description="School admins see only their own school participation, pass rate, teacher progress, and competency gaps."
      />
      <AdminBreadcrumb items={["JPNS", "PPD Kota Kinabalu", "SK Tanjung Aru"]} />
      <ReportFilters scope="School" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric icon={Users} label="Teachers" value="48" />
        <AdminMetric icon={ShieldCheck} label="Pass Rate" value="79%" />
        <AdminMetric icon={FileBadge} label="Certified" value="38" />
        <AdminMetric icon={RefreshCcw} label="Retakes" value="6" />
      </section>
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
        <div className="p-4 md:p-5">
        <h2 className="text-xl font-bold">Teacher Progress</h2>
        <div className="mt-4 space-y-3">
          {teacherRows.map(([name, status, detail]) => (
            <button
              key={name}
              onClick={() => setSelectedTeacher(name)}
              className={classNames(
                "flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left",
                selectedTeacher === name ? "bg-emerald-600 text-white" : "bg-emerald-50 text-slate-950",
              )}
            >
              <div>
                <p className="font-bold">{name}</p>
                <p className={classNames("mt-1 text-sm", selectedTeacher === name ? "text-slate-300" : "text-slate-500")}>{status}</p>
              </div>
              <span className={classNames("rounded-md px-2 py-1 text-sm font-bold", selectedTeacher === name ? "bg-white/15 text-white" : "bg-white text-slate-700")}>{detail}</span>
            </button>
          ))}
        </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <div className="p-4 md:p-5">
        <p className="text-sm font-semibold text-slate-500">Selected Teacher</p>
        <h2 className="mt-1 text-xl font-bold">{teacherDetail[0]}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{teacherDetail[3]}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => setSchoolAction(`Intervention note generated for ${teacherDetail[0]}.`)}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-bold text-white"
          >
            Intervention note
          </button>
          <button
            onClick={() => setSchoolAction(`PLC group assigned: ${teacherDetail[0]} joins Lesson Analytics clinic.`)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            Assign PLC
          </button>
          <button
            onClick={() => setSchoolAction(`Reminder sent to ${teacherDetail[0]} and copied to school admin.`)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            Send reminder
          </button>
        </div>
        <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{schoolAction}</p>
        </div>
      </section>
      <CompetencyPanel title="School Weak Areas" />
      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-amber-400" />
        <div className="p-4 md:p-5">
        <h2 className="text-xl font-bold">School Certification Workflow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatusStep title="Identify" detail="Find weak competencies" done />
          <StatusStep title="Intervene" detail="Assign PLC module" done={schoolAction.includes("PLC")} />
          <StatusStep title="Remind" detail="Notify teacher" done={schoolAction.includes("Reminder")} />
          <StatusStep title="Report" detail="Export principal report" done={false} />
        </div>
        </div>
      </section>
      <PrincipalReport />
    </div>
  );
}

function PpdAdminView() {
  const [districtMode, setDistrictMode] = useState("Readiness");
  const [selectedSchool, setSelectedSchool] = useState("SK Tanjung Aru");
  const [ppdAction, setPpdAction] = useState("No district action scheduled yet.");
  const ppdModes = ["Readiness", "Retake", "PLC Plan"];
  const schools = [
    { label: "SK Tanjung Aru", pass: 79, teachers: 48 },
    { label: "SMK Likas", pass: 86, teachers: 62 },
    { label: "SK Inanam", pass: 71, teachers: 39 },
    { label: "SMK Sanzac", pass: 66, teachers: 44 },
  ];

  return (
    <div className="space-y-5">
      <RoleHero
        icon={Building2}
        eyebrow="PPD Admin"
        title="PPD Kota Kinabalu Dashboard"
        description="PPD admins monitor schools within their district, compare readiness, and plan PLC training."
      />
      <AdminBreadcrumb items={["JPNS", "PPD Kota Kinabalu"]} />
      <ReportFilters scope="PPD" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric icon={School} label="Schools" value="34" />
        <AdminMetric icon={Users} label="Teachers" value="428" />
        <AdminMetric icon={ShieldCheck} label="Pass Rate" value="82%" />
        <AdminMetric icon={CalendarClock} label="Pending" value="57" />
      </section>
      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-amber-400" />
        <div className="p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">School Comparison</h2>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {ppdModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setDistrictMode(mode)}
                className={classNames(
                  "h-9 rounded-md px-2 text-xs font-bold",
                  districtMode === mode ? "bg-sky-600 text-white shadow-sm" : "text-slate-500",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {schools.map((school) => (
            <button
              key={school.label}
              onClick={() => setSelectedSchool(school.label)}
              className={classNames(
                "w-full rounded-lg p-3 text-left",
                selectedSchool === school.label ? "bg-sky-600 text-white" : "bg-sky-50",
              )}
            >
              <ProgressRow label={school.label} meta={`${school.teachers} teachers`} value={school.pass} />
            </button>
          ))}
        </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-4 md:p-5">
        <p className="text-sm font-semibold text-slate-500">Selected School</p>
        <h2 className="mt-1 text-xl font-bold">{selectedSchool}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Recommended district action based on current mode: {districtMode}.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => setPpdAction(`District PLC scheduled for ${selectedSchool}.`)}
            className="h-10 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950"
          >
            Schedule PLC
          </button>
          <button
            onClick={() => setPpdAction(`Retake support list generated for ${selectedSchool}.`)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            Retake list
          </button>
          <button
            onClick={() => setPpdAction(`District memo prepared for ${selectedSchool}.`)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            Prepare memo
          </button>
        </div>
        <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{ppdAction}</p>
        </div>
      </section>
      <RecommendationCard text={`${districtMode}: Prioritize Smart Quiz and Lesson Analytics clinics for schools below 75% pass rate.`} />
      <TrainingCalendar />
    </div>
  );
}

function JpnsAdminView() {
  const [reportScope, setReportScope] = useState("State Overview");
  const [jpnsAction, setJpnsAction] = useState("No state-level action issued yet.");
  const reportScopes = ["State Overview", "PPD Ranking", "Maturity"];

  return (
    <div className="space-y-5">
      <RoleHero
        icon={BarChart3}
        eyebrow="JPNS Admin"
        title="Sabah State Certification Analytics"
        description="JPNS admins see state-wide certification progress, PPD comparison, and digital maturity indicators."
      />
      <AdminBreadcrumb items={["JPNS Sabah"]} />
      <ReportFilters scope="JPNS" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric icon={Users} label="Candidates" value="1,235" />
        <AdminMetric icon={Building2} label="PPD" value="24" />
        <AdminMetric icon={ShieldCheck} label="Pass Rate" value="76%" />
        <AdminMetric icon={FileBadge} label="Issued" value="938" />
      </section>
      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <div className="p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">PPD Performance</h2>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {reportScopes.map((scope) => (
              <button
                key={scope}
                onClick={() => setReportScope(scope)}
                className={classNames(
                  "h-9 rounded-md px-2 text-xs font-bold",
                  reportScope === scope ? "bg-sky-600 text-white shadow-sm" : "text-slate-500",
                )}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {districtStats.map((district) => (
            <ProgressRow key={district.label} label={district.label} meta={`${district.teachers} teachers`} value={district.pass} />
          ))}
        </div>
        </div>
      </section>
      <CompetencyPanel title="State Competency Gap" />
      <SabahMapVisual />
      <section className="grid gap-3 md:grid-cols-3">
        <ActionTile icon={MapIcon} title="Sabah Maturity Map" label="PPD ranking and school readiness layer" />
        <button onClick={() => setJpnsAction("State PLC circular generated for all low-maturity PPDs.")} className="text-left">
          <ActionTile icon={FileText} title="Generate Circular" label="state training instruction" />
        </button>
        <button onClick={() => setJpnsAction("JPNS executive report pack prepared.")} className="text-left">
          <ActionTile icon={Download} title="Executive Export" label="PDF and Excel report pack" />
        </button>
      </section>
      <p className="rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{jpnsAction}</p>
      <RecommendationCard text={`${reportScope}: State-wide PLC focus on Hybrid Learning, Lesson Analytics, and AI Activity Design.`} />
    </div>
  );
}

function UsersView() {
  const [invitedUsers, setInvitedUsers] = useState(0);
  const [roleUpdates, setRoleUpdates] = useState(0);
  const [userNotice, setUserNotice] = useState("User directory ready.");

  return (
    <div className="space-y-5">
      <RoleHero
        icon={UserCog}
        eyebrow="Super Admin"
        title="User & Role Management"
        description="Only Super Admin can manage users, assign roles, and control organization-level access."
      />
      <section className="rounded-lg bg-cyan-50 p-4">
        <p className="text-sm font-bold text-cyan-900">User action log</p>
        <p className="mt-1 text-sm leading-6 text-cyan-800">
          {userNotice} Invites: {invitedUsers}. Role updates: {roleUpdates}.
        </p>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <button
          onClick={() => {
            setInvitedUsers((count) => count + 1);
            setUserNotice("Invitation created for a new School Admin.");
          }}
          className="text-left"
        >
          <ActionTile icon={Plus} title="Invite User" label="teacher, school, PPD, JPNS" />
        </button>
        <button
          onClick={() => {
            setRoleUpdates((count) => count + 1);
            setUserNotice("Role changed from School Admin to PPD Admin.");
          }}
          className="text-left"
        >
          <ActionTile icon={ShieldCheck} title="Assign Role" label="role-based permission control" />
        </button>
        <button
          onClick={() => setUserNotice("User deactivated; audit history preserved.")}
          className="text-left"
        >
          <ActionTile icon={Archive} title="Deactivate User" label="preserve audit history" />
        </button>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-xl font-bold">Recent Users</h2>
        <div className="mt-4 space-y-3">
          {Object.values(roleProfiles).map((profile) => (
            <div key={profile.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                  {profile.initials}
                </span>
                <div>
                  <p className="font-bold">{profile.label}</p>
                  <p className="text-sm text-slate-500">{profile.scope}</p>
                </div>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600">Active</span>
            </div>
          ))}
        </div>
      </section>
      <PermissionMatrix />
    </div>
  );
}

function SettingsView() {
  const [cooldown, setCooldown] = useState(7);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [certificatePrefix, setCertificatePrefix] = useState("SME-2026");

  return (
    <div className="space-y-5">
      <RoleHero
        icon={Settings}
        eyebrow="Super Admin"
        title="System Settings"
        description="Configure certificate rules, retake policy, achievement levels, and platform-wide defaults."
      />
      <CertificateQueue />
      <section className="grid gap-3 md:grid-cols-2">
        <SettingsItem title="Achievement Rules" value="85%, 70%, 50%, below 50%" />
        <SettingsItem title="Retake Policy" value={`${cooldown} days cooldown, ${maxAttempts} attempts per year`} />
        <SettingsItem title="Certificate Prefix" value={certificatePrefix} />
        <SettingsItem title="Active Pack" value="Sabah Pilot Certification v1.0" />
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <button
          onClick={() => setCooldown((value) => (value === 7 ? 14 : 7))}
          className="rounded-lg border border-slate-200 bg-white p-4 text-left"
        >
          <CalendarClock className="text-slate-500" size={22} />
          <p className="mt-3 font-bold">Toggle Retake Cooldown</p>
          <p className="mt-1 text-sm text-slate-500">Switch between 7 and 14 days</p>
        </button>
        <button
          onClick={() => setMaxAttempts((value) => (value === 3 ? 5 : 3))}
          className="rounded-lg border border-slate-200 bg-white p-4 text-left"
        >
          <RefreshCcw className="text-slate-500" size={22} />
          <p className="mt-3 font-bold">Change Attempt Limit</p>
          <p className="mt-1 text-sm text-slate-500">Switch between 3 and 5 attempts</p>
        </button>
        <button
          onClick={() => setCertificatePrefix((value) => (value === "SME-2026" ? "MAX-SBH-2026" : "SME-2026"))}
          className="rounded-lg border border-slate-200 bg-white p-4 text-left"
        >
          <FileBadge className="text-slate-500" size={22} />
          <p className="mt-3 font-bold">Change Certificate Prefix</p>
          <p className="mt-1 text-sm text-slate-500">Certificate numbering rule</p>
        </button>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <SystemHealthItem title="API Status" value="Operational" status="ok" />
        <SystemHealthItem title="Certificate Queue" value="12 pending" status="warn" />
        <SystemHealthItem title="Audit Retention" value="Enabled" status="ok" />
      </section>
    </div>
  );
}

function RoleHero({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof School;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const visual = eyebrow.includes("School")
    ? surfaceVisuals[1]
    : eyebrow.includes("PPD")
      ? surfaceVisuals[2]
      : eyebrow.includes("JPNS")
        ? surfaceVisuals[0]
        : surfaceVisuals[3];

  return (
    <section className="overflow-hidden rounded-2xl bg-[#071f54] text-white shadow-lg">
      <div className={classNames("h-2 bg-gradient-to-r", eyebrow.includes("School") ? "from-emerald-500 to-teal-400" : eyebrow.includes("PPD") ? "from-amber-400 to-orange-500" : eyebrow.includes("JPNS") ? "from-sky-500 to-cyan-400" : "from-rose-500 to-amber-400")} />
      <div className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className={classNames("grid size-12 shrink-0 place-items-center rounded-2xl", visual.icon)}>
          <Icon size={25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-cyan-200">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-white">Role-based</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-white">Mobile ready</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-white">Exportable</span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function StatusStep({ title, detail, done }: { title: string; detail: string; done: boolean }) {
  return (
    <div className={classNames("rounded-lg border p-3", done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50")}>
      <div className="flex items-center gap-2">
        {done ? <CheckCircle2 className="text-emerald-600" size={18} /> : <XCircle className="text-slate-400" size={18} />}
        <p className="font-black">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function AdminBreadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-600">
      <Route className="text-slate-400" size={18} />
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          <span className={index === items.length - 1 ? "text-slate-950" : ""}>{item}</span>
          {index < items.length - 1 && <ChevronRight className="text-slate-300" size={16} />}
        </span>
      ))}
    </nav>
  );
}

function PrincipalReport() {
  const [generated, setGenerated] = useState(false);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Principal Report</p>
          <h2 className="text-xl font-black">School Digital Readiness Summary</h2>
        </div>
        <FileText className="text-slate-500" size={24} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <AdminMetric icon={ShieldCheck} label="Certified" value="38/48" />
        <AdminMetric icon={Gauge} label="Maturity" value="Developing" />
        <AdminMetric icon={BookOpenCheck} label="PLC Focus" value="Analytics" />
      </div>
      <button
        onClick={() => setGenerated(true)}
        className="mt-4 h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
      >
        Generate principal PDF
      </button>
      {generated && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Principal report generated: participation, pass rate, weak competencies, and PLC recommendations.
        </p>
      )}
    </section>
  );
}

function TrainingCalendar() {
  const [selected, setSelected] = useState("Smart Quiz Clinic");
  const sessions = [
    ["Smart Quiz Clinic", "18 Jun", "Schools below 75% pass rate"],
    ["Lesson Analytics Lab", "24 Jun", "Science and Maths teachers"],
    ["Hybrid Learning Workshop", "02 Jul", "Rural school readiness group"],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Training Calendar</p>
          <h2 className="text-xl font-black">District PLC Schedule</h2>
        </div>
        <CalendarClock className="text-slate-500" size={24} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sessions.map(([name, date, audience]) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={classNames(
              "rounded-lg border p-4 text-left",
              selected === name ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50",
            )}
          >
            <p className="font-black">{name}</p>
            <p className={classNames("mt-2 text-sm", selected === name ? "text-slate-300" : "text-slate-500")}>{date}</p>
            <p className={classNames("mt-2 text-sm leading-6", selected === name ? "text-slate-200" : "text-slate-600")}>
              {audience}
            </p>
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">
        Selected session: {selected}. Invite list and attendance sheet prepared.
      </p>
    </section>
  );
}

function SabahMapVisual() {
  const points = [
    { name: "Kota Kinabalu", x: "18%", y: "35%", value: 82 },
    { name: "Sandakan", x: "62%", y: "28%", value: 74 },
    { name: "Tawau", x: "72%", y: "68%", value: 69 },
    { name: "Keningau", x: "35%", y: "62%", value: 63 },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Sabah Map Visual</p>
          <h2 className="text-xl font-black">PPD Certification Maturity</h2>
        </div>
        <MapIcon className="text-slate-500" size={24} />
      </div>
      <div className="relative mt-4 h-72 overflow-hidden rounded-lg bg-slate-950">
        <div className="absolute inset-5 rounded-[45%] border border-cyan-300/40 bg-cyan-300/10" />
        <div className="absolute left-[20%] top-[20%] h-40 w-52 rotate-[-12deg] rounded-[45%] border border-cyan-200/30" />
        <div className="absolute right-[12%] top-[22%] h-36 w-52 rotate-[18deg] rounded-[45%] border border-cyan-200/30" />
        {points.map((point) => (
          <div key={point.name} className="absolute max-w-[150px]" style={{ left: point.x, top: point.y }}>
            <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 shadow">
              <MapPin className={point.value >= 75 ? "shrink-0 text-emerald-600" : "shrink-0 text-amber-600"} size={16} />
              <span className="text-xs font-black text-slate-950">
                {point.name} {point.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificateQueue() {
  const [queueNotice, setQueueNotice] = useState("12 certificates pending review.");
  const rows = [
    ["SME-2026-000143", "Pending", "Daniel Wong"],
    ["SME-2026-000144", "Reissue", "Siti Mariam"],
    ["SME-2026-000145", "Revoke review", "Amin Rashid"],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Certificate Queue Management</p>
          <h2 className="text-xl font-black">Approve, Reissue, Revoke</h2>
        </div>
        <FileBadge className="text-slate-500" size={24} />
      </div>
      <p className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{queueNotice}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([id, status, name]) => (
          <div key={id} className="rounded-lg bg-slate-50 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-black">{id}</p>
                <p className="text-sm text-slate-500">
                  {name} · {status}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1 min-[420px]:grid-cols-3">
                <button
                  onClick={() => setQueueNotice(`${id} approved and issued.`)}
                  className="rounded-md bg-emerald-600 px-2 py-2 text-xs font-bold text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => setQueueNotice(`${id} reissue workflow started.`)}
                  className="rounded-md bg-slate-950 px-2 py-2 text-xs font-bold text-white"
                >
                  Reissue
                </button>
                <button
                  onClick={() => setQueueNotice(`${id} revoked and audit log updated.`)}
                  className="rounded-md bg-rose-600 px-2 py-2 text-xs font-bold text-white"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PermissionMatrix() {
  const rows = [
    ["Teacher", "Exam, result, certificate"],
    ["School Admin", "Own school only"],
    ["PPD Admin", "District schools only"],
    ["JPNS Admin", "State analytics"],
    ["Super Admin", "System-wide control"],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="text-xl font-bold">Permission Matrix</h2>
      <div className="mt-4 space-y-2">
        {rows.map(([roleName, scope]) => (
          <div key={roleName} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <p className="font-bold">{roleName}</p>
            <p className="text-right text-sm font-semibold text-slate-600">{scope}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemHealthItem({ title, value, status }: { title: string; value: string; status: "ok" | "warn" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <span className={classNames("size-3 rounded-full", status === "ok" ? "bg-emerald-500" : "bg-amber-500")} />
      </div>
      <p className="mt-3 text-xl font-black">{value}</p>
    </div>
  );
}

function ReportFilters({ scope }: { scope: string }) {
  const [exported, setExported] = useState(false);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <Filter className="text-slate-500" size={22} />
        <div>
          <p className="text-sm font-semibold text-slate-500">{scope} report filters</p>
          <h2 className="text-lg font-black">Year, school, PPD, subject, achievement</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {["2026", "All Schools", "All PPD", "All Subjects", "All Levels"].map((item) => (
          <select key={item} className="h-10 rounded-lg border border-slate-200 px-2 text-sm font-semibold">
            <option>{item}</option>
          </select>
        ))}
      </div>
      <button
        onClick={() => setExported(true)}
        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
      >
        <Download size={17} />
        Export {scope} report
      </button>
      {exported && <p className="mt-3 text-sm font-bold text-emerald-700">{scope} report export prepared.</p>}
    </section>
  );
}

function ProgressRow({ label, meta, value }: { label: string; meta: string; value: number }) {
  const visual = value >= 80 ? surfaceVisuals[1] : value >= 70 ? surfaceVisuals[0] : surfaceVisuals[2];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className={classNames("rounded-full px-2 py-0.5 text-xs font-black", visual.bg, visual.text)}>{meta} · {value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={classNames("h-full rounded-full", visual.bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompetencyPanel({ title, results }: { title: string; results?: CompetencyResult[] }) {
  const rows =
    results && results.length > 0
      ? results
      : competencies.slice(2).map((item) => ({
          area: "classroom-engagement" as CompetencyArea,
          label: item.label,
          earned: item.value,
          total: 100,
          percentage: item.value,
          recommendation: "Use this area for targeted PLC planning and teacher coaching.",
        }));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-3">
            <ProgressRow
              label={item.label}
              meta={`${item.earned}/${item.total} · ${getCompetencyStatus(item.percentage)}`}
              value={item.percentage}
            />
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{item.recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ text }: { text: string }) {
  return (
    <section className="rounded-lg bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-900">Training Recommendation</p>
      <p className="mt-1 text-sm leading-6 text-amber-800">{text}</p>
    </section>
  );
}

function SettingsItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function StatusPill({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-700">
      <Icon size={18} className="shrink-0 text-slate-500" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function ExamCard({
  icon: Icon,
  section,
  title,
  detail,
  score,
}: {
  icon: typeof BookOpenCheck;
  section: string;
  title: string;
  detail: string;
  score: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{section}</p>
          <h3 className="mt-1 font-bold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        <ChevronRight className="shrink-0 text-slate-400" size={20} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <Check size={17} className="text-emerald-600" />
        {score}
      </div>
    </div>
  );
}

function CertificateMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ActionTile({ icon: Icon, title, label }: { icon: typeof QrCode; title: string; label: string }) {
  const visual = title.includes("Retake") || title.includes("Archive") || title.includes("Revoke")
    ? surfaceVisuals[3]
    : title.includes("Certificate") || title.includes("PDF") || title.includes("Verify")
      ? surfaceVisuals[1]
      : title.includes("Import") || title.includes("Replace") || title.includes("PLC")
        ? surfaceVisuals[2]
        : surfaceVisuals[0];

  return (
    <div className={classNames("min-h-32 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md", visual.border, visual.bg)}>
      <div className={classNames("grid size-11 place-items-center rounded-xl", visual.icon)}>
        <Icon size={23} />
      </div>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

function AdminMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  const visual = label.includes("Pass") || label.includes("Certified") || label.includes("Issued") || label.includes("Published") || label.includes("API")
    ? surfaceVisuals[1]
    : label.includes("Retake") || label.includes("Pending") || label.includes("Review") || label.includes("Queue")
      ? surfaceVisuals[2]
      : label.includes("PPD") || label.includes("District") || label.includes("School")
        ? surfaceVisuals[0]
        : surfaceVisuals[3];

  return (
    <div className={classNames("overflow-hidden rounded-xl border bg-white p-4 shadow-sm", visual.border)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={classNames("grid size-9 place-items-center rounded-lg", visual.icon)}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={classNames("h-full w-2/3 rounded-full", visual.bar)} />
      </div>
    </div>
  );
}
