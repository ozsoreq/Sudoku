import { describe, expect, it } from 'vitest'
import { MAX_MISTAKES, newGame, reducer, type GameState } from './game'
import { PEERS } from './sudoku'

const firstEmpty = (s: GameState) => s.givens.findIndex((v) => v === 0)
const wrongDigit = (s: GameState, cell: number) => (s.solution[cell] % 9) + 1

describe('reducer', () => {
  it('counts mistakes and ends the game after the limit', () => {
    let s = newGame('easy')
    const cell = firstEmpty(s)
    s = reducer(s, { type: 'select', cell })
    for (let i = 0; i < MAX_MISTAKES; i++) {
      s = reducer(s, { type: 'erase' })
      s = reducer(s, { type: 'input', digit: wrongDigit(s, cell) })
    }
    expect(s.mistakes).toBe(MAX_MISTAKES)
    expect(s.status).toBe('lost')
  })

  it('clears the placed digit from peer notes, and undo restores them', () => {
    let s = newGame('easy')
    const cell = firstEmpty(s)
    const digit = s.solution[cell]
    const peer = PEERS[cell].find((p) => s.givens[p] === 0)!
    s = reducer(s, { type: 'select', cell: peer })
    s = reducer(s, { type: 'toggleNotes' })
    s = reducer(s, { type: 'input', digit })
    expect(s.notes[peer]).toBe(1 << digit)

    s = reducer(s, { type: 'toggleNotes' })
    s = reducer(s, { type: 'select', cell })
    s = reducer(s, { type: 'input', digit })
    expect(s.values[cell]).toBe(digit)
    expect(s.notes[peer]).toBe(0)

    s = reducer(s, { type: 'undo' })
    expect(s.values[cell]).toBe(0)
    expect(s.notes[peer]).toBe(1 << digit)
  })

  it('wins when every cell is filled correctly', () => {
    let s = newGame('easy')
    s.givens.forEach((v, i) => {
      if (v) return
      s = reducer(s, { type: 'select', cell: i })
      s = reducer(s, { type: 'input', digit: s.solution[i] })
    })
    expect(s.status).toBe('won')
    expect(s.mistakes).toBe(0)
  })

  it('does not let givens be changed', () => {
    let s = newGame('easy')
    const given = s.givens.findIndex(Boolean)
    s = reducer(s, { type: 'select', cell: given })
    s = reducer(s, { type: 'input', digit: wrongDigit(s, given) })
    expect(s.values[given]).toBe(s.givens[given])
    expect(s.mistakes).toBe(0)
  })
})
