import { describe, expect, it } from 'vitest'
import { CLUES, PEERS, countSolutions, generate, type Difficulty } from './sudoku'

describe('generate', () => {
  for (const difficulty of Object.keys(CLUES) as Difficulty[]) {
    it(`builds a valid, uniquely solvable ${difficulty} puzzle`, () => {
      const { puzzle, solution } = generate(difficulty)

      for (let i = 0; i < 81; i++) {
        expect(solution[i]).toBeGreaterThanOrEqual(1)
        for (const p of PEERS[i]) expect(solution[p]).not.toBe(solution[i])
        if (puzzle[i] !== 0) expect(puzzle[i]).toBe(solution[i])
      }
      expect(countSolutions(puzzle)).toBe(1)
      expect(puzzle.filter(Boolean).length).toBeGreaterThanOrEqual(CLUES[difficulty])
    })
  }
})

describe('PEERS', () => {
  it('gives every cell 20 peers', () => {
    expect(PEERS.every((p) => p.length === 20)).toBe(true)
  })
})
