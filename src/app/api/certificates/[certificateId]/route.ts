import { NextResponse } from "next/server";
import { findCertificate } from "@/lib/certificates";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  const { certificateId } = await params;
  const certificate = findCertificate(certificateId);

  if (!certificate) {
    return NextResponse.json(
      {
        status: "not-found",
        certificateId,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: "verified",
    certificate,
  });
}
