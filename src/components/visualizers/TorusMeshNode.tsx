import React, { useRef, useEffect } from 'react';
import type { ToroidalMatrixState } from '../../types/toroidalMatrix';
import { calculateTorusPoint, evaluateTorusColorAtPoint } from '../../utils/torusMath';

interface TorusMeshNodeProps {
  readonly matrixState: ToroidalMatrixState;
  readonly width?: number;
  readonly height?: number;
}

export const TorusMeshNode: React.FC<TorusMeshNodeProps> = ({
  matrixState,
  width = 400,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let epoch = matrixState.timeEpoch || 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / (2.5 * (matrixState.dimensions.majorRadius + matrixState.dimensions.minorRadius));

      const uSteps = matrixState.dimensions.radialSegments || 24;
      const vSteps = matrixState.dimensions.tubularSegments || 16;

      for (let i = 0; i < uSteps; i++) {
        const u = (i / uSteps) * 2 * Math.PI;
        for (let j = 0; j < vSteps; j++) {
          const v = (j / vSteps) * 2 * Math.PI;
          const pt = calculateTorusPoint(u, v, matrixState.dimensions);
          const color = evaluateTorusColorAtPoint(u, v, epoch);

          // Simple 3D perspective projection
          const rotX = pt.x * Math.cos(epoch * 0.5) - pt.z * Math.sin(epoch * 0.5);
          const rotZ = pt.x * Math.sin(epoch * 0.5) + pt.z * Math.cos(epoch * 0.5);
          const rotY = pt.y;

          const projX = centerX + rotX * scale;
          const projY = centerY + rotY * scale;

          ctx.fillStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(1, (rotZ + 5) * 0.5), 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      if (matrixState.isDynamic) {
        epoch += 0.02;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [matrixState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-xl border border-slate-800 bg-slate-950 shadow-inner"
    />
  );
};