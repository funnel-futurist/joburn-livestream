import { describe, it, expect } from 'vitest';
import { selectQuote, registerForCycleState } from './selectQuote.js';
import quotes from './quotes.json';

describe('registerForCycleState', () => {
  it('returns PRIMING in FOCUS minutes 0-10', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 0 })).toBe('PRIMING');
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 9 })).toBe('PRIMING');
  });
  it('returns DEEP_WORK in FOCUS minutes 10-45', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 10 })).toBe('DEEP_WORK');
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 44 })).toBe('DEEP_WORK');
  });
  it('returns RELEASE in FOCUS minutes 45-50 and BREAK', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 47 })).toBe('RELEASE');
    expect(registerForCycleState({ phase: 'BREAK', minuteWithinPhase: 0 })).toBe('RELEASE');
    expect(registerForCycleState({ phase: 'BREAK', minuteWithinPhase: 9 })).toBe('RELEASE');
  });
  it('returns REFLECTION in LONG_BREAK', () => {
    expect(registerForCycleState({ phase: 'LONG_BREAK', minuteWithinPhase: 5 })).toBe('REFLECTION');
  });
});

describe('selectQuote', () => {
  it('returns a quote whose register matches the requested register', () => {
    const q = selectQuote('PRIMING', 0);
    expect(q.register).toBe('PRIMING');
    expect(q.text).toBeTruthy();
    expect(q.author).toBeTruthy();
  });

  it('is deterministic given the same register and rotation index', () => {
    const a = selectQuote('DEEP_WORK', 7);
    const b = selectQuote('DEEP_WORK', 7);
    expect(a).toEqual(b);
  });

  it('cycles through the register pool with increasing rotation index', () => {
    const seen = new Set();
    for (let i = 0; i < 20; i++) {
      const q = selectQuote('REFLECTION', i);
      seen.add(q.text);
    }
    // At least 5 distinct quotes (we have 15 in REFLECTION pool)
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});
