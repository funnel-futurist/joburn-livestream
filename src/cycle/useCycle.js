// src/cycle/useCycle.js
import { useState, useEffect } from 'react';
import { getCycleState } from './stateMachine.js';

// Fixed reference epoch — Sunday 2026-05-17 00:00:00 UTC.
// All clients computing against this epoch see the same cycle position
// (so two viewers in different time zones see the same FOCUS/BREAK).
const REFERENCE_EPOCH_MS = Date.UTC(2026, 4, 17, 0, 0, 0); // month is 0-indexed: 4 = May

export function useCycle() {
  const [state, setState] = useState(() => getCycleState(REFERENCE_EPOCH_MS, Date.now()));

  useEffect(() => {
    const tick = () => setState(getCycleState(REFERENCE_EPOCH_MS, Date.now()));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
