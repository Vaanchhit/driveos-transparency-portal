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
