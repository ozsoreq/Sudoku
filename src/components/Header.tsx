import { AnimatePresence, motion } from 'motion/react'
import { MAX_MISTAKES, type GameState } from '../lib/game'
import type { Difficulty } from '../lib/sudoku'
import { formatTime } from '../lib/format'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

interface Props {
  state: GameState
  onNewGame: (d: Difficulty) => void
  dark: boolean
  onToggleTheme: () => void
}

export function Header({ state, onNewGame, dark, onToggleTheme }: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="bg-linear-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-amber-300">
          Sudoku
        </h1>
        <motion.button
          type="button"
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
          whileTap={{ rotate: 90, scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-full bg-white/80 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:text-amber-300 dark:ring-slate-700"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round]">
            {dark ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            )}
          </svg>
        </motion.button>
      </div>

      <nav className="flex rounded-full bg-white/70 p-1 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onNewGame(d)}
            className={`relative flex-1 rounded-full py-1.5 text-sm font-medium capitalize transition-colors ${state.difficulty === d ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
          >
            {state.difficulty === d && (
              <motion.span layoutId="difficulty-pill" className="absolute inset-0 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-md shadow-fuchsia-500/30" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <span className="relative">{d}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center justify-between px-1 text-sm">
        <div className="flex items-center gap-1.5" aria-label={`Mistakes ${state.mistakes} of ${MAX_MISTAKES}`}>
          {Array.from({ length: MAX_MISTAKES }, (_, i) => {
            const lost = i >= MAX_MISTAKES - state.mistakes
            return (
              <AnimatePresence key={i} mode="popLayout">
                <motion.svg
                  key={lost ? 'lost' : 'full'}
                  viewBox="0 0 24 24"
                  className={`size-5 ${lost ? 'fill-slate-300 dark:fill-slate-700' : 'fill-rose-500'}`}
                  initial={lost ? { scale: 1.8, rotate: -20 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                >
                  <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z" />
                </motion.svg>
              </AnimatePresence>
            )
          })}
        </div>
        <span className="font-mono text-base font-medium tabular-nums text-slate-600 dark:text-slate-300">{formatTime(state.elapsed)}</span>
      </div>
    </header>
  )
}
