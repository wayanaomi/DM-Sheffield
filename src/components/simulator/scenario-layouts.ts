export interface ScenarioLayout {
  viewBox: string;
  equipment: Record<string, { x: number; y: number }>;
  instruments: Record<string, { x: number; y: number }>;
  controllers?: Record<string, { x: number; y: number }>;
  lines: Record<string, { x1: number; y1: number; x2: number; y2: number }>;
}

export const scenarioLayouts: Record<string, ScenarioLayout> = {
  "pump-vessel-fundamentals": {
    viewBox: "0 0 520 220",
    equipment: {
      "V-101": { x: 80, y: 120 },
      "MV-101": { x: 180, y: 120 },
      "P-101": { x: 260, y: 120 },
      "MV-102": { x: 340, y: 120 },
      "V-102": { x: 440, y: 120 },
    },
    instruments: {
      "LT-101": { x: 80, y: 45 },
      "LT-102": { x: 440, y: 45 },
      "FT-101": { x: 390, y: 170 },
    },
    lines: {
      "LINE-1": { x1: 112, y1: 120, x2: 260, y2: 120 },
      "LINE-2": { x1: 260, y1: 120, x2: 408, y2: 120 },
    },
  },
  "separator-level-control": {
    viewBox: "0 0 560 220",
    equipment: {
      "MV-100": { x: 150, y: 130 },
      "V-101": { x: 300, y: 125 },
      "LV-101": { x: 440, y: 130 },
    },
    instruments: {
      "LT-101": { x: 300, y: 45 },
    },
    controllers: {
      "LIC-101": { x: 300, y: 195 },
    },
    lines: {
      "LINE-IN": { x1: 40, y1: 130, x2: 272, y2: 125 },
      "LINE-OUT": { x1: 328, y1: 125, x2: 520, y2: 130 },
    },
  },
  "hazop-loss-of-flow": {
    viewBox: "0 0 520 220",
    equipment: {
      "V-101": { x: 80, y: 120 },
      "MV-100": { x: 180, y: 120 },
      "P-101": { x: 260, y: 120 },
      "MV-101": { x: 340, y: 120 },
      "V-102": { x: 440, y: 120 },
    },
    instruments: {
      "PT-101": { x: 260, y: 45 },
      "FT-101": { x: 390, y: 170 },
      "LT-102": { x: 440, y: 45 },
    },
    lines: {
      "LINE-1": { x1: 112, y1: 120, x2: 260, y2: 120 },
      "LINE-2": { x1: 260, y1: 120, x2: 408, y2: 120 },
    },
  },
};
