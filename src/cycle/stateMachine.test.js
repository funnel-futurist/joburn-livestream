import { describe, it, expect } from 'vitest';
import { getCycleState } from './stateMachine.js';

const SUPER_CYCLE_MS = 260 * 60 * 1000; // 260 minutes

describe('getCycleState', () => {
  it('returns FOCUS phase at the start of the super-cycle', () => {
    const epoch = 0;
    const result = getCycleState(epoch, epoch);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(1);
    expect(result.minutesRemaining).toBe(50);
    expect(result.minuteWithinPhase).toBe(0);
  });

  it('returns BREAK phase 50 minutes into cycle 1', () => {
    const epoch = 0;
    const now = 50 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('BREAK');
    expect(result.cycleIndex).toBe(1);
    expect(result.minutesRemaining).toBe(10);
  });

  it('returns FOCUS phase at start of cycle 2 (minute 60)', () => {
    const epoch = 0;
    const now = 60 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(2);
    expect(result.minutesRemaining).toBe(50);
  });

  it('returns LONG_BREAK on cycle 4 (minute 230)', () => {
    const epoch = 0;
    const now = 230 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('LONG_BREAK');
    expect(result.cycleIndex).toBe(4);
    expect(result.minutesRemaining).toBe(30);
  });

  it('wraps back to FOCUS cycle 1 after super-cycle (minute 260)', () => {
    const epoch = 0;
    const now = SUPER_CYCLE_MS;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(1);
  });

  it('is deterministic given the same epoch and now', () => {
    const epoch = 1747353600000;
    const now = epoch + 73 * 60 * 1000;
    const a = getCycleState(epoch, now);
    const b = getCycleState(epoch, now);
    expect(a).toEqual(b);
  });

  it('handles seconds precision in minuteWithinPhase', () => {
    const epoch = 0;
    const now = 12.5 * 60 * 1000; // 12 min 30 sec into FOCUS
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.minuteWithinPhase).toBeCloseTo(12.5, 1);
    expect(result.secondsRemaining).toBe((50 - 12.5) * 60);
  });

  it('clamps pre-epoch times to cycle 1 minute 0', () => {
    const epoch = 1747353600000;
    const result = getCycleState(epoch, epoch - 1000);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(1);
    expect(result.minuteWithinPhase).toBe(0);
    expect(result.minutesRemaining).toBe(50);
    expect(result.superCycleNumber).toBe(0);
  });
});
