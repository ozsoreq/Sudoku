import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { Action, GameState } from '../lib/game'

interface Props {
  state: GameState
  dispatch: (a: Action) => void
}

const DIGIT_COLORS = [
  'from-rose-500 to-orange-400',
  'from-orange-500 to-amber-400',
  'from-amber-500 to-yellow-400',
  'from-lime-500 to-emerald-400',
  'from-emerald-500 to-teal-400',
  'from-cyan-500 to-sky-400',
  'from-sky-500 to-indigo-400',
  'from-indigo-500 to-violet-400',
  'from-violet-500 to-fuchsia-400',
]

export function NumberPad({ state, dispatch }: Props) {
  const remaining = Array.from({ length: 10 }, () => 9)
  state.values.forEach((v, i) => {
    if (v && v === state.solution[i]) remaining[v]--
  })

  return (
    <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
      {Array.from({ length: 9 }, (_, n) => {
        const d = n + 1
        const done = remaining[d] === 0
        return (
          <motion.button
            key={d}
            type="button"
            aria-label={`Enter ${d}`}
            disabled={done || state.status !== 'playing'}
            onClick={() => dispatch({ type: 'input', digit: d })}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.88 }}
            animate={{ opacity: done ? 0.25 : 1, scale: done ? 0.9 : 1 }}
            className={`group relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-xl bg-white/80 shadow-sm ring-1 ring-slate-200 disabled:cursor-default dark:bg-slate-800/80 dark:ring-slate-700`}
          >
            <span className={`absolute inset-0 bg-linear-to-br ${DIGIT_COLORS[n]} opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0`} />
            <span className={`relative bg-linear-to-br ${DIGIT_COLORS[n]} bg-clip-text text-[clamp(1.3rem,6vw,2rem)] font-bold text-transparent transition-colors group-hover:text-white`}>{d}</span>
            <span className="relative text-[10px] font-medium text-slate-400 group-hover:text-white/80">{remaining[d]}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

function ToolButton({ label, onClick, disabled, active, badge, children }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean; badge?: ReactNode; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
        active ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
      }`}
    >
      <span className={`relative flex size-11 items-center justify-center rounded-full transition-colors ${active ? 'bg-violet-100 dark:bg-violet-500/25' : 'bg-white/80 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700'}`}>
        {children}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-violet-500 px-1 text-[10px] leading-5 font-bold text-white shadow">{badge}</span>
        )}
      </span>
      {label}
    </motion.button>
  )
}

const icon = 'size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'

export function Toolbar({ state, dispatch }: Props) {
  const playing = state.status === 'playing'
  return (
    <div className="flex justify-around">
      <ToolButton label="Undo" disabled={!playing || !state.history.length} onClick={() => dispatch({ type: 'undo' })}>
        <svg viewBox="0 0 24 24" className={icon}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
      </ToolButton>
      <ToolButton label="Erase" disabled={!playing} onClick={() => dispatch({ type: 'erase' })}>
        <svg viewBox="0 0 24 24" className={icon}><path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></svg>
      </ToolButton>
      <ToolButton label="Notes" active={state.notesMode} badge={state.notesMode ? 'ON' : 'OFF'} onClick={() => dispatch({ type: 'toggleNotes' })}>
        <svg viewBox="0 0 24 24" className={icon}><path d="M12 20h9" /><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
      </ToolButton>
      <ToolButton label="Hint" disabled={!playing || !state.hintsLeft} badge={state.hintsLeft} onClick={() => dispatch({ type: 'hint' })}>
        <svg viewBox="0 0 24 24" className={icon}><path d="M15 14c.2-1 .7-1.7 1.5-2.5A4.8 4.8 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
      </ToolButton>
    </div>
  )
}
