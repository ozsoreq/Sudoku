// Board representation: flat array of 81 cells, 0 = empty, 1-9 = digit.
export type Board = number[]

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

// How many clues remain after digging holes, per difficulty.
export const CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 27,
  expert: 23,
}

export const rowOf = (i: number) => Math.floor(i / 9)
export const colOf = (i: number) => i % 9
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3)

// PEERS[i] = every cell sharing a row, column or box with i (excluding i).
export const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => {
  const peers: number[] = []
  for (let j = 0; j < 81; j++) {
    if (j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))) {
      peers.push(j)
    }
  }
  return peers
})

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function candidates(board: Board, i: number): number[] {
  const used = new Set<number>()
  for (const p of PEERS[i]) used.add(board[p])
  const out: number[] = []
  for (let d = 1; d <= 9; d++) if (!used.has(d)) out.push(d)
  return out
}

// Pick the empty cell with the fewest candidates (MRV heuristic). Returns -1 when full.
function bestEmptyCell(board: Board): { index: number; options: number[] } {
  let best = { index: -1, options: [] as number[] }
  let bestCount = 10
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue
    const opts = candidates(board, i)
    if (opts.length < bestCount) {
      best = { index: i, options: opts }
      bestCount = opts.length
      if (bestCount <= 1) break
    }
  }
  return best
}

/** Counts solutions up to `limit` (used to verify uniqueness). */
export function countSolutions(board: Board, limit = 2): number {
  const b = [...board]
  let count = 0
  const solve = (): boolean => {
    const { index, options } = bestEmptyCell(b)
    if (index === -1) {
      count++
      return count >= limit
    }
    for (const d of options) {
      b[index] = d
      if (solve()) return true
    }
    b[index] = 0
    return false
  }
  solve()
  return count
}

function fillBoard(rand: () => number): Board {
  const b: Board = new Array(81).fill(0)
  const solve = (): boolean => {
    const { index, options } = bestEmptyCell(b)
    if (index === -1) return true
    for (const d of shuffle(options, rand)) {
      b[index] = d
      if (solve()) return true
    }
    b[index] = 0
    return false
  }
  solve()
  return b
}

export interface Puzzle {
  puzzle: Board
  solution: Board
}

/** Generates a puzzle with exactly one solution. */
export function generate(difficulty: Difficulty, rand: () => number = Math.random): Puzzle {
  const solution = fillBoard(rand)
  const puzzle = [...solution]
  const target = CLUES[difficulty]
  let clues = 81

  // Dig symmetric pairs of holes, keeping the solution unique.
  for (const i of shuffle([...Array(41).keys()], rand)) {
    if (clues <= target) break
    const mirror = 80 - i
    const removed = i === mirror ? 1 : 2
    if (clues - removed < target) continue
    const saved = [puzzle[i], puzzle[mirror]]
    puzzle[i] = 0
    puzzle[mirror] = 0
    if (countSolutions(puzzle) !== 1) {
      puzzle[i] = saved[0]
      puzzle[mirror] = saved[1]
    } else {
      clues -= removed
    }
  }
  return { puzzle, solution }
}
