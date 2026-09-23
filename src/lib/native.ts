import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'

/** In the Android app, match the status bar icons to the current theme. No-op on the web. */
export function syncStatusBar(dark: boolean) {
  if (!Capacitor.isNativePlatform()) return
  SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {})
}
