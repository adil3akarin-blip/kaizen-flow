import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../store/useSettingsStore'

export default function MissionScreen({ onComplete }) {
  const [mission, setMission] = useState('')
  const setPersonalMission = useSettingsStore((s) => s.setPersonalMission)

  const handleSubmit = () => {
    const trimmed = mission.trim()
    if (trimmed) setPersonalMission(trimmed)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-warm-text/25 px-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl border border-cream-dark/60 bg-white p-6 shadow-xl"
      >
        <h2 className="m-0 font-serif text-xl font-medium text-warm-text">
          Что для тебя сейчас главное?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-warm-muted">
          Это поможет фильтровать задачи. Можно пропустить — тогда спросим
          просто «Стоит ли это моей энергии?»
        </p>

        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="Например: здоровье, творчество, семья…"
          rows={3}
          className="mt-6 w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-[15px] leading-relaxed text-warm-text placeholder:text-warm-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-warm-accent/30"
        />

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-warm-accent-hover"
          >
            {mission.trim() ? 'Сохранить и разбирать' : 'Продолжить'}
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-muted transition-colors hover:bg-cream-dark"
          >
            Пропустить
          </button>
        </div>
      </motion.div>
    </div>
  )
}
