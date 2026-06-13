import { generateId } from './id'

export const STICKY_COLORS = [
 { bg: '#FBF3D5', shadow: '#E8DCAA' },
 { bg: '#FBE4E7', shadow: '#EFC3CA' },
 { bg: '#DFEBFA', shadow: '#BCD4F0' },
 { bg: '#E2F2E5', shadow: '#BFDFC7' },
 { bg: '#EFE6F7', shadow: '#D8C4EA' },
 { bg: '#FCE9DC', shadow: '#F0CDB4' },
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
 id: generateId(),
 text: text.trim(),
 color,
 rotation: randomRotation(),
 ...generatePosition(existingCards),
 createdAt: Date.now(),
 status: 'raw',
 }
}
