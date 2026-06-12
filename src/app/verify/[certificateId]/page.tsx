import Link from "next/link";
import { Award, CheckCircle2, FileBadge, QrCode, ShieldAlert } from "lucide-react";
import { findCertificate } from "@/lib/certificates";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const certificate = findCertificate(certificateId);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-5 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg bg-slate-950 p-5 text-white md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Certificate Verification</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                MAXHUB EasiClass
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Public verification page for Sabah educator certification records.
              </p>
            </div>
            <QrCode className="shrink-0 text-cyan-200" size={38} />
          </div>

          <div className="mt-8 rounded-lg bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
              Certificate ID
            </p>
            <p className="mt-2 break-all text-2xl font-black">{certificateId}</p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-slate-950"
          >
            Back to platform
          </Link>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-7">
          {certificate ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Verified Certificate</p>
                  <h2 className="text-2xl font-black tracking-tight">Valid Record</h2>
                </div>
              </div>

              <div className="mt-7 border-y border-slate-200 py-6">
                <p className="text-sm font-semibold text-slate-500">Candidate</p>
                <h3 className="mt-2 text-2xl font-bold">{certificate.candidateName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {certificate.school} · {certificate.ppd}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Meta label="Achievement" value={certificate.achievementLevel} icon={Award} />
                <Meta label="Score" value={`${certificate.score}/${certificate.totalScore}`} icon={FileBadge} />
                <Meta label="Percentage" value={`${certificate.percentage}%`} icon={CheckCircle2} />
                <Meta label="Valid Until" value={certificate.validUntil} icon={QrCode} />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-lg bg-rose-100 text-rose-700">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-700">Record Not Found</p>
                  <h2 className="text-2xl font-black tracking-tight">Unable to verify</h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-slate-600">
                This certificate ID is not available in the current verification records. Check
                the ID and try again, or contact the certification administrator.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Meta({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Award;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-slate-500" size={21} />
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
