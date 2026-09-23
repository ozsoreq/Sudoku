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
| Android app | [Capacitor](https://capacitorjs.com) |
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

## Android app

The `android/` folder is a [Capacitor](https://capacitorjs.com) project that wraps the web build in a native app.

**Get the APK:** every push runs `.github/workflows/android.yml`, which builds `Sudoku.apk` and publishes it on the repo's **Releases** page. Open that page on your phone, download `Sudoku.apk`, and allow your browser to "install unknown apps" when asked.

**Signed builds (recommended):** without signing secrets the workflow makes a debug APK, which each new build may need uninstalling first (losing saved progress). To get a release APK that installs as an update, create a keystore once and keep it safe:

```bash
keytool -genkeypair -v -keystore sudoku-release.jks -alias sudoku -keyalg RSA -keysize 2048 -validity 10000
```

Then add these repository secrets (*Settings → Secrets and variables → Actions*):

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | the keystore file, base64-encoded (`base64 -w0 sudoku-release.jks`, or in PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes("sudoku-release.jks"))`) |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `sudoku` |
| `ANDROID_KEY_PASSWORD` | key password |

**Build locally** (needs JDK 21 and the Android SDK, e.g. via Android Studio):

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug   # APK in app/build/outputs/apk/debug/
```

Or run `npx cap open android` to open the project in Android Studio. App icons and splash screens are generated from `assets/` with `npx capacitor-assets generate --android`.
