import { buildDeepLink } from './pushUtils'

export const PUSH_MESSAGES = {
  morning: {
    title: 'KaizenFlow',
    body: 'Утро. Хочешь выгрузить мысли?',
    tag: 'kaizenflow-morning',
    query: { open: 'dump' },
  },
  stuck: {
    title: 'KaizenFlow',
    body: 'Одно дело застряло — пересмотреть?',
    tag: 'kaizenflow-stuck',
    query: { tab: 'today' },
  },
  elephants: {
    title: 'KaizenFlow',
    body: 'Месяц закрылся. Заглянуть в итоги?',
    tag: 'kaizenflow-elephants',
    query: { tab: 'kanban', elephants: '1' },
  },
  inactive: {
    title: 'KaizenFlow',
    body: 'Как дела с потоком?',
    tag: 'kaizenflow-inactive',
    query: { tab: 'today' },
  },
}

export function buildPushPayload(type) {
  const msg = PUSH_MESSAGES[type]
  if (!msg) return null
  const url = buildDeepLink(msg.query)
  return {
    title: msg.title,
    body: msg.body,
    tag: msg.tag,
    url,
    type,
  }
}

export function stuckBody(stuckCount) {
  if (stuckCount === 1) return 'Одно дело застряло — пересмотреть?'
  return `${stuckCount} дел застряло — пересмотреть?`
}
