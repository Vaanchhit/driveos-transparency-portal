export type HealthInputs = {
  restingHeartRate: number;
  hrv: number;
  sleepHours: number;
  sleepConsistency: number;
  activityStrain: number;
  age: number;
};

export type DriverContribution = {
  key: string;
  label: string;
  weight: number;
  risk: number;
  contribution: number;
  impact: number;
  direction: "up" | "down";
  narrative: string;
};

export type DerivedSignals = {
  recoveryScore: number;
  strainLoad: number;
  deviationFromBaseline: number;
};

export type DecisionBand = "Low" | "Medium" | "High";

export type HealthScoreResult = {
  score: number;
  probability: number;
  riskLevel: DecisionBand;
  action: string;
  summary: string;
  drivers: DriverContribution[];
  derived: DerivedSignals;
};

export type TrendPoint = {
  day: string;
  score: number;
  recovery: number;
};

export type Metrics = {
  milesDriven: number;
  edgeCases: number;
  resolved: number;
  safetyScore: number;
  modelVersion: string;
  latestUpdate: string;
  verifiedSafeMiles: number;
};

export type IncidentDetection = {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  confidence: number;
};

export type Incident = {
  id: string;
  location: string;
  scenarioType: string;
  aiDecision: string;
  resolutionStatus: "Resolved" | "Monitoring" | "Investigating";
  date: string;
  summary: string;
  impact: string;
  sensorHealth: string;
  detections: IncidentDetection[];
};

export type Improvement = {
  latestFix: {
    title: string;
    accuracyGain: string;
    reduction: string;
    summary: string;
  };
  trendSeries: {
    week: string;
    edgeFrequency: number;
    resolutionRate: number;
    modelAccuracy: number;
  }[];
};
