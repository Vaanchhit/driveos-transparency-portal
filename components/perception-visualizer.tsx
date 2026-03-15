"use client";

import { Canvas } from "@react-three/fiber";
import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PerceptionVisualizer() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">AI Perception Visualizer</p>
            <CardTitle className="mt-2 text-2xl">Environment Interpretation Demo</CardTitle>
          </div>
          <p className="max-w-xl text-sm text-slate-400">
            Simple Three.js scene showing how DriveOS segments nearby actors before planning and control layers act.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="perception">
          <TabsList>
            <TabsTrigger value="raw">Raw Camera Feed</TabsTrigger>
            <TabsTrigger value="perception">AI Perception Layer</TabsTrigger>
          </TabsList>
          <TabsContent value="raw">
            <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,171,84,0.25),_transparent_18%),linear-gradient(180deg,_rgba(255,178,74,0.18)_0%,_rgba(16,26,43,0.86)_26%,_rgba(4,10,18,1)_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,transparent_0%,rgba(8,15,27,0.28)_18%,rgba(7,12,22,0.96)_100%)]" />
              <div className="absolute left-1/2 top-[48%] h-[52%] w-[2px] -translate-x-1/2 bg-white/25" />
              <div className="absolute bottom-0 left-[36%] h-[44%] w-[2px] -rotate-[20deg] bg-white/20" />
              <div className="absolute bottom-0 right-[34%] h-[44%] w-[2px] rotate-[20deg] bg-white/20" />
              <div className="absolute left-[24%] top-[32%] h-[30%] w-[12%] rounded-2xl bg-slate-300/10 blur-[2px]" />
              <div className="absolute right-[22%] top-[36%] h-[18%] w-[7%] rounded-2xl bg-slate-300/10 blur-[1px]" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Raw camera stream
              </div>
            </div>
          </TabsContent>
          <TabsContent value="perception">
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950">
                <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
                  <color attach="background" args={["#07111f"]} />
                  <ambientLight intensity={1.1} />
                  <directionalLight position={[4, 8, 3]} intensity={1.8} color="#9fdcff" />
                  <RoadScene />
                </Canvas>
                <div className="pointer-events-none absolute inset-0">
                  <OverlayBox label="CAR" style={{ left: "19%", top: "48%", width: "18%", height: "23%" }} />
                  <OverlayBox
                    label="PEDESTRIAN"
                    style={{ left: "48%", top: "41%", width: "10%", height: "25%" }}
                  />
                  <OverlayBox label="BIKE" style={{ left: "67%", top: "47%", width: "13%", height: "19%" }} />
                  <OverlayBox
                    label="UNKNOWN OBJECT"
                    style={{ left: "79%", top: "36%", width: "9%", height: "22%" }}
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Scene Confidence</p>
                  <div className="mt-3 space-y-3">
                    <SceneRow label="Vehicle cluster" value="98.4%" />
                    <SceneRow label="Pedestrian intent" value="93.1%" />
                    <SceneRow label="Bike trajectory" value="88.7%" />
                    <SceneRow label="Unknown object classification" value="61.0%" />
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Detected Labels</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>CAR</Badge>
                    <Badge>PEDESTRIAN</Badge>
                    <Badge>BIKE</Badge>
                    <Badge variant="warning">UNKNOWN OBJECT</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Bounding boxes and confidence estimates are projected over the rendered scene to mirror the perception layer.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RoadScene() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#101a2b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.79, 0]}>
        <planeGeometry args={[6.2, 24]} />
        <meshStandardMaterial color="#1b273a" />
      </mesh>
      {[-8, -4, 0, 4, 8].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.77, z]}>
          <planeGeometry args={[0.2, 2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <Actor position={[-1.8, -0.15, 2]} color="#38bdf8" scale={[1.3, 0.7, 2.8]} />
      <Actor position={[2.2, -0.3, 0]} color="#34d399" scale={[0.5, 1.1, 0.5]} />
      <Actor position={[3.6, -0.35, 2.2]} color="#fbbf24" scale={[0.5, 0.7, 1.1]} />
      <Actor position={[5.1, -0.12, -0.4]} color="#f472b6" scale={[0.75, 0.75, 0.75]} />
    </group>
  );
}

function Actor({
  position,
  color,
  scale
}: {
  position: [number, number, number];
  color: string;
  scale: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} />
    </mesh>
  );
}

function OverlayBox({
  label,
  style
}: {
  label: string;
  style: CSSProperties;
}) {
  return (
    <div className="absolute rounded-xl border-2 border-cyan-300 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" style={style}>
      <span className="absolute -top-7 left-0 rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950">
        {label}
      </span>
    </div>
  );
}

function SceneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-medium text-cyan-200">{value}</span>
    </div>
  );
}
