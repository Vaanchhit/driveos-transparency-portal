import type { DriverContribution, HealthInputs, HealthScoreResult, TrendPoint } from "@/lib/types";

const DRIVER_WEIGHTS = {
  hrv: 0.25,
  sleep: 0.2,
  rhr: 0.2,
  strain: 0.15,
  consistency: 0.2
} as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function inverseLerp(value: number, low: number, high: number) {
  if (high === low) {
    return 0;
  }

  return clamp((value - low) / (high - low));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function buildNarrative(label: string, risk: number, direction: "up" | "down") {
  const intensity = risk > 0.75 ? "materially" : risk > 0.45 ? "noticeably" : "slightly";
  const effect = direction === "up" ? "raises" : "reduces";

  return `${label} ${effect} risk ${intensity}.`;
}

export function computeHealthScore(inputs: HealthInputs): HealthScoreResult {
  const recoveryScore = clamp(
    0.45 * inverseLerp(inputs.hrv, 30, 110) +
      0.35 * inverseLerp(inputs.sleepHours, 4.5, 8.8) +
      0.2 * (1 - inverseLerp(inputs.restingHeartRate, 48, 85))
  );

  const strainLoad = clamp(inputs.activityStrain / 10);
  const deviationFromBaseline = clamp(
    0.5 * Math.abs(inputs.sleepHours - 7.4) / 3 +
      0.3 * Math.abs(inputs.hrv - 68) / 40 +
      0.2 * Math.abs(inputs.restingHeartRate - 58) / 22
  );

  const driverMap: DriverContribution[] = [
    {
      key: "hrv",
      label: "Low HRV",
      weight: DRIVER_WEIGHTS.hrv,
      risk: 1 - inverseLerp(inputs.hrv, 30, 110),
      contribution: 0,
      impact: 0,
      direction: "up",
      narrative: ""
    },
    {
      key: "sleep",
      label: "Sleep deficit",
      weight: DRIVER_WEIGHTS.sleep,
      risk: clamp((7.5 - inputs.sleepHours) / 3.5),
      contribution: 0,
      impact: 0,
      direction: "up",
      narrative: ""
    },
    {
      key: "rhr",
      label: "Elevated RHR",
      weight: DRIVER_WEIGHTS.rhr,
      risk: inverseLerp(inputs.restingHeartRate, 52, 85),
      contribution: 0,
      impact: 0,
      direction: "up",
      narrative: ""
    },
    {
      key: "strain",
      label: "Strain overload",
      weight: DRIVER_WEIGHTS.strain,
      risk: clamp(strainLoad * 0.7 + deviationFromBaseline * 0.3),
      contribution: 0,
      impact: 0,
      direction: "up",
      narrative: ""
    },
    {
      key: "consistency",
      label: "Consistency drop",
      weight: DRIVER_WEIGHTS.consistency,
      risk: clamp((85 - inputs.sleepConsistency) / 45),
      contribution: 0,
      impact: 0,
      direction: "up",
      narrative: ""
    }
  ];

  const weightedRisk = driverMap.reduce((sum, driver) => sum + driver.weight * driver.risk, 0);
  const ageAdjustment = inverseLerp(inputs.age, 30, 65) * 0.08;
  const recoveryAdjustment = (0.55 - recoveryScore) * 0.22;
  const rawRisk = clamp(weightedRisk + ageAdjustment + recoveryAdjustment);
  const probability = clamp(sigmoid((rawRisk - 0.5) * 4.6));
  const score = Math.round(probability * 100);

  const drivers = driverMap
    .map((driver) => {
      const contribution = driver.weight * driver.risk;
      const impact = contribution / Math.max(rawRisk, 0.01);

      return {
        ...driver,
        contribution: round(contribution, 3),
        impact: round(impact * score, 1),
        narrative: buildNarrative(driver.label, driver.risk, driver.direction)
      };
    })
    .sort((left, right) => right.impact - left.impact);

  const riskLevel = score < 30 ? "Low" : score < 60 ? "Medium" : "High";
  const action =
    riskLevel === "Low"
      ? "Eligible for premium discount and low-touch monitoring."
      : riskLevel === "Medium"
        ? "Standard underwriting with ongoing wearable check-ins."
        : "Trigger intervention workflow and require follow-up coaching.";

  return {
    score,
    probability: round(probability, 3),
    riskLevel,
    action,
    summary:
      riskLevel === "Low"
        ? "Stable recovery signals and manageable strain indicate low near-term fatigue risk."
        : riskLevel === "Medium"
          ? "Mixed recovery markers suggest moderate fatigue or injury exposure."
          : "Recovery has degraded enough that adverse-event risk is elevated.",
    drivers,
    derived: {
      recoveryScore: Math.round(recoveryScore * 100),
      strainLoad: Math.round(strainLoad * 100),
      deviationFromBaseline: Math.round(deviationFromBaseline * 100)
    }
  };
}

export function buildTrendSeries(inputs: HealthInputs): TrendPoint[] {
  const offsets = [
    { day: "D-6", hrv: -8, sleep: -0.8, rhr: 4, strain: 2, consistency: -10 },
    { day: "D-5", hrv: -5, sleep: -0.5, rhr: 2, strain: 1, consistency: -7 },
    { day: "D-4", hrv: -2, sleep: -0.2, rhr: 1, strain: 0, consistency: -4 },
    { day: "D-3", hrv: 1, sleep: 0.2, rhr: 0, strain: -1, consistency: -2 },
    { day: "D-2", hrv: 3, sleep: 0.1, rhr: -1, strain: -1, consistency: 0 },
    { day: "D-1", hrv: 2, sleep: 0.3, rhr: -2, strain: 0, consistency: 1 },
    { day: "Today", hrv: 0, sleep: 0, rhr: 0, strain: 0, consistency: 0 }
  ];

  return offsets.map((offset) => {
    const result = computeHealthScore({
      ...inputs,
      hrv: clamp(inputs.hrv + offset.hrv, 20, 130),
      sleepHours: clamp(inputs.sleepHours + offset.sleep, 3.5, 10),
      restingHeartRate: clamp(inputs.restingHeartRate + offset.rhr, 40, 95),
      activityStrain: clamp(inputs.activityStrain + offset.strain, 1, 10),
      sleepConsistency: clamp(inputs.sleepConsistency + offset.consistency, 40, 100)
    });

    return {
      day: offset.day,
      score: result.score,
      recovery: result.derived.recoveryScore
    };
  });
}

export function runWhatIfScenario(
  inputs: HealthInputs,
  changes: Partial<Pick<HealthInputs, "sleepHours" | "restingHeartRate" | "hrv" | "sleepConsistency">>
) {
  return computeHealthScore({
    ...inputs,
    ...changes
  });
}
