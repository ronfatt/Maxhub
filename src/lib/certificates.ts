export type CertificateRecord = {
  certificateId: string;
  candidateName: string;
  candidateId: string;
  school: string;
  ppd: string;
  achievementLevel: string;
  score: number;
  totalScore: number;
  percentage: number;
  issuedAt: string;
  validUntil: string;
  status: "valid" | "revoked" | "expired";
};

export const sampleCertificates: CertificateRecord[] = [
  {
    certificateId: "SME-2026-000142",
    candidateName: "Nur Aina Abdullah",
    candidateId: "SME-CAN-2026-0142",
    school: "SK Tanjung Aru",
    ppd: "Kota Kinabalu",
    achievementLevel: "MAXHUB Certified Educator",
    score: 146,
    totalScore: 180,
    percentage: 81,
    issuedAt: "2026-06-12",
    validUntil: "2028-06-12",
    status: "valid",
  },
];

export function findCertificate(certificateId: string) {
  return sampleCertificates.find(
    (certificate) =>
      certificate.certificateId.toLowerCase() === certificateId.toLowerCase(),
  );
}
