// src/cycle/useCycle.js
import { useState, useEffect } from 'react';
import { getCycleState } from './stateMachine.js';

// Fixed reference epoch — 2024-01-01 00:00:00 UTC (deliberately in the past).
// All clients computing against this epoch see the same cycle position
// (so two viewers in different time zones see the same FOCUS/BREAK).
// MUST be in the past so the clamp guard in getCycleState doesn't pin
// every viewer to FOCUS minute 0.
const REFERENCE_EPOCH_MS = Date.UTC(2024, 0, 1, 0, 0, 0); // month is 0-indexed: 0 = January

export function useCycle() {
  const [state, setState] = useState(() => getCycleState(REFERENCE_EPOCH_MS, Date.now()));

  useEffect(() => {
    const tick = () => setState(getCycleState(REFERENCE_EPOCH_MS, Date.now()));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
