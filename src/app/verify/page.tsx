"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { findCertificate } from "@/lib/certificates";

export default function VerifySearchPage() {
  const [certificateId, setCertificateId] = useState("SME-2026-000142");
  const [searchedId, setSearchedId] = useState("SME-2026-000142");
  const certificate = findCertificate(searchedId);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-lg bg-slate-950 p-5 text-white md:p-7">
          <p className="text-sm font-semibold text-cyan-200">Public Verification</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Verify MAXHUB Certificate</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Enter a certificate ID to validate candidate name, achievement level, issue date, and status.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Certificate ID</span>
            <input
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-950"
            />
          </label>
          <button
            onClick={() => setSearchedId(certificateId)}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white"
          >
            <Search size={18} />
            Search certificate
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          {certificate ? (
            <div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={32} />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Verified</p>
                  <h2 className="text-2xl font-black">{certificate.candidateName}</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Info label="Achievement" value={certificate.achievementLevel} />
                <Info label="School" value={certificate.school} />
                <Info label="Issued" value={certificate.issuedAt} />
                <Info label="Valid Until" value={certificate.validUntil} />
              </div>
              <Link href={`/verify/${certificate.certificateId}`} className="mt-5 inline-flex h-11 items-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">
                Open full verification page
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-600" size={32} />
              <div>
                <p className="text-sm font-bold text-rose-700">Not found</p>
                <p className="text-sm text-slate-600">No certificate record found for {searchedId}.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
