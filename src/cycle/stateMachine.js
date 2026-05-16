// src/cycle/stateMachine.js
// Pure function: maps wall-clock time → current cycle phase + position.
// No state stored anywhere. Restart-safe. Deterministic.

const FOCUS_MIN = 50;
const BREAK_MIN = 10;
const LONG_BREAK_MIN = 30;
const BLOCKS_PER_SUPER_CYCLE = 4;

// Classic Pomodoro: 4 cycles of (FOCUS + short BREAK), THEN one LONG_BREAK,
// then the super-cycle restarts. Total = 4*(50+10) + 30 = 270 min = 4h 30m.
const STANDARD_BLOCK_MIN = FOCUS_MIN + BREAK_MIN; // 60
const SUPER_CYCLE_MIN = BLOCKS_PER_SUPER_CYCLE * STANDARD_BLOCK_MIN + LONG_BREAK_MIN; // 270

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
  // Four FOCUS+BREAK blocks (each 60 min).
  for (let cycleIndex = 1; cycleIndex <= BLOCKS_PER_SUPER_CYCLE; cycleIndex++) {
    // FOCUS portion (50 min)
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

    // BREAK portion (always 10 min — all 4 cycles get short breaks)
    if (minIntoSuperCycle < cumulative + BREAK_MIN) {
      const minuteWithinPhase = minIntoSuperCycle - cumulative;
      const minutesRemaining = BREAK_MIN - minuteWithinPhase;
      return {
        phase: 'BREAK',
        cycleIndex,
        minuteWithinPhase,
        minutesRemaining: Math.ceil(minutesRemaining),
        secondsRemaining: minutesRemaining * 60,
        superCycleNumber
      };
    }
    cumulative += BREAK_MIN;
  }

  // LONG_BREAK comes AFTER all 4 blocks finish. cycleIndex stays at 4
  // (since it's the rest after the 4th cycle, not a separate cycle).
  if (minIntoSuperCycle < cumulative + LONG_BREAK_MIN) {
    const minuteWithinPhase = minIntoSuperCycle - cumulative;
    const minutesRemaining = LONG_BREAK_MIN - minuteWithinPhase;
    return {
      phase: 'LONG_BREAK',
      cycleIndex: BLOCKS_PER_SUPER_CYCLE,
      minuteWithinPhase,
      minutesRemaining: Math.ceil(minutesRemaining),
      secondsRemaining: minutesRemaining * 60,
      superCycleNumber
    };
  }

  // Unreachable — minIntoSuperCycle ∈ [0, SUPER_CYCLE_MIN) is exhaustively covered above.
  throw new Error(
    `getCycleState: minIntoSuperCycle=${minIntoSuperCycle} exceeded SUPER_CYCLE_MIN=${SUPER_CYCLE_MIN} (unreachable)`
  );
}
