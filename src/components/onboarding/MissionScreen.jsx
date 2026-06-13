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
 <div className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-ink/25 px-4 py-6 backdrop-blur-sm sm:items-center sm:px-6">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: 'spring', stiffness: 300, damping: 28 }}
 className="my-auto w-full max-w-md rounded-2xl border border-line/60 bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
 >
 <h2 className="m-0 text-lg font-medium text-ink sm:text-xl">
 Что для тебя сейчас главное?
 </h2>
 <p className="mt-2 text-sm leading-relaxed text-ink-muted">
 Это поможет фильтровать задачи. Можно пропустить — тогда спросим
 просто «Стоит ли это моей энергии?»
 </p>

 <textarea
 value={mission}
 onChange={(e) => setMission(e.target.value)}
 placeholder="Например: здоровье, творчество, семья…"
 rows={3}
 className="mt-6 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-accent/30"
 />

 <div className="mt-6 flex flex-col gap-2">
 <button
 type="button"
 onClick={handleSubmit}
 className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
 >
 {mission.trim() ? 'Сохранить и разбирать' : 'Продолжить'}
 </button>
 <button
 type="button"
 onClick={onComplete}
 className="rounded-xl border border-line py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
 >
 Пропустить
 </button>
 </div>
 </motion.div>
 </div>
 )
}
