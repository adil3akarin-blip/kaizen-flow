const RECOVERY_IDEAS = [
  'Прогулка без телефона',
  '10 минут тишины',
  'Чай и ничего не делать',
  'Лёгкое дело из очереди',
]

export default function PauseScreen({ onOpenHub, onContinue }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <p className="m-0 font-serif text-2xl font-medium text-warm-text">
            Похоже, ресурс на исходе
          </p>
          <p className="mt-3 text-sm leading-relaxed text-warm-muted">
            Три тяжёлых дела за последние пару часов — воля не бесконечна.
            Хочешь передышку?
          </p>

          <ul className="mt-8 flex list-none flex-col gap-2 p-0 text-left">
            {RECOVERY_IDEAS.map((idea) => (
              <li
                key={idea}
                className="rounded-xl border border-cream-dark/50 bg-white px-4 py-3 text-sm text-warm-text"
              >
                {idea}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenHub}
              className="rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
            >
              Открыть хаб энергии
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-lg border border-cream-dark py-3 text-sm text-warm-muted hover:bg-cream-dark"
            >
              Всё равно продолжу
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
