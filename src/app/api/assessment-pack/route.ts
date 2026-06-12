import { NextResponse } from "next/server";
import { sampleAssessmentPack } from "@/lib/assessment";

export function GET() {
  return NextResponse.json(sampleAssessmentPack);
}
