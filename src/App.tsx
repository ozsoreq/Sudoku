import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useReducer, useState } from 'react'
import { syncStatusBar } from './lib/native'
import { Board } from './components/Board'
import { NumberPad, Toolbar } from './components/Controls'
import { Header } from './components/Header'
import { ResultDialog } from './components/ResultDialog'
import { loadGame, newGame, reducer, saveGame } from './lib/game'
import type { Difficulty } from './lib/sudoku'

const BEST_KEY = 'sudoku:best:v1'

function readBest(): Partial<Record<Difficulty, number>> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e']
  const end = Date.now() + 2200
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  setTimeout(() => confetti({ particleCount: 180, spread: 120, startVelocity: 45, origin: { y: 0.45 }, colors, shapes: ['star', 'circle'], scalar: 1.2 }), 400)
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadGame() ?? newGame('easy'))
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => saveGame(state), [state])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    syncStatusBar(dark)
    try {
      localStorage.setItem('sudoku:theme', dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  // Timer runs only while playing and the tab is visible.
  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') dispatch({ type: 'tick' })
    }, 1000)
    return () => clearInterval(id)
  }, [state.status])

  // The win's own time counts toward the best shown in the dialog.
  const stored = readBest()[state.difficulty]
  const best = state.status === 'won' && (stored === undefined || state.elapsed < stored) ? state.elapsed : stored

  useEffect(() => {
    if (state.status !== 'won') return
    celebrate()
    const all = readBest()
    const prev = all[state.difficulty]
    if (prev !== undefined && prev <= state.elapsed) return
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify({ ...all, [state.difficulty]: state.elapsed }))
    } catch {
      // ignore
    }
  }, [state.status, state.difficulty, state.elapsed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey) return
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        return dispatch({ type: 'undo' })
      }
      if (e.ctrlKey) return
      const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
      if (moves[e.key]) {
        e.preventDefault()
        const [dr, dc] = moves[e.key]
        return dispatch({ type: 'move', dr, dc })
      }
      if (/^[1-9]$/.test(e.key)) return dispatch({ type: 'input', digit: Number(e.key) })
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') return dispatch({ type: 'erase' })
      if (e.key.toLowerCase() === 'n') return dispatch({ type: 'toggleNotes' })
      if (e.key.toLowerCase() === 'h') return dispatch({ type: 'hint' })
      if (e.key === 'Escape') return dispatch({ type: 'select', cell: null })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const startNew = (d: Difficulty) => dispatch({ type: 'new', difficulty: d })

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden px-4 pt-[max(1.5rem,var(--safe-area-inset-top,env(safe-area-inset-top)))] pb-[max(1.5rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] sm:items-center">
      <div aria-hidden className="blob top-[-10%] left-[-10%] size-[45vmax] bg-violet-400" />
      <div aria-hidden className="blob right-[-15%] bottom-[-10%] size-[40vmax] bg-pink-400 [animation-delay:-7s]" />
      <div aria-hidden className="blob top-[30%] right-[20%] size-[25vmax] bg-amber-300 [animation-delay:-14s]" />

      {/* Red flash around the screen edges on every mistake. */}
      <AnimatePresence>
        {state.mistake && (
          <motion.div
            key={state.mistake.id}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-10 shadow-[inset_0_0_80px_rgba(244,63,94,.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative flex w-full max-w-[min(32rem,100%)] flex-col gap-5 rounded-[2rem] bg-white/55 p-4 shadow-2xl ring-1 shadow-violet-500/10 ring-white/60 backdrop-blur-xl sm:p-6 dark:bg-slate-900/55 dark:ring-white/10"
      >
        <Header state={state} onNewGame={startNew} dark={dark} onToggleTheme={() => setDark((d) => !d)} />
        <Board state={state} dispatch={dispatch} />
        <Toolbar state={state} dispatch={dispatch} />
        <NumberPad state={state} dispatch={dispatch} />
        <p className="hidden text-center text-xs text-slate-500 sm:block dark:text-slate-400">
          Arrows move · 1–9 enter · Backspace erase · N notes · H hint · Ctrl+Z undo
        </p>
      </motion.main>

      <ResultDialog state={state} best={best} onNewGame={startNew} onRestart={() => dispatch({ type: 'restart' })} />
    </div>
  )
}
