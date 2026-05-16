// src/cycle/stateMachine.js
// Pure function: maps wall-clock time → current cycle phase + position.
// No state stored anywhere. Restart-safe. Deterministic.

const FOCUS_MIN = 50;
const BREAK_MIN = 10;
const LONG_BREAK_MIN = 30;
const BLOCKS_PER_SUPER_CYCLE = 4;

const STANDARD_BLOCK_MIN = FOCUS_MIN + BREAK_MIN; // 60
const LONG_BLOCK_MIN = FOCUS_MIN + LONG_BREAK_MIN; // 80
const SUPER_CYCLE_MIN = (BLOCKS_PER_SUPER_CYCLE - 1) * STANDARD_BLOCK_MIN + LONG_BLOCK_MIN; // 260

/**
 * @param {number} epochMs - Reference epoch (any absolute time; cycle is computed relative to it).
 * @param {number} nowMs - Current wall-clock time in milliseconds.
 * @returns {{
 *   phase: 'FOCUS' | 'BREAK' | 'LONG_BREAK',
 *   cycleIndex: 1 | 2 | 3 | 4,
 *   minuteWithinPhase: number,
 *   minutesRemaining: number,
 *   secondsRemaining: number,
 *   superCycleNumber: number
 * }}
 */
export function getCycleState(epochMs, nowMs) {
  // Clamp negative elapsed time to zero (returns cycle 1 minute 0).
  // Without this guard, pre-epoch calls produce nonsensical negative
  // minuteWithinPhase / superCycleNumber values.
  const elapsedMs = Math.max(0, nowMs - epochMs);
  const superCycleNumber = Math.floor(elapsedMs / (SUPER_CYCLE_MIN * 60 * 1000));
  const minIntoSuperCycle = (elapsedMs / 60000) % SUPER_CYCLE_MIN;

  let cumulative = 0;
  for (let cycleIndex = 1; cycleIndex <= BLOCKS_PER_SUPER_CYCLE; cycleIndex++) {
    const isLast = cycleIndex === BLOCKS_PER_SUPER_CYCLE;
    const breakDuration = isLast ? LONG_BREAK_MIN : BREAK_MIN;
    const breakPhase = isLast ? 'LONG_BREAK' : 'BREAK';

    // FOCUS portion
    if (minIntoSuperCycle < cumulative + FOCUS_MIN) {
      const minuteWithinPhase = minIntoSuperCycle - cumulative;
      const minutesRemaining = FOCUS_MIN - minuteWithinPhase;
      return {
        phase: 'FOCUS',
        cycleIndex,
        minuteWithinPhase,
        minutesRemaining: Math.ceil(minutesRemaining),
        secondsRemaining: minutesRemaining * 60,
        superCycleNumber
      };
    }
    cumulative += FOCUS_MIN;

    // BREAK portion
    if (minIntoSuperCycle < cumulative + breakDuration) {
      const minuteWithinPhase = minIntoSuperCycle - cumulative;
      const minutesRemaining = breakDuration - minuteWithinPhase;
      return {
        phase: breakPhase,
        cycleIndex,
        minuteWithinPhase,
        minutesRemaining: Math.ceil(minutesRemaining),
        secondsRemaining: minutesRemaining * 60,
        superCycleNumber
      };
    }
    cumulative += breakDuration;
  }

  // Unreachable — the loop above must return for any valid minIntoSuperCycle ∈ [0, SUPER_CYCLE_MIN).
  throw new Error(
    `getCycleState: minIntoSuperCycle=${minIntoSuperCycle} exceeded SUPER_CYCLE_MIN=${SUPER_CYCLE_MIN} (unreachable)`
  );
}
