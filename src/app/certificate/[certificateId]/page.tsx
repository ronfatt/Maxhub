import Link from "next/link";
import Image from "next/image";
import { Download, QrCode } from "lucide-react";
import { findCertificate } from "@/lib/certificates";

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const certificate = findCertificate(certificateId);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-slate-950 print:bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link href="/" className="text-sm font-bold text-slate-600">Back to app</Link>
          <button className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">
            <Download size={17} />
            Print / Save PDF
          </button>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white p-7 shadow-xl print:shadow-none md:p-12">
          <div className="flex items-start justify-between gap-5 text-xs font-semibold text-slate-400">
            <span>Issued: {certificate?.issuedAt ?? "2026-06-18"}</span>
            <span>Certificate ID: {certificateId}</span>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="h-16 w-48 overflow-hidden bg-white">
              <Image src="/brand/maxhub-logo.jpg" alt="MAXHUB" width={1280} height={720} className="h-full w-full object-contain" />
            </div>
            <p className="mt-3 text-sm font-black uppercase tracking-wide text-slate-800">
              Ministry of Education<br />Sabah State Education Department
            </p>
          </div>

          <div className="my-10 border-y border-slate-300 py-8 text-center">
            <p className="text-2xl font-medium text-slate-500">This certificate is proudly presented to</p>
            <h2 className="mt-3 text-4xl font-black">{certificate?.candidateName ?? "Certificate Not Found"}</h2>
            <p className="mt-2 text-lg text-slate-500">for successfully completing the</p>
            <p className="mt-4 text-4xl font-black uppercase tracking-[0.18em] text-slate-950">Sabah MAXHUB Educator</p>
            <p className="mt-2 text-2xl font-semibold text-slate-500">{certificate?.achievementLevel} (Passed)</p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Meta label="Certificate ID" value={certificateId} />
            <Meta label="Score" value={`${certificate?.score ?? 0}/${certificate?.totalScore ?? 180}`} />
            <Meta label="Issued" value={certificate?.issuedAt ?? "-"} />
            <Meta label="Valid Until" value={certificate?.validUntil ?? "-"} />
          </div>

          <div className="mt-12 flex items-end justify-between gap-5">
            <div>
              <p className="font-serif text-3xl italic">Director Signature</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">JPNS / MAXHUB Certification Office</p>
            </div>
            <Image src="/brand/samasama-works-logo.jpg" alt="Samasama Works" width={1280} height={720} className="h-14 w-44 object-contain" />
            <div className="grid size-24 place-items-center rounded-lg border border-slate-300 bg-white">
              <QrCode size={60} />
            </div>
          </div>
          <div className="mt-10 h-2 rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-red-500" />
        </section>

        <section className="mt-5 grid gap-4 print:hidden md:grid-cols-2">
          <Template src="/brand/certificate-practitioner-template.jpg" label="Practitioner template reference" />
          <Template src="/brand/certificate-certified-template.jpg" label="Certified template reference" />
        </section>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4">
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
