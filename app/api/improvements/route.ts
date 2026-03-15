import { NextResponse } from "next/server";
import improvements from "@/data/improvements.json";

export async function GET() {
  return NextResponse.json(improvements);
}
