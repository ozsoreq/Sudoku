import { AnimatePresence, motion } from 'motion/react'
import type { GameState } from '../lib/game'
import type { Difficulty } from '../lib/sudoku'
import { formatTime } from '../lib/format'

interface Props {
  state: GameState
  best: number | undefined
  onNewGame: (d: Difficulty) => void
  onRestart: () => void
}

export function ResultDialog({ state, best, onNewGame, onRestart }: Props) {
  const open = state.status !== 'playing'
  const won = state.status === 'won'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: won ? 0.9 : 0.6 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
            className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl dark:bg-slate-900"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: won ? 1 : 0.7 }}
          >
            <motion.div
              className="mx-auto mb-3 text-6xl"
              animate={won ? { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.2, 1] } : { y: [0, 6, 0] }}
              transition={{ duration: 1.2, delay: 1.2, repeat: won ? Infinity : 0, repeatDelay: 1.5 }}
            >
              {won ? '🏆' : '💔'}
            </motion.div>
            <h2 id="result-title" className={`bg-linear-to-r bg-clip-text text-3xl font-extrabold text-transparent ${won ? 'from-violet-500 via-fuchsia-500 to-amber-500' : 'from-rose-500 to-orange-500'}`}>
              {won ? 'Brilliant!' : 'Game over'}
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {won ? `You cracked this ${state.difficulty} puzzle.` : 'Three mistakes — the board wins this round.'}
            </p>

            {won && (
              <dl className="mt-5 grid grid-cols-3 gap-2 text-sm">
                {[
                  ['Time', formatTime(state.elapsed)],
                  ['Best', best !== undefined ? formatTime(best) : '—'],
                  ['Mistakes', String(state.mistakes)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-slate-100 py-2 dark:bg-slate-800">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">{k}</dt>
                    <dd className="font-mono text-lg font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNewGame(state.difficulty)}
                className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/30"
              >
                New {state.difficulty} game
              </motion.button>
              {!won && (
                <button type="button" onClick={onRestart} className="rounded-full py-2.5 font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Try this puzzle again
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
