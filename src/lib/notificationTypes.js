export const NOTIFICATION_TYPES = [
 {
 id: 'morning',
 label: 'Утреннее приглашение',
 when: 'Утром, если давно не выгружал мысли',
 example: '«Хочешь выгрузить мысли?»',
 defaultEnabled: true,
 },
 {
 id: 'stuck',
 label: 'Застрявшее дело',
 when: 'Когда одно дело слишком долго в работе',
 example: '«Одно дело застряло — пересмотреть?»',
 defaultEnabled: true,
 },
 {
 id: 'elephants',
 label: 'Итоги месяца',
 when: '1-е число каждого месяца',
 example: '«Месяц закрылся. Заглянуть в итоги?»',
 defaultEnabled: true,
 },
 {
 id: 'inactive',
 label: 'Долго не заходил',
 when: 'Если несколько дней не открывал приложение',
 example: '«Как дела с потоком?»',
 defaultEnabled: false,
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
