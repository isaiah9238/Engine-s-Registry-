---
name: iontronic-state-evaluator
title: "Iontronic State & Memory Telemetry Evaluator"
description: >
  Reads onboard electrochemical and iontronic sensors to evaluate channel conductance, redox oxidation states, and memory decay half-life in ECRAM and PEDOT:PSS chemical memory channels.
version: 1.0.0
category: sensing-and-telemetry
securityClearance: public
isExecutable: true
runtime: in_process
tags: [iontronic-memory, ecram, telemetry, chemical-memory, analog-computing]
priority: 2
thermodynamicFootprint: low
requiresHumanReview: false
---

# Iontronic State & Memory Telemetry Evaluator

## Description & Mission
Monitors the physical state of the chemical memory substrate in real time. Measures channel conductance ($G$), ion concentration profiles, and oxidation states across ECRAM (e.g., $\text{Li}^+$, $\text{H}^+$, $\text{Ca}^{2+}$) and conductive polymer transistors (PEDOT:PSS) to calculate synaptic weight shifts ($\Delta W$) and predict memory decay half-life before the next generative speech cycle.

## Parameters & Invocation Schemas

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `channelId` | `string` | true | - | Target iontronic memory channel or array sector ID. |
| `samplingFrequencyHz` | `number` | false | `100` | Sensor sampling rate in Hertz. |
| `baselineConductanceuS` | `number` | true | - | Initial/calibrated baseline conductance in microSiemens ($\mu\text{S}$). |
| `currentVoltageV` | `number` | true | - | Applied read voltage across the channel (Volts). |
| `measuredCurrentuA` | `number` | true | - | Measured channel current (microAmperes). |
| `ionSpecies` | `string` | false | `"Ca2+"` | Primary charge-carrying ion (`Li+`, `H+`, `Ca2+`, or `PEDOT:PSS_redox`). |

## Operational Rules & Telemetry Pipeline

1. **Conductance Calculation**: Compute instantaneous channel conductance $G = I_{\text{read}} / V_{\text{read}}$ ($\mu\text{S}$).
2. **Synaptic Weight Shift ($\Delta W$)**: Compare measured conductance against calibrated baseline: $\Delta W = (G - G_{\text{baseline}}) / G_{\text{baseline}}$.
3. **Decay Half-Life Estimation**: Measure passive ion dissipation over the sampling window to estimate retention half-life ($t_{1/2}$).
4. **Drift & Waste Flagging**: Flag anomalous impedance or background noise accumulation that indicates byproduct build-up or physical substrate degradation.

## Scaffolded Telemetry Execution Code

```typescript
export interface IontronicTelemetryInput {
  channelId: string;
  samplingFrequencyHz?: number;
  baselineConductanceuS: number;
  currentVoltageV: number;
  measuredCurrentuA: number;
  ionSpecies?: 'Li+' | 'H+' | 'Ca2+' | 'PEDOT:PSS_redox';
}

export interface IontronicTelemetryResult {
  channelId: string;
  instantaneousConductanceuS: number;
  synapticWeightShiftRatio: number; // \Delta W / W_0
  estimatedHalfLifeMs: number;
  healthStatus: 'optimal' | 'degrading' | 'critical_drift';
  requiresRebalancing: boolean;
  timestamp: string;
}

export async function evaluateIontronicState(params: IontronicTelemetryInput): Promise<IontronicTelemetryResult> {
  if (params.currentVoltageV === 0) {
    throw new Error("Read voltage cannot be zero during iontronic evaluation.");
  }

  // Calculate instantaneous conductance G = I / V (\muS)
  const instantaneousConductanceuS = params.measuredCurrentuA / params.currentVoltageV;

  // Synaptic weight shift \Delta W / W_0
  const weightShift = (instantaneousConductanceuS - params.baselineConductanceuS) / params.baselineConductanceuS;

  // Estimate retention half-life based on ion species mobility
  const mobilityCoefficients: Record<string, number> = {
    'H+': 0.85,     // Fast diffusion, shorter retention
    'Li+': 0.50,    // Moderate mobility
    'Ca2+': 0.25,   // Divalent ion, slow diffusion, long retention
    'PEDOT:PSS_redox': 0.10 // Polymer redox state, high non-volatility
  };

  const species = params.ionSpecies || 'Ca2+';
  const mobility = mobilityCoefficients[species] || 0.25;
  const estimatedHalfLifeMs = Math.round((instantaneousConductanceuS * 1000) / (mobility * 10));

  // Assess substrate health and rebalancing trigger
  let healthStatus: 'optimal' | 'degrading' | 'critical_drift' = 'optimal';
  let requiresRebalancing = false;

  if (Math.abs(weightShift) > 0.40) {
    healthStatus = 'critical_drift';
    requiresRebalancing = true;
  } else if (Math.abs(weightShift) > 0.20) {
    healthStatus = 'degrading';
    requiresRebalancing = true;
  }

  return {
    channelId: params.channelId,
    instantaneousConductanceuS: Number(instantaneousConductanceuS.toFixed(3)),
    synapticWeightShiftRatio: Number(weightShift.toFixed(4)),
    estimatedHalfLifeMs,
    healthStatus,
    requiresRebalancing,
    timestamp: new Date().toISOString()
  };
}
```

---
**Registry Location**: `/skills/iontronic-state-evaluator`
