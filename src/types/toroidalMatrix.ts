/**
 * Strict TypeScript Domain Contracts for Toroidal Matrix Skill
 */

export type AngleRadians = number;

export interface TorusDimensions {
  readonly majorRadius: number; // R
  readonly minorRadius: number; // r
  readonly radialSegments: number;
  readonly tubularSegments: number;
}

export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ColorRGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export type MatrixLayerIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface LayerTransformationConfig {
  readonly layerIndex: MatrixLayerIndex;
  readonly name: string;
  readonly weight: number;
  readonly phaseShift: number;
  readonly symmetryFold: number;
}

export interface ToroidalMatrixState {
  readonly dimensions: TorusDimensions;
  readonly layers: readonly LayerTransformationConfig[];
  readonly timeEpoch: number;
  readonly isDynamic: boolean;
}
