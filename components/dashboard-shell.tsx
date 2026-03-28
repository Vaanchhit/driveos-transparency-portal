"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Mic,
  MicOff,
  HeartPulse,
  MoonStar,
  Radar,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeHealthScore, buildTrendSeries, runWhatIfScenario } from "@/lib/health-score";
import { cn, formatPercent } from "@/lib/utils";
import type { HealthInputs } from "@/lib/types";

const defaultInputs: HealthInputs = {
  restingHeartRate: 64,
  hrv: 52,
  sleepHours: 6.3,
  sleepConsistency: 71,
  activityStrain: 7,
  age: 36
};

const controlConfig = [
  {
    key: "restingHeartRate",
    label: "Resting Heart Rate",
    helper: "Higher RHR implies weaker recovery.",
    min: 40,
    max: 95,
    step: 1,
    suffix: "bpm"
  },
  {
    key: "hrv",
    label: "HRV",
    helper: "Low variability is a strong fatigue signal.",
    min: 20,
    max: 120,
    step: 1,
    suffix: "ms"
  },
  {
    key: "sleepHours",
    label: "Sleep Hours",
    helper: "Sleep deficit pushes the score up quickly.",
    min: 3.5,
    max: 10,
    step: 0.1,
    suffix: "hrs"
  },
  {
    key: "sleepConsistency",
    label: "Sleep Consistency",
    helper: "Consistency measures routine stability versus baseline.",
    min: 40,
    max: 100,
    step: 1,
    suffix: "%"
  },
  {
    key: "activityStrain",
    label: "Activity Strain",
    helper: "Proxy for acute load relative to personal baseline.",
    min: 1,
    max: 10,
    step: 1,
    suffix: "/10"
  },
  {
    key: "age",
    label: "Age",
    helper: "Used only as a minor adjustment.",
    min: 18,
    max: 75,
    step: 1,
    suffix: "yrs"
  }
] as const;

const voiceFieldConfig = [
  {
    key: "restingHeartRate",
    label: "Resting Heart Rate",
    min: 40,
    max: 95,
    step: 1,
    aliases: ["resting heart rate", "heart rate", "r h r", "rhr"]
  },
  {
    key: "hrv",
    label: "HRV",
    min: 20,
    max: 120,
    step: 1,
    aliases: ["h r v", "hrv", "variability"]
  },
  {
    key: "sleepHours",
    label: "Sleep Hours",
    min: 3.5,
    max: 10,
    step: 0.1,
    aliases: ["sleep hours", "sleep", "hours slept"]
  },
  {
    key: "sleepConsistency",
    label: "Sleep Consistency",
    min: 40,
    max: 100,
    step: 1,
    aliases: ["sleep consistency", "consistency"]
  },
  {
    key: "activityStrain",
    label: "Activity Strain",
    min: 1,
    max: 10,
    step: 1,
    aliases: ["activity strain", "strain", "load"]
  },
  {
    key: "age",
    label: "Age",
    min: 18,
    max: 75,
    step: 1,
    aliases: ["age"]
  }
] as const;

type SupportedSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionConstructor = new () => SupportedSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function DashboardShell() {
  const [inputs, setInputs] = useState<HealthInputs>(defaultInputs);
  const [scenarioMode, setScenarioMode] = useState<"sleep" | "cardio">("sleep");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState("Try saying: resting heart rate 58, HRV 62, sleep hours 7.5");
  const recognitionRef = useRef<SupportedSpeechRecognition | null>(null);

  const result = useMemo(() => computeHealthScore(inputs), [inputs]);
  const trendSeries = useMemo(() => buildTrendSeries(inputs), [inputs]);
  const scenarioResult = useMemo(
    () =>
      scenarioMode === "sleep"
        ? runWhatIfScenario(inputs, { sleepHours: Math.min(inputs.sleepHours + 1, 10) })
        : runWhatIfScenario(inputs, { restingHeartRate: Math.max(inputs.restingHeartRate - 10, 40) }),
    [inputs, scenarioMode]
  );

  const topDrivers = result.drivers.slice(0, 3);
  const simulatorDelta = scenarioResult.score - result.score;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setVoiceFeedback("Speech recognition is supported in Chrome, Edge, and some Android browsers.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let nextTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0].transcript;
      }

      setTranscript((current) => {
        const prefix = event.resultIndex === 0 ? "" : `${current} `;
        return `${prefix}${nextTranscript}`.trim();
      });
      setVoiceFeedback("Transcript captured. Apply it to update the health inputs.");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceFeedback(
        event.error === "not-allowed"
          ? "Microphone permission was blocked. Allow mic access in the browser and try again."
          : `Speech recognition stopped: ${event.error}.`
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
      setVoiceFeedback("Listening stopped. You can apply the transcript or record again.");
      return;
    }

    setTranscript("");
    setVoiceFeedback("Listening for health metrics...");
    setIsListening(true);
    recognition.start();
  };

  const applyTranscript = () => {
    const parsed = parseVoiceTranscript(transcript, inputs);

    if (parsed.appliedLabels.length === 0) {
      setVoiceFeedback("I heard audio, but no supported metric/value pairs were detected.");
      return;
    }

    setInputs(parsed.nextInputs);
    setVoiceFeedback(`Applied: ${parsed.appliedLabels.join(", ")}.`);
  };

  return (
    <main className="mx-auto max-w-[1550px] px-4 py-5 md:px-6 md:py-6">
      <section className="panel-surface panel-outline relative overflow-hidden rounded-[34px] border border-white/10 px-6 py-8 shadow-panel md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,241,194,0.12),_transparent_25%),radial-gradient(circle_at_80%_20%,_rgba(255,109,77,0.16),_transparent_26%),linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_45%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="max-w-3xl">
            <Badge className="mb-5">Health Credit Score Engine</Badge>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-white md:text-6xl">
              Biometric risk scoring for insurance decisions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Prototype that converts wearable signals into a 0-100 adverse-event score, exposes the main risk drivers, and maps the result to an insurer action.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <HeroStat icon={HeartPulse} label="Current Score" value={`${result.score}/100`} />
              <HeroStat icon={ShieldCheck} label="Decision" value={result.riskLevel} />
              <HeroStat icon={Sparkles} label="Top Driver" value={topDrivers[0]?.label ?? "Stable"} />
            </div>
          </div>
          <Card className="bg-white/[0.03]">
            <CardHeader>
              <CardDescription>Mock insurer output</CardDescription>
              <CardTitle className="text-3xl text-white">{result.score}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <MetricTile label="Adverse Event Probability" value={formatPercent(result.probability * 100, 0)} />
              <MetricTile label="Recovery Score" value={`${result.derived.recoveryScore}`} />
              <MetricTile label="Strain Load" value={`${result.derived.strainLoad}`} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardDescription>Biometric input layer</CardDescription>
            <CardTitle>Signal capture and feature engineering</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            {controlConfig.map((control) => {
              const value = inputs[control.key];

              return (
                <label key={control.key} className="block">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{control.label}</p>
                      <p className="text-xs text-slate-400">{control.helper}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-100">
                      {value}
                      {control.suffix}
                    </span>
                  </div>
                  <input
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={value}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        [control.key]: Number(event.target.value)
                      }))
                    }
                  />
                </label>
              );
            })}

            <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Free speech to text</p>
                  <h3 className="mt-2 text-lg font-medium text-white">Voice-controlled metric capture</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Uses the browser&apos;s built-in speech recognition engine, so there is no paid API or hosted model required.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={toggleListening} disabled={!speechSupported}>
                    {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isListening ? "Stop recording" : "Start voice input"}
                  </Button>
                  <Button variant="outline" onClick={applyTranscript} disabled={!transcript.trim()}>
                    Apply transcript
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Live transcript</p>
                <p className="mt-3 min-h-16 text-sm leading-6 text-slate-200">
                  {transcript || "No speech captured yet."}
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{voiceFeedback}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Supported phrases</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    “resting heart rate 60”, “HRV 55”, “sleep hours 7.2”, “sleep consistency 84”, “strain 6”, “age 34”
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>Scoring and decision layer</CardDescription>
                <CardTitle>Actuarial-style health risk output</CardTitle>
              </div>
              <RiskBadge level={result.riskLevel} />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[0.88fr_1.12fr]">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Health Credit Score</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-[family-name:var(--font-display)] text-7xl leading-none text-white">
                    {result.score}
                  </span>
                  <span className="pb-2 text-slate-400">/100</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{result.summary}</p>
              </div>
              <div className="grid gap-3">
                <DecisionRow icon={ShieldCheck} label="Insurance action" value={result.action} />
                <DecisionRow
                  icon={Radar}
                  label="Deviation vs 7-day baseline"
                  value={`${result.derived.deviationFromBaseline}%`}
                />
                <DecisionRow
                  icon={MoonStar}
                  label="Why this score"
                  value={topDrivers.map((driver) => `${driver.label} (+${driver.impact})`).join(", ")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>XAI layer</CardDescription>
              <CardTitle>Top drivers behind the risk score</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {result.drivers.map((driver) => (
                <div key={driver.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{driver.label}</p>
                      <p className="text-xs text-slate-400">{driver.narrative}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      {driver.direction === "up" ? (
                        <ArrowUp className="h-4 w-4 text-rose-300" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-emerald-300" />
                      )}
                      +{driver.impact}
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${Math.min(driver.risk * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardDescription>Trend graph</CardDescription>
            <CardTitle>7-day fatigue risk trajectory</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9,17,31,0.96)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "18px"
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#6ef2ff" strokeWidth={3} dot={{ r: 4, fill: "#6ef2ff" }} />
                <Line type="monotone" dataKey="recovery" stroke="#4ade80" strokeWidth={2} strokeDasharray="6 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>What-if simulator</CardDescription>
                <CardTitle>How the score improves</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={scenarioMode === "sleep" ? "default" : "outline"}
                  onClick={() => setScenarioMode("sleep")}
                >
                  +1 hour sleep
                </Button>
                <Button
                  size="sm"
                  variant={scenarioMode === "cardio" ? "default" : "outline"}
                  onClick={() => setScenarioMode("cardio")}
                >
                  -10 bpm RHR
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-5xl text-white">{result.score}</p>
                <p className="mt-2 text-sm text-slate-400">{result.riskLevel} risk decision band</p>
              </div>
              <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Scenario</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-5xl text-white">
                  {scenarioResult.score}
                </p>
                <p className={cn("mt-2 text-sm", simulatorDelta < 0 ? "text-emerald-200" : "text-rose-200")}>
                  {simulatorDelta < 0 ? `${Math.abs(simulatorDelta)} point improvement` : `${simulatorDelta} point increase`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>API layer</CardDescription>
              <CardTitle>POST /api/health-score</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200">
{`{
  "restingHeartRate": ${inputs.restingHeartRate},
  "hrv": ${inputs.hrv},
  "sleepHours": ${inputs.sleepHours},
  "sleepConsistency": ${inputs.sleepConsistency},
  "activityStrain": ${inputs.activityStrain},
  "age": ${inputs.age}
}`}
              </pre>
              <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200">
{`{
  "score": ${result.score},
  "riskLevel": "${result.riskLevel}",
  "action": "${result.action}",
  "topDrivers": [${topDrivers.map((driver) => `"${driver.label}"`).join(", ")}]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
          <Icon className="h-4 w-4 text-cyan-200" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="text-sm font-medium text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-lg font-medium text-white">{value}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const variant = level === "Low" ? "success" : level === "Medium" ? "warning" : "danger";
  return <Badge variant={variant}>{level} Risk</Badge>;
}

function DecisionRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Stethoscope;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-200">
        <Icon className="h-4 w-4 text-cyan-200" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-sm leading-6 text-slate-400">{value}</p>
    </div>
  );
}

function parseVoiceTranscript(transcript: string, current: HealthInputs) {
  const normalizedTranscript = transcript.toLowerCase().replace(/,/g, " ");
  const nextInputs = { ...current };
  const appliedLabels: string[] = [];

  for (const field of voiceFieldConfig) {
    const aliasPattern = field.aliases.map(escapeRegExp).join("|");
    const matcher = new RegExp(`(?:${aliasPattern})\\s*(?:is|at|to|of)?\\s*(-?\\d+(?:\\.\\d+)?)`, "i");
    const match = normalizedTranscript.match(matcher);

    if (!match) {
      continue;
    }

    const value = Number(match[1]);

    if (Number.isNaN(value)) {
      continue;
    }

    nextInputs[field.key] = sanitizeVoiceValue(value, field.min, field.max, field.step);
    appliedLabels.push(field.label);
  }

  return { nextInputs, appliedLabels };
}

function sanitizeVoiceValue(value: number, min: number, max: number, step: number) {
  const clamped = Math.min(Math.max(value, min), max);
  const rounded = Math.round(clamped / step) * step;
  return Number(rounded.toFixed(step < 1 ? 1 : 0));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
