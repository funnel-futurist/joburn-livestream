import { describe, it, expect } from 'vitest';
import { getCycleState } from './stateMachine.js';

const SUPER_CYCLE_MS = 270 * 60 * 1000; // 270 minutes — 4 cycles of 60min + 30min long break

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

  it('returns FOCUS on cycle 4 at minute 180', () => {
    const epoch = 0;
    const now = 180 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(4);
    expect(result.minutesRemaining).toBe(50);
  });

  it('returns BREAK on cycle 4 at minute 230 (cycle 4 break is short, not long)', () => {
    const epoch = 0;
    const now = 230 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('BREAK');
    expect(result.cycleIndex).toBe(4);
    expect(result.minutesRemaining).toBe(10);
  });

  it('returns LONG_BREAK at minute 240 (after all 4 cycles complete)', () => {
    const epoch = 0;
    const now = 240 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('LONG_BREAK');
    expect(result.cycleIndex).toBe(4);
    expect(result.minutesRemaining).toBe(30);
    expect(result.minuteWithinPhase).toBe(0);
  });

  it('returns LONG_BREAK mid-way at minute 255 (15 min in, 15 remaining)', () => {
    const epoch = 0;
    const now = 255 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('LONG_BREAK');
    expect(result.minutesRemaining).toBe(15);
  });

  it('wraps back to FOCUS cycle 1 after super-cycle (minute 270)', () => {
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
