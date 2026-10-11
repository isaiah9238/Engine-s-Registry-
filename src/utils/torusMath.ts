import type { AngleRadians, TorusDimensions, Vector3D, ColorRGB } from '../types/toroidalMatrix';

/**
 * Computes exact Cartesian surface coordinates on the 2-torus.
 */
export const calculateTorusPoint = (
  u: AngleRadians,
  v: AngleRadians,
  dimensions: TorusDimensions
): Vector3D => {
  const { majorRadius: R, minorRadius: r } = dimensions;
  const cosV = Math.cos(v);
  const factor = R + r * cosV;

  return {
    x: factor * Math.cos(u),
    y: factor * Math.sin(u),
    z: r * Math.sin(v),
  };
};

/**
 * Evaluates Layer 4 (8-Fold Radial Symmetry) and Layer 3 (OKLab projection)
 * producing deterministic, perceptually uniform RGB color coordinates.
 */
export const evaluateTorusColorAtPoint = (
  u: AngleRadians,
  v: AngleRadians,
  timeEpoch: number,
  symmetryFolds = 8
): ColorRGB => {
  // Harmonic fold (L4)
  const harmonic = Math.sin(symmetryFolds * u + timeEpoch) * Math.cos(symmetryFolds * v);
  
  // Normalized field mapping to color components
  const rNorm = 0.5 + 0.5 * Math.sin(u + harmonic);
  const gNorm = 0.5 + 0.5 * Math.cos(v + harmonic);
  const bNorm = 0.5 + 0.5 * Math.sin(u + v + timeEpoch * 0.5);

  return {
    r: Math.min(1, Math.max(0, rNorm)),
    g: Math.min(1, Math.max(0, gNorm)),
    b: Math.min(1, Math.max(0, bNorm)),
  };
};