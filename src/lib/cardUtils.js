export const STICKY_COLORS = [
  { bg: '#FFF9C4', shadow: '#F0E68C' },
  { bg: '#FFCDD2', shadow: '#EF9A9A' },
  { bg: '#B3E5FC', shadow: '#81D4FA' },
  { bg: '#C8E6C9', shadow: '#A5D6A7' },
  { bg: '#E1BEE7', shadow: '#CE93D8' },
  { bg: '#FFE0B2', shadow: '#FFCC80' },
]

export function pickRandomColor() {
  return STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]
}

export function randomRotation() {
  return Math.round((Math.random() * 12 - 6) * 10) / 10
}

export function generatePosition(existingCards) {
  const cardW = 180
  const cardH = 130
  const padding = 32

  for (let attempt = 0; attempt < 60; attempt++) {
    const x = padding + Math.random() * 520
    const y = padding + Math.random() * 420

    const overlaps = existingCards.some(
      (c) =>
        Math.abs(c.x - x) < cardW * 0.55 && Math.abs(c.y - y) < cardH * 0.55,
    )

    if (!overlaps) return { x, y }
  }

  return {
    x: padding + Math.random() * 400,
    y: padding + Math.random() * 350,
  }
}

export function createCard(text, existingCards) {
  const color = pickRandomColor()
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    color,
    rotation: randomRotation(),
    ...generatePosition(existingCards),
    createdAt: Date.now(),
  }
}
