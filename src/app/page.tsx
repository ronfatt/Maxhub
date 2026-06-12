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
  Map,
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

type NavItem = {
  view: View;
  icon: typeof LayoutDashboard;
  label: string;
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

const districtStats = [
  { label: "Kota Kinabalu", pass: 82, teachers: 428 },
  { label: "Sandakan", pass: 74, teachers: 316 },
  { label: "Tawau", pass: 69, teachers: 287 },
  { label: "Keningau", pass: 63, teachers: 204 },
];

const simulationSteps = [
  "Open AI Courseware",
  "Select Science Form 4",
  "Generate Smart Quiz",
  "Assign Hybrid Activity",
];

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
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
        <header className="overflow-hidden rounded-[1.35rem] bg-[#071f54] p-5 text-white shadow-xl md:p-7">
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
              <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">
                Register, sit for the assessment, receive a verified certificate, and review performance by role.
              </p>
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
        </header>

        <section className="mt-5 grid flex-1 gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
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

          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <p className="text-sm font-semibold text-slate-500">Certification workspaces</p>
            <h2 className="mt-1 text-xl font-black">One platform, role-based access</h2>
            <div className="mt-4 space-y-3">
              {roleOrder.map((roleKey) => {
                const profile = roleProfiles[roleKey];

                return (
                  <button
                    key={roleKey}
                    onClick={() => onSignIn(roleKey)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-white"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#071f54] text-xs font-black text-white">
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
        <div className="relative mt-5 rounded-2xl bg-white/10 p-4">
          <p className="text-sm font-bold text-cyan-100">Next Action</p>
          <p className="mt-1 text-sm leading-6 text-slate-200">
            Download or verify your certificate. You can still review your competency report.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate("certificate")}
              className="h-11 rounded-lg bg-white text-sm font-black text-slate-950"
            >
              Download Certificate
            </button>
            <button
              onClick={() => onNavigate("exam")}
              className="h-11 rounded-lg border border-white/25 text-sm font-black text-white"
            >
              Review Exam
            </button>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Metric label="Score" value={`${totalScore}/180`} />
          <Metric label="Result" value={`${percentage}%`} />
          <Metric label="Attempt" value={`#${candidate.attempt}`} />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <ActionTile icon={ClipboardCheck} title="My Result" label={`${achievementLabel} · ${percentage}%`} />
        <button onClick={() => onNavigate("certificate")} className="text-left">
          <ActionTile icon={FileBadge} title="Certificate Center" label="view, download, copy verification" />
        </button>
        <button onClick={() => onNavigate("retake")} className="text-left">
          <ActionTile icon={RefreshCcw} title="Retake Policy" label="status, cooldown, learning modules" />
        </button>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className={classNames("grid size-11 place-items-center rounded-xl", section.tone)}>
                <section.icon size={20} />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
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
              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.round((section.score / section.total) * 100)}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
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
      </section>

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
  const tools = ["AI Courseware", "Smart Quiz", "Role Talk", "Analytics"];
  const examQuestions = [
    sampleAssessmentPack.questions[0],
    {
      ...sampleAssessmentPack.questions[0],
      id: "A-002",
      prompt: "Which tool is best for checking student understanding immediately?",
      options: [
        { id: "A", label: "Smart Quiz", isCorrect: true },
        { id: "B", label: "Screen Saver" },
        { id: "C", label: "Device Lock" },
        { id: "D", label: "Wallpaper" },
      ],
    },
    sampleAssessmentPack.questions[2],
  ];
  const [phase, setPhase] = useState<"briefing" | "questions" | "simulation" | "review" | "result">("briefing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timerMinutes, setTimerMinutes] = useState(90);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [simulationFeedback, setSimulationFeedback] = useState("Complete each task to record partial marks.");
  const [hotspotDone, setHotspotDone] = useState(false);
  const [workflowDone, setWorkflowDone] = useState(false);
  const [dragDone, setDragDone] = useState(false);
  const completedSimulation = [hotspotDone, workflowDone, dragDone].filter(Boolean).length;
  const answeredCount = Object.keys(answers).length + completedSimulation;
  const canSubmit = Object.keys(answers).length === examQuestions.length && completedSimulation === 3;
  const previewScore = 68 + completedSimulation * 11 + (Object.values(answers).includes("B") ? 45 : 36);
  const previewPercentage = Math.round((previewScore / 180) * 100);
  const achievement = resolveAchievement(previewScore, 180, sampleAssessmentPack.achievementRules);
  const currentQuestion = examQuestions[questionIndex];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Assessment Pack</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Sabah Pilot Certification</h2>
            <p className="mt-1 text-sm text-slate-600">Certification Passport · 180 marks · 90 minutes</p>
          </div>
          <div className="rounded-2xl bg-[#062a6f] px-3 py-2 text-right text-white">
            <p className="text-xs font-semibold text-slate-300">Timer</p>
            <p className="text-lg font-black">{timerMinutes}:00</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatusPill icon={Timer} label={timerMinutes <= 10 ? "Time warning" : "Timer active"} />
          <StatusPill icon={Layers3} label={`${answeredCount}/6 tasks`} />
          <StatusPill icon={ShieldCheck} label={phase === "result" ? "Submitted" : "In progress"} />
        </div>
      </section>

      {phase === "briefing" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h3 className="text-xl font-black">Exam Briefing</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {sampleAssessmentPack.sections.map((section) => (
              <div key={section.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Section {section.id}</p>
                <p className="mt-1 font-black">{section.title}</p>
                <p className="mt-2 text-sm text-slate-600">{section.totalScore} marks</p>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-700">
            <li>One attempt is recorded when you submit the exam.</li>
            <li>Below 50% will unlock retake after 7 days, maximum 3 attempts per year.</li>
            <li>Section B records hotspot, workflow, and drag-task completion.</li>
          </ul>
          <label className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">
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
              setPhase("questions");
              setTimerMinutes(89);
            }}
            disabled={!rulesAccepted}
            className={classNames(
              "mt-5 h-12 w-full rounded-lg text-sm font-black",
              rulesAccepted ? "bg-slate-950 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500",
            )}
          >
            Start exam
          </button>
        </section>
      )}

      {phase === "questions" && (
        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Question Navigator</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Question {questionIndex + 1} of {examQuestions.length}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {examQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setQuestionIndex(index)}
                  className={classNames(
                    "grid size-10 place-items-center rounded-lg text-sm font-black",
                    questionIndex === index
                      ? "bg-slate-950 text-white"
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
            title={currentQuestion.section === "C" ? "Mission Scenario" : "Knowledge Assessment"}
            prompt={currentQuestion.prompt}
            meta={currentQuestion.section === "C" ? "Subject: Science · Tool: Lesson Analytics · Competency: Data intervention" : "Objective item · Competency mapped"}
            options={currentQuestion.options ?? []}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelect={(answer) => setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }))}
          />
          <div className="xl:col-span-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold"
            >
              <ArrowLeft size={17} />
              Previous
            </button>
            <button
              onClick={() => setFlagged((current) => ({ ...current, [currentQuestion.id]: !current[currentQuestion.id] }))}
              className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-bold text-amber-800"
            >
              <Flag size={17} />
              {flagged[currentQuestion.id] ? "Remove review flag" : "Flag for review"}
            </button>
            <button
              onClick={() => {
                if (questionIndex === examQuestions.length - 1) setPhase("simulation");
                else setQuestionIndex((index) => index + 1);
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-bold text-white"
            >
              Next
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {phase === "simulation" && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Section B</p>
                <h3 className="text-xl font-black">EasiClass Skill Lab</h3>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-black text-sky-700">{completedSimulation}/3 tasks</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <div className="flex items-center justify-between bg-[#062a6f] px-3 py-2 text-white">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <span className="size-2.5 rounded-full bg-amber-300" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs font-semibold">EasiClass Simulator</p>
              </div>
              <div className="grid min-h-[390px] bg-white p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {tools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => setSelectedTool(tool)}
                      className={classNames(
                        "min-h-12 rounded-lg px-2 text-xs font-bold transition md:text-sm",
                        selectedTool === tool ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  <SimulationTask
                    done={hotspotDone}
                    title="Click hotspot"
                    detail="Tap AI Courseware in the toolbar"
                    onDone={() => {
                      setHotspotDone(true);
                      setSimulationFeedback("Correct hotspot selected. +12 partial marks.");
                    }}
                  />
                  <SimulationTask
                    done={workflowDone}
                    title="Arrange workflow"
                    detail={simulationSteps.join(" → ")}
                    onDone={() => {
                      setWorkflowDone(true);
                      setSimulationFeedback("Workflow order accepted. +11 partial marks.");
                    }}
                  />
                  <SimulationTask
                    done={dragDone}
                    title="Drag tool into lesson plan"
                    detail={`${selectedTool} dragged into Science activity block`}
                    onDone={() => {
                      setDragDone(true);
                      setSimulationFeedback("Tool placement recorded. +11 partial marks.");
                    }}
                  />
                </div>
                <p className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{simulationFeedback}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ExamCard icon={BookOpenCheck} section="Section A" title="Knowledge Assessment" detail={`${Object.keys(answers).length}/3 answered`} score="80 marks" />
            <ExamCard icon={TabletSmartphone} section="Section B" title="Advanced Simulation" detail="hotspot, workflow, drag scoring" score="40 marks" />
            <ExamCard icon={ClipboardList} section="Section C" title="Mission Assessment" detail="AI judgement and intervention planning" score="60 marks" />
            <button
              onClick={() => setPhase("review")}
              disabled={!canSubmit}
              className={classNames(
                "flex h-12 w-full items-center justify-center rounded-lg text-sm font-black transition",
                canSubmit ? "bg-emerald-600 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500",
              )}
            >
              {canSubmit ? "Review answers before submit" : "Complete all simulation tasks"}
            </button>
          </div>
        </section>
      )}

      {phase === "review" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
            <h3 className="text-xl font-black">Review Before Submission</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <AdminMetric icon={CheckCircle2} label="Answered" value={`${Object.keys(answers).length}/${examQuestions.length}`} />
              <AdminMetric icon={Flag} label="Flagged" value={String(Object.values(flagged).filter(Boolean).length)} />
              <AdminMetric icon={TabletSmartphone} label="Simulation" value={`${completedSimulation}/3`} />
            </div>
            <div className="mt-4 space-y-2">
              {examQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => {
                    setQuestionIndex(index);
                    setPhase("questions");
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-bold"
                >
                  <span>Question {index + 1}</span>
                  <span className={answers[question.id] ? "text-emerald-700" : "text-rose-700"}>
                    {answers[question.id] ? "Answered" : "Unanswered"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setPhase("result")}
            className="h-12 w-full rounded-lg bg-emerald-600 text-sm font-black text-white"
          >
            Submit final exam
          </button>
        </section>
      )}

      {phase === "result" && (
        <ResultView
          score={previewScore}
          percentage={previewPercentage}
          achievement={achievement.achievementLabel}
          onRetake={() => setPhase("briefing")}
        />
      )}
    </div>
  );
}

function SimulationTask({ done, title, detail, onDone }: { done: boolean; title: string; detail: string; onDone: () => void }) {
  return (
    <button
      onClick={onDone}
      className={classNames(
        "flex items-start gap-3 rounded-lg border p-4 text-left",
        done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50",
      )}
    >
      {done ? <CheckCircle2 className="shrink-0 text-emerald-600" size={22} /> : <XCircle className="shrink-0 text-slate-400" size={22} />}
      <span>
        <span className="block font-black">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{detail}</span>
      </span>
    </button>
  );
}

function ResultView({ score, percentage, achievement, onRetake }: { score: number; percentage: number; achievement: string; onRetake: () => void }) {
  const passed = percentage >= 50;

  return (
    <section className="space-y-5">
      <div className={classNames("rounded-lg p-5 text-white", passed ? "bg-emerald-700" : "bg-rose-700")}>
        <p className="text-sm font-semibold text-white/80">Final Result</p>
        <h3 className="mt-2 text-3xl font-black">{score}/180 · {percentage}%</h3>
        <p className="mt-2 text-sm leading-6 text-white/90">{achievement}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <AdminMetric icon={BookOpenCheck} label="Section A" value="68/80" />
        <AdminMetric icon={TabletSmartphone} label="Section B" value="34/40" />
        <AdminMetric icon={ClipboardList} label="Section C" value="54/60" />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <h3 className="text-xl font-black">Next Action</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {passed
            ? "Certificate is ready. Download the PDF or copy the public verification link for school submission."
            : `Retake opens on ${candidate.nextRetake}. Complete the recommended learning modules first.`}
        </p>
      </section>
      <CompetencyPanel title="Question-level Competency Report" />
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
}: {
  section: string;
  title: string;
  prompt: string;
  meta?: string;
  options: Array<{ id: string; label: string; isCorrect?: boolean }>;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{section}</p>
      <h3 className="mt-1 text-lg font-bold">{title}</h3>
      {meta && <p className="mt-2 rounded-lg bg-cyan-50 p-2 text-xs font-bold text-cyan-800">{meta}</p>}
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
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <span
                className={classNames(
                  "grid size-7 shrink-0 place-items-center rounded-md text-xs font-black",
                  selected ? "bg-white text-slate-950" : "bg-slate-100 text-slate-600",
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
  );
}

function CertificateView({ percentage, totalScore }: { percentage: number; totalScore: number }) {
  const [certificateNotice, setCertificateNotice] = useState("Certificate is ready for secure download.");
  const verificationLink = "http://localhost:3001/verify/SME-2026-000142";

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">Certificate status</p>
        <p className="mt-1 text-sm leading-6 text-emerald-800">{certificateNotice}</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-7">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-8">
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
              <p className="mt-1 text-xl font-semibold text-slate-500">MAXHUB Certified Educator (Passed)</p>
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
              className="grid size-20 place-items-center rounded-lg border border-slate-300 bg-white transition hover:bg-slate-50"
              aria-label="Verify certificate SME-2026-000142"
            >
              <QrCode size={48} />
            </Link>
          </div>
          <div className="mt-7 h-2 rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-red-500" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
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
          />
          <CertificateTemplatePreview
            title="Certified Educator Passed"
            src="/brand/certificate-certified-template.jpg"
          />
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

function CertificateTemplatePreview({ title, src }: { title: string; src: string }) {
  return (
    <div className="min-w-[82%] snap-start overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:min-w-[420px] md:min-w-0">
      <Image src={src} alt={title} width={1280} height={905} className="aspect-[1280/905] w-full object-cover" />
      <div className="p-3">
        <p className="text-sm font-black text-slate-950">{title}</p>
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
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-xl font-black">Recommended Learning Modules</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ActionTile icon={BookOpenCheck} title="Smart Quiz Review" label="20 minutes" />
          <ActionTile icon={TabletSmartphone} title="Hybrid Learning Lab" label="35 minutes" />
          <ActionTile icon={Gauge} title="Lesson Analytics" label="25 minutes" />
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

  function publishPack(packName: string) {
    setPublishedPack(packName);
    setPackStatuses((current) =>
      Object.fromEntries(
        Object.keys(current).map((name) => [name, name === packName ? "Published" : current[name] === "Published" ? "Archived" : current[name]]),
      ),
    );
    setPackLog(`${packName} has been published as the active assessment pack.`);
  }

  function addQuestion() {
    setQuestionCount((count) => count + 1);
    setPackLog("New MCQ question added to the draft question bank.");
  }

  function importPack() {
    setQuestionCount((count) => count + 24);
    setPackLog("Excel import validated: 24 questions staged for review.");
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
        <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Question Bank</p>
              <h2 className="text-xl font-bold">Assessment Packs</h2>
            </div>
            <button className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white" aria-label="Upload pack">
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

        <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
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

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <QuestionEditor onSave={addQuestion} />
        <ImportPreview onConfirm={importPack} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <AuditLog />
        <NotificationsPanel />
      </section>
    </div>
  );
}

function QuestionEditor({ onSave }: { onSave: () => void }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <FileText className="text-slate-500" size={24} />
        <div>
          <p className="text-sm font-semibold text-slate-500">Question Bank Editor</p>
          <h2 className="text-xl font-black">Create Assessment Item</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm" defaultValue="Which EasiClass tool generates a quiz from lesson content?" />
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm">
            <option>single-choice</option>
            <option>hotspot</option>
            <option>step-order</option>
            <option>scenario-choice</option>
          </select>
          <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm">
            <option>Smart Quiz</option>
            <option>AI Courseware</option>
            <option>Lesson Analytics</option>
          </select>
          <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm" defaultValue="4 marks" />
        </div>
      </div>
      {saved && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Question saved to draft pack.</p>}
      <button
        onClick={() => {
          onSave();
          setSaved(true);
        }}
        className="mt-4 h-11 w-full rounded-lg bg-slate-950 text-sm font-black text-white"
      >
        Save question
      </button>
    </div>
  );
}

function ImportPreview({ onConfirm }: { onConfirm: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <Upload className="text-slate-500" size={24} />
        <div>
          <p className="text-sm font-semibold text-slate-500">Excel / CSV Import Preview</p>
          <h2 className="text-xl font-black">Validate Content Pack</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <AdminMetric icon={CheckCircle2} label="Valid Rows" value="24" />
        <AdminMetric icon={ShieldCheck} label="Warnings" value="3" />
        <AdminMetric icon={XCircle} label="Errors" value="1" />
      </div>
      <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-800">
        Row 18 missing competency mapping. Admin can fix before publishing.
      </div>
      {confirmed && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Import confirmed and staged for review.</p>}
      <button
        onClick={() => {
          onConfirm();
          setConfirmed(true);
        }}
        className="mt-4 h-11 w-full rounded-lg bg-slate-950 text-sm font-black text-white"
      >
        Confirm import
      </button>
    </div>
  );
}

function AuditLog() {
  const logs = [
    "Super Admin published Sabah Pilot Certification v1.0",
    "Rubric changed: Section B partial scoring enabled",
    "Certificate SME-2026-000142 issued to Nur Aina Abdullah",
    "Retake Pack archived for audit history",
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="text-xl font-black">Audit Log</h2>
      <div className="mt-4 space-y-3">
        {logs.map((log) => (
          <div key={log} className="flex gap-3 rounded-lg bg-slate-50 p-3">
            <ListChecks className="shrink-0 text-slate-500" size={20} />
            <p className="text-sm font-semibold text-slate-700">{log}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [notice, setNotice] = useState("No recent notifications.");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <Bell className="text-slate-500" size={22} />
        <h2 className="text-xl font-black">Notifications</h2>
      </div>
      <p className="mt-2 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{notice}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button onClick={() => setNotice("Exam completion email sent to candidate.")} className="rounded-lg bg-slate-950 p-3 text-sm font-bold text-white">
          Exam email
        </button>
        <button onClick={() => setNotice("Certificate issued notification sent to school admin.")} className="rounded-lg bg-slate-950 p-3 text-sm font-bold text-white">
          Certificate email
        </button>
        <button onClick={() => setNotice("Retake reminder scheduled for 19 Jun 2026.")} className="rounded-lg bg-slate-950 p-3 text-sm font-bold text-white">
          Retake reminder
        </button>
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
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-xl font-bold">Teacher Progress</h2>
        <div className="mt-4 space-y-3">
          {teacherRows.map(([name, status, detail]) => (
            <button
              key={name}
              onClick={() => setSelectedTeacher(name)}
              className={classNames(
                "flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left",
                selectedTeacher === name ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-950",
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
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <p className="text-sm font-semibold text-slate-500">Selected Teacher</p>
        <h2 className="mt-1 text-xl font-bold">{teacherDetail[0]}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{teacherDetail[3]}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => setSchoolAction(`Intervention note generated for ${teacherDetail[0]}.`)}
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
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
      </section>
      <CompetencyPanel title="School Weak Areas" />
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-xl font-bold">School Certification Workflow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatusStep title="Identify" detail="Find weak competencies" done />
          <StatusStep title="Intervene" detail="Assign PLC module" done={schoolAction.includes("PLC")} />
          <StatusStep title="Remind" detail="Notify teacher" done={schoolAction.includes("Reminder")} />
          <StatusStep title="Report" detail="Export principal report" done={false} />
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
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">School Comparison</h2>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {ppdModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setDistrictMode(mode)}
                className={classNames(
                  "h-9 rounded-md px-2 text-xs font-bold",
                  districtMode === mode ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
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
                selectedSchool === school.label ? "bg-slate-950 text-white" : "bg-white",
              )}
            >
              <ProgressRow label={school.label} meta={`${school.teachers} teachers`} value={school.pass} />
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <p className="text-sm font-semibold text-slate-500">Selected School</p>
        <h2 className="mt-1 text-xl font-bold">{selectedSchool}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Recommended district action based on current mode: {districtMode}.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => setPpdAction(`District PLC scheduled for ${selectedSchool}.`)}
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
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
      <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">PPD Performance</h2>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {reportScopes.map((scope) => (
              <button
                key={scope}
                onClick={() => setReportScope(scope)}
                className={classNames(
                  "h-9 rounded-md px-2 text-xs font-bold",
                  reportScope === scope ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
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
      </section>
      <CompetencyPanel title="State Competency Gap" />
      <SabahMapVisual />
      <section className="grid gap-3 md:grid-cols-3">
        <ActionTile icon={Map} title="Sabah Maturity Map" label="PPD ranking and school readiness layer" />
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
  return (
    <section className="rounded-2xl bg-[#071f54] p-5 text-white shadow-lg md:p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200">
          <Icon size={25} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cyan-200">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
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
        <Map className="text-slate-500" size={24} />
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
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-slate-500">{meta} · {value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-cyan-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompetencyPanel({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-4">
        {competencies.slice(2).map((item) => (
          <ProgressRow key={item.label} label={item.label} meta="competency score" value={item.value} />
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
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Icon className="text-slate-600" size={24} />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function AdminMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon className="text-slate-400" size={20} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}
