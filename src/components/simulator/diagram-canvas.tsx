"use client";

import { useRef, useState, type WheelEvent, type MouseEvent } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { EngineSnapshot } from "@dm-sheffield/simulator";
import type { ScenarioLayout } from "./scenario-layouts";
import {
  VesselSymbol,
  PumpSymbol,
  ValveSymbol,
  InstrumentBubble,
  ControllerBox,
  FlowLine,
} from "./symbols";

const instrumentUnit = (measures: string) => {
  if (measures.endsWith(".level")) return "%";
  if (measures.endsWith(".pressure")) return " bar";
  if (measures.endsWith(".flow")) return " m³/h";
  return "";
};

/** Level readings are stored as a 0-1 fraction; display as a percentage. */
const instrumentDisplayValue = (measures: string, raw: number) =>
  measures.endsWith(".level") ? raw * 100 : raw;

export function DiagramCanvas({
  layout,
  snapshot,
  instrumentDefs,
  controllerDefs,
  selectedTag,
  onSymbolClick,
}: {
  layout: ScenarioLayout;
  snapshot: EngineSnapshot;
  instrumentDefs: { tag: string; measures: string }[];
  controllerDefs: { tag: string; mode: "auto" | "manual"; sp: number }[];
  selectedTag: string | null;
  onSymbolClick: (tag: string) => void;
}) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const faultedInstruments = new Set(snapshot.faultedInstrumentTags);

  function handleWheel(e: WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const next = Math.min(2.5, Math.max(0.5, scale - e.deltaY * 0.001));
    setScale(next);
  }

  function handleMouseDown(e: MouseEvent<SVGSVGElement>) {
    dragging.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setPan({ x: dragging.current.panX + dx, y: dragging.current.panY + dy });
  }
  function handleMouseUp() {
    dragging.current = null;
  }

  return (
    <div className="relative rounded-lg border border-border bg-white">
      <div className="absolute right-3 top-3 z-10 flex gap-1">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
          className="rounded-md border border-border bg-white p-1.5 hover:bg-blue-50"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          className="rounded-md border border-border bg-white p-1.5 hover:bg-blue-50"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className="rounded-md border border-border bg-white p-1.5 hover:bg-blue-50"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <svg
        viewBox={layout.viewBox}
        className="h-[360px] w-full touch-none select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {Object.entries(layout.lines).map(([connId, line]) => (
            <FlowLine key={connId} {...line} flowing={(snapshot.connectionFlows[connId] ?? 0) > 0.05} />
          ))}

          {Object.entries(layout.equipment).map(([tag, pos]) => {
            const eq = snapshot.equipment[tag];
            if (!eq) return null;
            if (eq.type === "vessel") {
              return (
                <VesselSymbol
                  key={tag}
                  x={pos.x}
                  y={pos.y}
                  tag={tag}
                  label={eq.label}
                  level={eq.level}
                  selected={selectedTag === tag}
                  onClick={() => onSymbolClick(tag)}
                />
              );
            }
            if (eq.type === "pump") {
              return (
                <PumpSymbol
                  key={tag}
                  x={pos.x}
                  y={pos.y}
                  tag={tag}
                  state={eq.state}
                  selected={selectedTag === tag}
                  onClick={() => onSymbolClick(tag)}
                />
              );
            }
            return (
              <ValveSymbol
                key={tag}
                x={pos.x}
                y={pos.y}
                tag={tag}
                kind={eq.type}
                position={eq.position}
                mode={eq.type === "control_valve" ? eq.mode : undefined}
                stuck={eq.stuck}
                selected={selectedTag === tag}
                onClick={() => onSymbolClick(tag)}
              />
            );
          })}

          {controllerDefs.map((c) => {
            const pos = layout.controllers?.[c.tag];
            if (!pos) return null;
            return (
              <ControllerBox
                key={c.tag}
                x={pos.x}
                y={pos.y}
                tag={c.tag}
                mode={c.mode}
                sp={c.sp}
                selected={selectedTag === c.tag}
                onClick={() => onSymbolClick(c.tag)}
              />
            );
          })}

          {instrumentDefs.map((inst) => {
            const pos = layout.instruments[inst.tag];
            if (!pos) return null;
            return (
              <InstrumentBubble
                key={inst.tag}
                x={pos.x}
                y={pos.y}
                tag={inst.tag}
                value={instrumentDisplayValue(inst.measures, snapshot.instrumentReadings[inst.tag] ?? 0)}
                unit={instrumentUnit(inst.measures)}
                fault={faultedInstruments.has(inst.tag)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
