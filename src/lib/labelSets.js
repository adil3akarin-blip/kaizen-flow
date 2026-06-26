// Набор меток «Ромашка» — пять сфер жизни (Кайдзен планирование, уроки 21–23).
//
// Метки — это цветное «табло приоритетов»: они показывают, куда уходит твоё
// время и внимание, и повышают осознанность. Принцип атомарности: одна
// карточка — одна сфера. Цвета закреплены за сферами как в курсе:
//   саморазвитие — красный, семья/друзья — розовый, хобби — зелёный,
//   дело/работа — синий, общество — жёлтый.

export const LIFE_SPHERES = [
  { id: 'self', label: 'Саморазвитие', dot: '#f43f5e', soft: 'rgba(244, 63, 94, 0.12)', text: '#e11d48' },
  { id: 'family', label: 'Семья и друзья', dot: '#ec4899', soft: 'rgba(236, 72, 153, 0.12)', text: '#db2777' },
  { id: 'hobby', label: 'Хобби', dot: '#22c55e', soft: 'rgba(34, 197, 94, 0.13)', text: '#16a34a' },
  { id: 'work', label: 'Дело и работа', dot: '#3b82f6', soft: 'rgba(59, 130, 246, 0.12)', text: '#2563eb' },
  { id: 'society', label: 'Общество', dot: '#f59e0b', soft: 'rgba(245, 158, 11, 0.14)', text: '#d97706' },
]

const SPHERE_BY_ID = new Map(LIFE_SPHERES.map((s) => [s.id, s]))

export function getSphere(id) {
  return id ? SPHERE_BY_ID.get(id) ?? null : null
}

export function isValidSphere(id) {
  return SPHERE_BY_ID.has(id)
}
