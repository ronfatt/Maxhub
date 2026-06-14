import Link from "next/link";
import Image from "next/image";
import { Award, CheckCircle2, QrCode } from "lucide-react";
import { findCertificate } from "@/lib/certificates";
import { PrintButton } from "./PrintButton";

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const certificate = findCertificate(certificateId);
  const percentage = certificate?.percentage ?? 0;
  const isPassedTemplate = percentage >= 70;
  const certificateSubtitle = isPassedTemplate
    ? "MAXHUB Certified Educator (Passed)"
    : "Digital Classroom Practitioner (Participant)";
  const templateReference = isPassedTemplate
    ? "/brand/certificate-certified-template.jpg"
    : "/brand/certificate-practitioner-template.jpg";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-slate-950 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl print:max-w-none">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link href="/" className="text-sm font-bold text-slate-600">Back to app</Link>
          <PrintButton />
        </div>

        <section className="certificate-sheet relative mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white p-7 shadow-xl print:rounded-none print:border-0 print:shadow-none md:p-10">
          <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-blue-800 via-sky-500 to-red-500" />
          <div className="absolute inset-x-12 bottom-3 h-1 bg-slate-200" />
          <div className="flex items-start justify-between gap-5 text-xs font-semibold text-slate-400">
            <span>Issued: {certificate?.issuedAt ?? "2026-06-18"}</span>
            <span>Certificate ID: {certificateId}</span>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <div className="h-12 w-36 overflow-hidden bg-white">
              <Image src="/brand/maxhub-logo.jpg" alt="MAXHUB" width={1280} height={720} className="h-full w-full object-contain object-left" />
            </div>
            <div className="text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-slate-200 bg-white">
                <Award className="text-amber-500" size={38} />
              </div>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-800">
                Ministry of Education<br />Sabah State Education Department
              </p>
            </div>
            <div className="ml-auto h-12 w-36 overflow-hidden bg-white">
              <Image src="/brand/samasama-works-logo.jpg" alt="Samasama Works" width={1280} height={720} className="h-full w-full object-contain object-right" />
            </div>
          </div>

          <div className="my-8 text-center">
            <p className="text-xl font-medium text-slate-500">This certificate is proudly presented to</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{certificate?.candidateName ?? "Certificate Not Found"}</h2>
            <p className="mt-2 text-base text-slate-500">for successfully completing the</p>
            <p className="mt-4 text-3xl font-black uppercase tracking-[0.18em] text-slate-950 md:text-4xl">Sabah MAXHUB Educator</p>
            <p className="mt-2 text-2xl font-semibold text-slate-500">{certificateSubtitle}</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-4">
            <Meta label="Certificate ID" value={certificateId} />
            <Meta label="Score" value={`${certificate?.score ?? 0}/${certificate?.totalScore ?? 180}`} />
            <Meta label="Achievement" value={`${percentage}%`} />
            <Meta label="Valid Until" value={certificate?.validUntil ?? "-"} />
          </div>

          <div className="mt-9 grid grid-cols-[1fr_auto_1fr] items-end gap-5">
            <div>
              <p className="font-serif text-3xl italic text-slate-900">Director Signature</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">JPNS / MAXHUB Certification Office</p>
            </div>
            <div className="grid place-items-center text-center">
              <div className="grid size-20 place-items-center rounded-full bg-amber-100 text-amber-700">
                <CheckCircle2 size={42} />
              </div>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-500">Authenticated</p>
            </div>
            <div className="ml-auto text-right">
              <Link href={`/verify/${certificateId}`} className="inline-grid size-28 place-items-center rounded-lg border border-slate-300 bg-white">
                <QrCode size={68} />
              </Link>
              <p className="mt-2 text-xs font-bold text-slate-500">Scan to verify</p>
              <p className="break-all text-[10px] font-semibold text-slate-400">/verify/{certificateId}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 print:hidden md:grid-cols-2">
          <Template src={templateReference} label={isPassedTemplate ? "Active: Certified Educator Passed" : "Active: Practitioner Participant"} />
          <Template src={isPassedTemplate ? "/brand/certificate-practitioner-template.jpg" : "/brand/certificate-certified-template.jpg"} label="Alternative certificate template" />
        </section>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}

function Template({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Image src={src} alt={label} width={1280} height={905} className="aspect-[1280/905] w-full object-cover" />
      <p className="p-3 text-sm font-bold text-slate-700">{label}</p>
    </div>
  );
}
