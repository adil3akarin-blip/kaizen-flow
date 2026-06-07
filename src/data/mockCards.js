import { STICKY_COLORS, randomRotation } from '../lib/cardUtils'

const mockEntries = [
  { text: 'Позвонить стоматологу — записаться на чистку', x: 48, y: 40 },
  { text: 'Идея: приложение для учёта энергии, не времени', x: 280, y: 80 },
  { text: 'Купить подарок маме на день рождения', x: 120, y: 200 },
  { text: 'Разобрать старые заметки в Notion', x: 400, y: 160 },
  { text: 'Тревога: не успеваю по проекту на работе', x: 60, y: 340 },
  { text: 'Почитать про WIP-лимиты в Kanban', x: 320, y: 300 },
  { text: 'Обещал помочь другу с переездом в субботу', x: 180, y: 420 },
  { text: 'Хочу научиться готовить рамен', x: 460, y: 380 },
]

export const mockCards = mockEntries.map((entry, i) => ({
  id: `mock-${i}`,
  text: entry.text,
  color: STICKY_COLORS[i % STICKY_COLORS.length],
  rotation: randomRotation(),
  x: entry.x,
  y: entry.y,
  createdAt: Date.now() - (mockEntries.length - i) * 3600000,
}))
