import { PEERS, boxOf, colOf, generate, rowOf, type Board, type Difficulty } from './sudoku'

export const MAX_MISTAKES = 3
export const MAX_HINTS = 3

export type Status = 'playing' | 'won' | 'lost'

interface Snapshot {
  values: Board
  notes: number[]
}

export interface GameState {
  difficulty: Difficulty
  givens: Board
  solution: Board
  values: Board
  /** Bitmask of pencil marks per cell (bit d set = note d). */
  notes: number[]
  selected: number | null
  notesMode: boolean
  mistakes: number
  hintsLeft: number
  elapsed: number
  status: Status
  history: Snapshot[]
  /** Transient animation triggers; `id` changes every time one fires. */
  mistake: { cell: number; id: number } | null
  flash: { cells: number[]; id: number } | null
}

export type Action =
  | { type: 'new'; difficulty: Difficulty }
  | { type: 'restart' }
  | { type: 'select'; cell: number | null }
  | { type: 'move'; dr: number; dc: number }
  | { type: 'input'; digit: number }
  | { type: 'erase' }
  | { type: 'undo' }
  | { type: 'hint' }
  | { type: 'toggleNotes' }
  | { type: 'tick' }

export function newGame(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generate(difficulty)
  return {
    difficulty,
    givens: puzzle,
    solution,
    values: [...puzzle],
    notes: new Array(81).fill(0),
    selected: null,
    notesMode: false,
    mistakes: 0,
    hintsLeft: MAX_HINTS,
    elapsed: 0,
    status: 'playing',
    history: [],
    mistake: null,
    flash: null,
  }
}

const snapshot = (s: GameState): Snapshot => ({ values: s.values, notes: s.notes })

// Cells of each unit (row, column, box) the given cell belongs to that are now fully correct.
function completedUnits(values: Board, solution: Board, cell: number): number[] {
  const units = [
    (i: number) => rowOf(i) === rowOf(cell),
    (i: number) => colOf(i) === colOf(cell),
    (i: number) => boxOf(i) === boxOf(cell),
  ]
  const cells = new Set<number>()
  for (const inUnit of units) {
    const members = [...Array(81).keys()].filter(inUnit)
    if (members.every((i) => values[i] === solution[i])) members.forEach((i) => cells.add(i))
  }
  return [...cells]
}

// Place the correct digit at `cell`, clear that digit from peers' notes, and detect completion.
function placeCorrect(s: GameState, cell: number, digit: number): GameState {
  const values = [...s.values]
  values[cell] = digit
  const notes = [...s.notes]
  notes[cell] = 0
  for (const p of PEERS[cell]) notes[p] &= ~(1 << digit)

  const won = values.every((v, i) => v === s.solution[i])
  const done = completedUnits(values, s.solution, cell)
  return {
    ...s,
    values,
    notes,
    history: [...s.history, snapshot(s)],
    status: won ? 'won' : s.status,
    flash: won ? { cells: [...Array(81).keys()], id: Date.now() } : done.length ? { cells: done, id: Date.now() } : s.flash,
  }
}

export function reducer(s: GameState, a: Action): GameState {
  if (a.type === 'new') return newGame(a.difficulty)
  if (a.type === 'restart') {
    return { ...s, values: [...s.givens], notes: new Array(81).fill(0), mistakes: 0, hintsLeft: MAX_HINTS, elapsed: 0, status: 'playing', history: [], selected: null, mistake: null, flash: null }
  }
  if (a.type === 'select') return { ...s, selected: a.cell }
  if (a.type === 'move') {
    const cur = s.selected ?? 40
    const r = (rowOf(cur) + a.dr + 9) % 9
    const c = (colOf(cur) + a.dc + 9) % 9
    return { ...s, selected: r * 9 + c }
  }
  if (a.type === 'toggleNotes') return { ...s, notesMode: !s.notesMode }

  if (s.status !== 'playing') return s

  if (a.type === 'tick') return { ...s, elapsed: s.elapsed + 1 }

  if (a.type === 'undo') {
    const prev = s.history.at(-1)
    if (!prev) return s
    return { ...s, ...prev, history: s.history.slice(0, -1) }
  }

  if (a.type === 'hint') {
    if (s.hintsLeft === 0) return s
    let cell = s.selected
    if (cell === null || s.values[cell] === s.solution[cell]) {
      const empties = s.values.flatMap((v, i) => (v !== s.solution[i] ? [i] : []))
      if (!empties.length) return s
      cell = empties[Math.floor(Math.random() * empties.length)]
    }
    return { ...placeCorrect(s, cell, s.solution[cell]), hintsLeft: s.hintsLeft - 1, selected: cell }
  }

  const cell = s.selected
  if (cell === null || s.givens[cell] !== 0) return s
  // A correctly placed digit is locked in.
  if (s.values[cell] === s.solution[cell]) return s

  if (a.type === 'erase') {
    if (!s.values[cell] && !s.notes[cell]) return s
    const values = [...s.values]
    const notes = [...s.notes]
    values[cell] = 0
    notes[cell] = 0
    return { ...s, values, notes, history: [...s.history, snapshot(s)] }
  }

  // a.type === 'input'
  const { digit } = a
  if (s.notesMode) {
    if (s.values[cell]) return s
    const notes = [...s.notes]
    notes[cell] ^= 1 << digit
    return { ...s, notes, history: [...s.history, snapshot(s)] }
  }
  if (s.values[cell] === digit) return s
  if (digit === s.solution[cell]) return placeCorrect(s, cell, digit)

  const values = [...s.values]
  values[cell] = digit
  const mistakes = s.mistakes + 1
  return {
    ...s,
    values,
    mistakes,
    history: [...s.history, snapshot(s)],
    status: mistakes >= MAX_MISTAKES ? 'lost' : s.status,
    mistake: { cell, id: Date.now() },
  }
}

const STORAGE_KEY = 'sudoku:game:v1'

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState
    return s.status === 'playing' ? { ...s, mistake: null, flash: null } : null
  } catch {
    return null
  }
}

export function saveGame(s: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, history: s.history.slice(-100) }))
  } catch {
    // Storage may be unavailable (private mode); the game still works without it.
  }
}
