# Sudoku

A colourful, modern Sudoku game that runs entirely in the browser.

## Features

- Puzzle generator with four difficulties (easy → expert), each puzzle guaranteed to have a unique solution
- Pencil notes, undo, erase, 3 hints, 3 lives, timer and best time per difficulty
- Highlighting of the selected row, column, box and matching digits
- Animations: springy digit pop-in, shake and red edge flash on mistakes, rainbow wave when a row/column/box is completed, confetti on win
- Light and dark themes, full keyboard support, progress saved in `localStorage`

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [React 19](https://react.dev) + TypeScript |
| Build tool | [Vite](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animation | [Motion](https://motion.dev) (formerly Framer Motion) |
| Celebration | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Tests / lint | Vitest, oxlint |

## Development

```bash
npm install
npm run dev      # start dev server
npm test         # run unit tests
npm run lint
npm run build    # production build into dist/
```

## Keyboard

Arrows move · `1`–`9` enter · `Backspace`/`Delete` erase · `N` toggle notes · `H` hint · `Ctrl+Z` undo · `Esc` deselect

## Deploying

The build is a static site (`dist/`) with relative asset paths, so it can be hosted anywhere:

- **GitHub Pages**: `.github/workflows/deploy.yml` builds and deploys on every push to `main`. Enable it under *Settings → Pages → Source: GitHub Actions*.
- **Vercel / Netlify / Cloudflare Pages**: import the repo; build command `npm run build`, output directory `dist`.
