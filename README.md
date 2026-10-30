# ARVORA — by Arnav Tiwari (PWA v2)

ARVORA is a responsive, installable Progressive Web App starter. It runs in modern browsers on Android, iOS, Windows, macOS and Linux.

## Run locally
Requires Python 3:
```bash
python -m http.server 8080
```
Open `http://localhost:8080`.

## Publish for everyone
Upload the contents of this folder to a static HTTPS host such as GitHub Pages, Cloudflare Pages or Netlify. HTTPS is required for service workers and normal PWA installation. Share the deployed HTTPS address.

## Install on phones and computers
- Android/desktop Chromium browsers: open the deployed HTTPS site and use **Install app** (or the browser menu).
- iPhone/iPad: open in Safari → Share → Add to Home Screen.
- Other browsers: use their equivalent install/add-to-home-screen option if supported.

## Current features
- Responsive glass-inspired interface and mobile navigation
- Installable PWA manifest, service worker, app icons and offline app shell
- Local audio playback from files selected on the device
- Liked tracks stored in browser local storage
- Public iTunes catalog search with short previews where available
- Load `.lrc` files for line-synced lyrics
- Keyboard play/pause shortcut (Space) and reduced-motion support

## Important limitations (honest status)
This is a working PWA starter, not yet a commercial streaming service. It does not provide unrestricted full-song streaming or copyrighted music downloads. Catalog search currently offers short previews only where the provider supplies them. Full-length streaming, high-quality offline downloads and online lyrics require licensed providers and their API terms. Lyrics currently sync by line from user-selected `.lrc` files; word-by-word karaoke needs timed word-level lyric data. Local audio and favourites are stored per browser/device and are not cloud-synced. Native APK/EXE installers are not included; this PWA can be installed from its HTTPS website where the browser supports installation.

## Next engineering steps
1. Deploy on HTTPS and test installation across target browsers.
2. Add a licensed full-track provider and permitted download flow.
3. Integrate a licensed lyrics API with line/word timing.
4. Add accounts and encrypted cloud sync if cross-device library sync is needed.
5. Build native Android/desktop wrappers only if store distribution or deeper OS integration is required.
