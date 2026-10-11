import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ToroidalMatrixState } from '../../types/toroidalMatrix';

interface TorusMeshNodeProps {
  readonly matrixState: ToroidalMatrixState;
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormalVec;

  void main() {
    vUv = uv;
    vNormalVec = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uSymmetry;
  varying vec2 vUv;
  varying vec3 vNormalVec;

  void main() {
    float u = vUv.x * 6.28318530718;
    float v = vUv.y * 6.28318530718;

    // 7-layer composite approximation:
    // L4 symmetry harmonic modulation
    float harmonic = sin(uSymmetry * u + uTime) * cos(uSymmetry * v);
    
    // Chrominance fields
    float r = 0.5 + 0.5 * sin(u + harmonic);
    float g = 0.5 + 0.5 * cos(v + harmonic);
    float b = 0.5 + 0.5 * sin(u + v + uTime * 0.5);

    // L6 diffuse lighting calculation
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormalVec, lightDir), 0.2);

    gl_FragColor = vec4(vec3(r, g, b) * diff, 1.0);
  }
`;

export const TorusMeshNode: React.FC<TorusMeshNodeProps> = ({ matrixState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSymmetry: { value: 8.0 },
    }),
    []
  );

  // Driven strictly by the render frame loop; zero React lifecycle overhead
  useFrame((_, delta) => {
    if (!materialRef.current || !matrixState.isDynamic) return;
    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh>
      <torusGeometry
        args={[
          matrixState.dimensions.majorRadius,
          matrixState.dimensions.minorRadius,
          matrixState.dimensions.radialSegments,
          matrixState.dimensions.tubularSegments,
        ]}
      />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};