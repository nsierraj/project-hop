/**
 * Colour-vision simulation for AC-10. Uses the Machado, Oliveira, and Fernandes (2009) matrices at
 * full severity, applied in linear RGB. Distances use CIE76 Delta E in CIELAB.
 */

type Vec3 = [number, number, number];

const MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
} as const;

export type CvdType = keyof typeof MATRICES;
export const CVD_TYPES = Object.keys(MATRICES) as CvdType[];

export function hexToRgb(hex: string): Vec3 {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function toLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toSrgb(v: number): number {
  const c = Math.min(Math.max(v, 0), 1);
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

/** Simulates how a colour looks to a viewer with the given colour-vision deficiency. */
export function simulate(hex: string, type: CvdType): Vec3 {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as Vec3;
  const m = MATRICES[type];
  const out = m.map((row) => row[0] * r + row[1] * g + row[2] * b) as Vec3;
  return out.map(toSrgb) as Vec3;
}

function toLab([r, g, b]: Vec3): Vec3 {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const x = (0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = (0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 colour difference between two hex colours, after simulation. */
export function deltaE(a: Vec3, b: Vec3): number {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

export function simulatedHexDistance(hexA: string, hexB: string, type: CvdType): number {
  return deltaE(simulate(hexA, type), simulate(hexB, type));
}
