import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.ozsoreq.sudoku',
  appName: 'Sudoku',
  webDir: 'dist',
  backgroundColor: '#0f0a1e',
  plugins: {
    // Draw edge-to-edge; the page pads itself using the injected --safe-area-inset-* values.
    SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover' },
  },
}

export default config
