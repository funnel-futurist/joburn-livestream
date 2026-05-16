// src/quotes/selectQuote.js
import quotes from './quotes.json';

const POOLS = {
  PRIMING: quotes.filter(q => q.register === 'PRIMING'),
  DEEP_WORK: quotes.filter(q => q.register === 'DEEP_WORK'),
  RELEASE: quotes.filter(q => q.register === 'RELEASE'),
  REFLECTION: quotes.filter(q => q.register === 'REFLECTION')
};

export function registerForCycleState({ phase, minuteWithinPhase }) {
  if (phase === 'LONG_BREAK') return 'REFLECTION';
  if (phase === 'BREAK') return 'RELEASE';
  if (phase === 'FOCUS') {
    if (minuteWithinPhase < 10) return 'PRIMING';
    if (minuteWithinPhase < 45) return 'DEEP_WORK';
    return 'RELEASE';
  }
  return 'PRIMING';
}

export function selectQuote(register, rotationIndex) {
  const pool = POOLS[register] || POOLS.PRIMING;
  return pool[rotationIndex % pool.length];
}
