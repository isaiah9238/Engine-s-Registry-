---
name: toroidal-color-matrix
title: "Toroidal Color Matrix: 7-Layer Parametric Transformation Engine"
description: >
  Engineers, calculates, and renders high-dimensional toroidal color manifolds across 7 discrete transformation layers.
  Computes continuous parameterizations using NumPy/Matplotlib numerical pipelines and renders real-time WebGL/Three.js
  shaders with strict TypeScript typing, immutable vector linear algebra, and modular state management.
version: 1.0.0
category: analysis
securityClearance: public
isExecutable: true
runtime: in_process
tags: [parametric-geometry, toroidal-manifold, three-js, webgl, shaders, color-spaces, linear-algebra]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Toroidal Color Matrix: 7-Layer Parametric Transformation Engine

## Description & Mission
The `toroidal-color-matrix` skill governs the generation, procedural evaluation, and visual rendering of 7-layer toroidal color fields. It maps multi-dimensional color metrics onto compact continuous 2-manifolds embedded in `\mathbb{R}^2 \cdot \text{Time}^2\text{Slope}^1\pm1`, handling analytical parametric evaluations, coordinate conversions, and client-side rendering via React Three Fiber (R3F) and Three.js.

---

## Mathematical Foundations & Parametric Manifold Topology

A standard 2-torus embedded in Cartesian coordinate space is parameterized by two angular coordinates `u, v \in [0, 2\pi)`:

`$x(u, v) = (R + r \cos v) \cos u$`
`$y(u, v) = (R + r \cos v) \sin u$`
`$z(u, v) = r \sin v$`

where:
* `R` denotes the major radius (distance from the center of the tube to the center of the torus).
* `r` denotes the minor radius (radius of the interior tube, where `r < R`).

### The 7 Transformation Layers
The color matrix projects state trajectories through seven discrete layers:

1. **Layer 1: Base Manifold Coordinate Mapping (`L_1`)**: Evaluates canonical surface coordinates `(u, v)` from parametric step vectors.
2. **Layer 2: Metric Tensor & Curvature Modulation (`L_2`)**: Calculates the Riemannian metric `g_{ij}` and adjusts local density proportional to Gaussian curvature `K(u, v) = \frac{\cos v}{r(R + r \cos v)}`.
3. **Layer 3: OKLab / Polar Chrominance Transformation (`L_3`)**: Maps angular coordinates to perceptually uniform color coordinates (`L, a, b` or `J, C, h`).
4. **Layer 4: 8-Fold Radial Symmetry Harmonics (`L_4`)**: Applies cyclic boundary folding via periodic harmonic modulation: `f(u) = \sin(8u) \cdot \cos(8v)`.
5. **Layer 5: Hysteresis Field & Phase Drift (`L_5`)**: Introduces dynamic time-evolution phase offsets `\phi_t` modeling relaxation dynamics across the surface.
6. **Layer 6: Normal Vector & Lighting Differential (`L_6`)**: Computes analytical surface normals `\mathbf{n}(u, v) = (\cos v \cos u, \cos v \sin u, \sin v)^T` for specular and diffuse scattering.
7. **Layer 7: Viewport Fragment Projection & Quantization (`L_7`)**: Projects the composite spectral radiance vector into linear sRGB space with gamma correction for WebGL framebuffers.

---

## Directory & File Placement Standards

In accordance with the repository architecture conventions:

src/
├── types/
│   └── toroidalMatrix.ts       # Immutable domain types, layer matrices, and parameter definitions
├── utils/
│   └── torusMath.ts            # Pure mathematical functions (coordinate transformations, metric tensors)
├── services/
│   └── toroidalMatrixCache.ts  # Local-first cache and memoized buffer calculations
└── components/
└── visualizers/
├── ToroidalCanvas.tsx  # React Three Fiber canvas host (arrow component, zero useEffect)
└── TorusMeshNode.tsx   # Custom Three.js shader material node

---

## Strict TypeScript Domain Contracts (`src/types/toroidalMatrix.ts`)

```typescript
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