export function hapticTap() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

export const vibrateSuccess = hapticTap
