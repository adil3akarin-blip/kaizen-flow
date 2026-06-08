export const REVIEW_VIEWS = {
  canvas: 'canvas',
  inbox: 'inbox',
}

const REVIEW_VIEW_KEY = 'kaizenflow-review-view'

export function loadReviewView() {
  const stored = localStorage.getItem(REVIEW_VIEW_KEY)
  return stored === REVIEW_VIEWS.inbox ? REVIEW_VIEWS.inbox : REVIEW_VIEWS.canvas
}

export function saveReviewView(view) {
  localStorage.setItem(REVIEW_VIEW_KEY, view)
}

export function formatRawInboxSubtitle(count) {
  if (count === 0) return 'Фильтруй мысли, когда будешь готов'
  if (count === 1) return '1 мысль ждёт разбора'
  if (count < 5) return `${count} мысли ждут разбора`
  return `${count} мыслей ждут разбора`
}

export function formatSilenceExitLabel(count) {
  if (count === 0) return 'Готов разбирать'
  if (count === 1) return 'Готов разбирать · 1 мысль'
  if (count < 5) return `Готов разбирать · ${count} мысли`
  return `Готов разбирать · ${count} мыслей`
}

const STICKY_HEIGHT = 130
const CANVAS_PADDING = 64

export function resolveCanvasContentHeight(cards) {
  if (cards.length === 0) return undefined
  const maxY = Math.max(...cards.map((card) => (card.y ?? 0) + STICKY_HEIGHT))
  return Math.max(maxY + CANVAS_PADDING, 480)
}
