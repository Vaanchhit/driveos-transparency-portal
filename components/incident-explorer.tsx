"use client";

import type { ComponentType } from "react";
import { MapPin, Radar, ShieldCheck, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Incident } from "@/lib/types";

const statusVariantMap: Record<Incident["resolutionStatus"], "success" | "warning" | "danger"> = {
  Resolved: "success",
  Monitoring: "warning",
  Investigating: "danger"
};

export function IncidentExplorer({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Incident Explorer</p>
            <CardTitle className="mt-2 text-2xl">Edge-case Event Log</CardTitle>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Public trace of critical edge cases, their AI decisions, and the remediation state of the autonomy stack.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Scenario Type</TableHead>
                <TableHead>AI Decision</TableHead>
                <TableHead>Resolution Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Detail View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>{incident.scenarioType}</TableCell>
                  <TableCell>{incident.aiDecision}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[incident.resolutionStatus]}>
                      {incident.resolutionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(incident.date).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Open Incident
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[92vh] overflow-hidden p-0">
                        <div className="grid max-h-[92vh] gap-0 overflow-hidden lg:grid-cols-[1.25fr_0.75fr]">
                          <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
                            <DialogHeader>
                              <DialogTitle>{incident.id}</DialogTitle>
                              <DialogDescription>{incident.summary}</DialogDescription>
                            </DialogHeader>
                            <IncidentFrame incident={incident} />
                          </div>
                          <ScrollArea className="h-[92vh]">
                            <div className="space-y-5 p-6">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <InfoTile icon={MapPin} label="Location" value={incident.location} />
                                <InfoTile icon={ShieldCheck} label="Decision" value={incident.aiDecision} />
                                <InfoTile icon={Radar} label="Resolution" value={incident.resolutionStatus} />
                                <InfoTile icon={WandSparkles} label="Scenario" value={incident.scenarioType} />
                              </div>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="font-[family-name:var(--font-display)] text-lg">Sensor Notes</h4>
                                <p className="text-sm leading-6 text-slate-300">{incident.sensorHealth}</p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-[family-name:var(--font-display)] text-lg">Operational Impact</h4>
                                <p className="text-sm leading-6 text-slate-300">{incident.impact}</p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-[family-name:var(--font-display)] text-lg">Detected Objects</h4>
                                <div className="flex flex-wrap gap-2">
                                  {incident.detections.map((detection) => (
                                    <Badge key={`${incident.id}-${detection.label}-${detection.left}`}>
                                      {detection.label} {(detection.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function IncidentFrame({ incident }: { incident: Incident }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
        <Badge variant="muted">Camera Frame Visualization</Badge>
        <Badge variant="muted">Sensor Overlay</Badge>
        <Badge variant="muted">Object Labels</Badge>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,184,77,0.18),_transparent_18%),linear-gradient(180deg,_rgba(255,174,82,0.12)_0%,_rgba(13,24,42,0.94)_28%,_rgba(4,10,18,1)_100%)]">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(11,20,36,0.34)_22%,rgba(7,12,22,0.92)_100%)]" />
        <div className="absolute left-1/2 top-[58%] h-[48%] w-[2px] -translate-x-1/2 bg-white/30" />
        <div className="absolute bottom-0 left-[34%] h-[36%] w-[2px] -rotate-[22deg] bg-white/20" />
        <div className="absolute bottom-0 right-[32%] h-[36%] w-[2px] rotate-[22deg] bg-white/20" />
        <div className="absolute left-[18%] top-[24%] h-[46%] w-[18%] rounded-[14px] border border-cyan-200/30 bg-cyan-200/5" />
        <div className="absolute right-[14%] top-[30%] h-[32%] w-[10%] rounded-[14px] border border-emerald-200/30 bg-emerald-200/5" />
        {incident.detections.map((detection) => (
          <div
            key={`${incident.id}-${detection.label}-${detection.left}`}
            className="absolute rounded-xl border-2 border-cyan-300 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
            style={{
              left: `${detection.left}%`,
              top: `${detection.top}%`,
              width: `${detection.width}%`,
              height: `${detection.height}%`
            }}
          >
            <span className="absolute -top-7 left-0 rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950">
              {detection.label}
            </span>
          </div>
        ))}
        <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-3">
          <TelemetryChip label="Velocity" value="24 km/h" />
          <TelemetryChip label="Brake Response" value="184 ms" />
          <TelemetryChip label="Risk Score" value="0.08" />
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 h-4 w-4 text-cyan-200" />
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm text-slate-100">{value}</div>
    </div>
  );
}

function TelemetryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-1 font-medium text-slate-100">{value}</div>
    </div>
  );
}
