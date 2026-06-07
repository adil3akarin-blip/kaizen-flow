export const NOTIFICATION_TYPES = [
  {
    id: 'morning',
    label: 'Утро — выгрузка',
    defaultEnabled: true,
    preview: 'Утро. Хочешь выгрузить мысли?',
  },
  {
    id: 'stuck',
    label: 'Затор',
    defaultEnabled: true,
    preview: 'Одно дело застряло — пересмотреть?',
  },
  {
    id: 'elephants',
    label: 'Слоны (1-е число)',
    defaultEnabled: true,
    preview: 'Месяц закрылся. Заглянуть в итоги?',
  },
  {
    id: 'inactive',
    label: 'Давно не заходил',
    defaultEnabled: false,
    preview: 'Давно не заходил — как дела с потоком?',
  },
  {
    id: 'energy',
    label: 'Энергия',
    defaultEnabled: false,
    preview: 'Как ресурс? Загляни в хаб энергии',
  },
]

export function buildDefaultNotificationPrefs() {
  return Object.fromEntries(
    NOTIFICATION_TYPES.map((t) => [t.id, t.defaultEnabled]),
  )
}

export function countEnabledNotifications(prefs) {
  return Object.values(prefs).filter(Boolean).length
}
