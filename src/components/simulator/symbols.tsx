"use client";

/**
 * Minimal, reusable SVG P&ID symbol set (simplified, ISA-5.1-inspired — not a
 * licensed symbol library, see docs/SIMULATOR.md). Each symbol is self
 * contained around a centre point so the scenario layout only needs to
 * supply {x, y}.
 */
import { cn } from "@/lib/cn";

export function VesselSymbol({
  x,
  y,
  tag,
  label,
  level,
  width = 70,
  height = 120,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  tag: string;
  label?: string;
  level: number;
  width?: number;
  height?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const top = y - height / 2;
  const left = x - width / 2;
  const liquidHeight = Math.max(0, Math.min(1, level)) * (height - 8);
  return (
    <g
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(onClick && "cursor-pointer")}
    >
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={10}
        fill="white"
        stroke={selected ? "#1f5fae" : "#10233f"}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <rect
        x={left + 4}
        y={top + height - 4 - liquidHeight}
        width={width - 8}
        height={liquidHeight}
        rx={6}
        fill="#eaf2fb"
      />
      <text x={x} y={top - 8} textAnchor="middle" className="font-tag" fontSize={11} fill="#10233f">
        {tag}
      </text>
      <text x={x} y={top + height + 14} textAnchor="middle" fontSize={10} fill="#5b6b81">
        {label}
      </text>
      <text x={x} y={top + height / 2 + 4} textAnchor="middle" className="font-tag" fontSize={11} fill="#10233f">
        {Math.round(level * 100)}%
      </text>
    </g>
  );
}

export function PumpSymbol({
  x,
  y,
  tag,
  state,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  tag: string;
  state: "on" | "off" | "tripped";
  selected?: boolean;
  onClick?: () => void;
}) {
  const color = state === "tripped" ? "#b3261e" : state === "on" ? "#1f7a4d" : "#5b6b81";
  return (
    <g onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} className="cursor-pointer">
      <circle cx={x} cy={y} r={22} fill="white" stroke={selected ? "#1f5fae" : "#10233f"} strokeWidth={selected ? 2.5 : 1.5} />
      <path d={`M ${x - 10} ${y + 9} L ${x - 10} ${y - 9} L ${x + 10} ${y} Z`} fill={color} />
      <text x={x} y={y - 30} textAnchor="middle" className="font-tag" fontSize={11} fill="#10233f">
        {tag}
      </text>
      <text x={x} y={y + 36} textAnchor="middle" fontSize={10} fontWeight={600} fill={color}>
        {state.toUpperCase()}
      </text>
    </g>
  );
}

export function ValveSymbol({
  x,
  y,
  tag,
  position,
  kind,
  mode,
  stuck,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  tag: string;
  position: number;
  kind: "manual_valve" | "control_valve";
  mode?: "auto" | "manual";
  stuck?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const open = position > 0.05;
  const fill = stuck ? "#fdf3e0" : open ? "#eaf2fb" : "white";
  const stroke = stuck ? "#c98a12" : "#10233f";
  const size = 14;
  return (
    <g onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} className="cursor-pointer">
      <path
        d={`M ${x - size} ${y - size} L ${x} ${y} L ${x - size} ${y + size} Z M ${x + size} ${y - size} L ${x} ${y} L ${x + size} ${y + size} Z`}
        fill={fill}
        stroke={selected ? "#1f5fae" : stroke}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      {kind === "control_valve" ? (
        <rect x={x - 7} y={y - size - 18} width={14} height={14} fill="white" stroke="#10233f" strokeWidth={1.2} />
      ) : null}
      <text x={x} y={y - size - 24} textAnchor="middle" className="font-tag" fontSize={10} fill="#10233f">
        {tag}
      </text>
      <text x={x} y={y + size + 16} textAnchor="middle" fontSize={9} fill="#5b6b81">
        {open ? `${Math.round(position * 100)}% open` : "closed"}
        {mode ? ` · ${mode.toUpperCase()}` : ""}
      </text>
    </g>
  );
}

export function InstrumentBubble({
  x,
  y,
  tag,
  value,
  unit,
  fault,
}: {
  x: number;
  y: number;
  tag: string;
  value: number;
  unit: string;
  fault?: boolean;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={20} fill={fault ? "#fbeceb" : "white"} stroke={fault ? "#b3261e" : "#1f5fae"} strokeWidth={1.5} />
      <text x={x} y={y - 4} textAnchor="middle" className="font-tag" fontSize={9} fill="#10233f">
        {tag}
      </text>
      <text x={x} y={y + 9} textAnchor="middle" className="font-tag" fontSize={10} fontWeight={600} fill="#10233f">
        {value.toFixed(1)}
        {unit}
      </text>
    </g>
  );
}

export function ControllerBox({
  x,
  y,
  tag,
  mode,
  sp,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  tag: string;
  mode: "auto" | "manual";
  sp: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <g onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} className={onClick ? "cursor-pointer" : undefined}>
      <rect x={x - 32} y={y - 18} width={64} height={36} rx={6} fill="white" stroke={selected ? "#1f5fae" : "#10233f"} strokeWidth={selected ? 2.5 : 1.5} />
      <text x={x} y={y - 4} textAnchor="middle" className="font-tag" fontSize={10} fill="#10233f">
        {tag}
      </text>
      <text x={x} y={y + 11} textAnchor="middle" fontSize={9} fill="#5b6b81">
        {mode.toUpperCase()} · SP {Math.round(sp * 100)}%
      </text>
    </g>
  );
}

export function FlowLine({
  x1,
  y1,
  x2,
  y2,
  flowing,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  flowing: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={flowing ? "#1f5fae" : "#dce4ee"}
      strokeWidth={flowing ? 3 : 2}
      strokeDasharray={flowing ? undefined : "4 3"}
    />
  );
}
