import { motion } from 'motion/react'
import { boxOf, colOf, rowOf } from '../lib/sudoku'
import type { Action, GameState } from '../lib/game'

interface Props {
  state: GameState
  dispatch: (a: Action) => void
}

export function Board({ state, dispatch }: Props) {
  const { values, givens, solution, notes, selected, mistake, flash, status } = state
  const selValue = selected !== null ? values[selected] : 0
  const flashSet = new Set(flash?.cells)
  const origin = selected ?? 40

  return (
    <motion.div
      role="grid"
      aria-label="Sudoku board"
      className={`grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-white shadow-xl shadow-violet-500/10 transition-[filter] duration-700 dark:border-slate-400/60 dark:bg-slate-900 ${status === 'lost' ? 'grayscale-[.7]' : ''}`}
      animate={status === 'lost' ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
      transition={{ duration: 0.5 }}
    >
      {values.map((value, i) => {
        const r = rowOf(i)
        const c = colOf(i)
        const isSelected = i === selected
        const isPeer =
          selected !== null && !isSelected && (rowOf(selected) === r || colOf(selected) === c || boxOf(selected) === boxOf(i))
        const isSame = !!selValue && value === selValue && !isSelected
        const isGiven = givens[i] !== 0
        const isWrong = value !== 0 && value !== solution[i]

        const border = [
          c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-slate-700/80 dark:border-r-slate-400/60' : c !== 8 ? 'border-r border-r-slate-200 dark:border-r-slate-700' : '',
          r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-slate-700/80 dark:border-b-slate-400/60' : r !== 8 ? 'border-b border-b-slate-200 dark:border-b-slate-700' : '',
        ].join(' ')

        const bg = isSelected
          ? 'bg-linear-to-br from-violet-500 to-fuchsia-500 text-white'
          : isWrong
            ? 'bg-rose-100 dark:bg-rose-500/20'
            : isSame
              ? 'bg-violet-200 dark:bg-violet-500/35'
              : isPeer
                ? 'bg-violet-50 dark:bg-violet-400/10'
                : ''

        const text = isSelected
          ? ''
          : isWrong
            ? 'text-rose-500'
            : isGiven
              ? 'text-slate-800 dark:text-slate-100'
              : 'text-violet-600 dark:text-violet-300'

        // Wave outward from the selected cell when a row/column/box completes.
        const dist = Math.abs(rowOf(origin) - r) + Math.abs(colOf(origin) - c)

        return (
          <motion.button
            key={`${i}-${mistake?.cell === i ? mistake.id : 0}`}
            type="button"
            role="gridcell"
            aria-label={`Row ${r + 1}, column ${c + 1}${value ? `, ${value}` : ', empty'}`}
            aria-selected={isSelected}
            onClick={() => dispatch({ type: 'select', cell: i })}
            className={`relative flex min-h-0 min-w-0 items-center justify-center text-[clamp(1.1rem,5.2vw,1.9rem)] font-medium outline-none transition-colors duration-150 select-none ${border} ${bg} ${text} ${isGiven ? 'font-semibold' : ''}`}
            animate={mistake?.cell === i ? { x: [0, -5, 5, -4, 4, -2, 0] } : undefined}
            transition={{ duration: 0.4 }}
          >
            {flash && flashSet.has(i) && (
              <motion.span
                key={flash.id}
                className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-300 via-pink-400 to-violet-500"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.85, 0], scale: [0.4, 1, 1] }}
                transition={{ duration: 0.7, delay: dist * 0.045, ease: 'easeOut' }}
              />
            )}
            {value ? (
              <motion.span
                key={value}
                className="relative"
                initial={isGiven ? false : { scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              >
                {value}
              </motion.span>
            ) : notes[i] ? (
              <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[6%] text-[clamp(.5rem,2vw,.72rem)] leading-none font-medium">
                {Array.from({ length: 9 }, (_, n) => {
                  const has = (notes[i] & (1 << (n + 1))) !== 0
                  return (
                    <span
                      key={n}
                      className={`flex items-center justify-center ${
                        isSelected ? 'text-white/90' : has && selValue === n + 1 ? 'rounded-sm bg-violet-500 text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {has ? n + 1 : ''}
                    </span>
                  )
                })}
              </span>
            ) : null}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
