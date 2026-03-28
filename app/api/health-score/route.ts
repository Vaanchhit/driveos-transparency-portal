import { NextResponse } from "next/server";
import { computeHealthScore } from "@/lib/health-score";
import type { HealthInputs } from "@/lib/types";

const defaultPayload: HealthInputs = {
  restingHeartRate: 62,
  hrv: 58,
  sleepHours: 6.8,
  sleepConsistency: 74,
  activityStrain: 6,
  age: 37
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<HealthInputs>;

  const inputs: HealthInputs = {
    restingHeartRate: Number(body.restingHeartRate ?? defaultPayload.restingHeartRate),
    hrv: Number(body.hrv ?? defaultPayload.hrv),
    sleepHours: Number(body.sleepHours ?? defaultPayload.sleepHours),
    sleepConsistency: Number(body.sleepConsistency ?? defaultPayload.sleepConsistency),
    activityStrain: Number(body.activityStrain ?? defaultPayload.activityStrain),
    age: Number(body.age ?? defaultPayload.age)
  };

  return NextResponse.json({
    input: inputs,
    result: computeHealthScore(inputs)
  });
}
