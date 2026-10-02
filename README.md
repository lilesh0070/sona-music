# Sona — Find your frequency

A complete, original music discovery and streaming application built with React, JavaScript, Vite, HTML5, CSS3 and React Router. Sona combines an expressive dark interface with a persistent global audio player and a personal library stored on your device. It runs entirely in the browser and is ready for GitHub Pages.

## Features

- Home with trending music, new releases, independent artists, genre collections, mood mixes, continue listening and personalized discovery.
- Debounced search across songs, artists, albums, genres and your saved playlists; search history and filters.
- Full available track playback, seeking, volume, mute, shuffle, repeat one/all, automatic next track, persistent queue and fullscreen player.
- Queue additions, play next, removal, reordering and clearing upcoming tracks.
- Liked songs, playlist creation/rename/delete, track management, play all and shuffle; deletion confirmation and generated artwork collages.
- Dedicated artist, album/single, genre, library, history and profile pages.
- Weighted local recommendations with artist diversity, recent-track suppression and listening/skip signals.
- Desktop sidebar, tablet navigation, mobile bottom navigation and mini-player, lazy routes/images, loading skeletons, retry states, toasts and accessible controls.

## Stack and installation

Requires Node.js 20.19+ (Node 22 LTS recommended) and npm. No server or private API credentials are needed.

```sh
npm install
npm run dev
npm run build
npm run deploy
```

`npm run dev` starts the local development server. `npm run build` outputs the production app in `dist`. `npm run preview` serves that build locally. `npm test` checks the recommendation scoring, diversity and time formatting.

## GitHub Pages deployment

1. Create a GitHub repository and push this project into its root.
2. Make sure the local Git repository has an `origin` remote pointing to that repository.
3. Run `npm run deploy`. The `gh-pages` package publishes the built `dist` folder to the `gh-pages` branch.
4. In GitHub repository **Settings → Pages**, select **Deploy from a branch**, choose **gh-pages** and **/(root)**, then save.
5. Visit `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`.

Vite defaults to a relative base (`./`) so assets work under repository subpaths and custom domains. Override with `VITE_BASE_PATH=/YOUR_REPOSITORY/` when an absolute base is desired. React Router uses hash URLs (`/#/artist/id`) so refreshing or sharing nested pages works on GitHub Pages without a rewrite server. The deploy script does not include source files or dependencies in the published branch.

## Architecture

```text
src/
  components/
    layout/        # navigation and shell
    player/        # global player, progress, volume and queue
    cards/         # track cards, lists and context menus
    common/        # accessible modal, artwork, loading/empty states
  context/
    PlayerContext.jsx
    LibraryContext.jsx
  hooks/           # asynchronous requests, search, recommendations, storage
  pages/           # route screens, loaded on demand
  services/
    musicApi.js
    storageService.js
    recommendationEngine.js
    analytics.js
  styles/          # theme variables and responsive styles
  utils/           # duration and number formatting
tests/             # behavior-based recommendation tests
public/            # favicon and fallback artwork
```

Related small page components share modules to avoid unnecessary files. `PlayerContext` owns one HTML5 audio element outside route transitions. `LibraryContext` owns playlists, likes, history and profile state. Components use the storage service instead of reading localStorage directly.

## Music API and catalog

Sona uses the [Audius REST API](https://api.audius.co/v1) and [official Audius developer documentation](https://docs.audius.co/). Read-only public endpoints provide tracks, artists, search, album metadata, artwork and full stream endpoints. Requests fail over between public providers, time out, cache briefly and honor cancellation. Stream failures retry fresh provider URLs and available mirrors. Gated, deleted or explicitly non-streamable tracks are filtered out; stream restrictions are never bypassed.

This is the **Audius independent catalog**, not Spotify’s catalog. Specific mainstream artists, languages or genres may be absent. Album pages show real API albums; a track without an album backlink opens an explicitly labeled single-release page. Track lengths are not limited to previews. Availability, artwork, rate limits and uptime are controlled by the provider. All API artwork and recordings belong to their respective creators; this project does not bundle or redistribute audio files. Links to artists on Audius support attribution. The favicon and Sona identity are original.

## Local storage and recommendations

Keys use the `sona_` prefix: `liked`, `history`, `playlists`, `preferences`, `search_history`, `player_state`, `settings`, `events`. History is limited to 100 unique tracks, events to 800, preferences to 500 tracks and recent searches to 12. Player restores the last queue, position and settings in a paused state to respect browser autoplay rules. Storage failures use an in-memory fallback and notify the user. Profile names are local display labels, not authenticated identities. Data stays in this browser; there is no cross-device synchronization or external analytics.

Local events include `track_started`, `track_completed`, `track_skipped`, `track_liked`, `track_unliked`, `playlist_added`, `search_performed`, `artist_opened` and `listening_time`. Playback time is counted while audio advances, excluding seeks. Recommendations weight liked artists (+12), liked genres (+10), playlist affinity (+8), repeat plays (+6), completions (+5), recent genre affinity (+4) and early skip penalties (−5; additional artist penalty −4). Artist diversity and a recent-play penalty help avoid repetitive mixes.

## Keyboard and accessibility

- **Space**: play/pause.
- **Left/Right**: seek backward/forward 10 seconds.
- **M**: mute/unmute.
- Dialogs support Escape, focus trapping and focus restoration. Inputs, buttons and links retain normal keyboard behavior.
- Reduced-motion preferences disable decorative animation. Artwork failures fall back to the bundled graphic.

## Screenshots

Add desktop and mobile screenshots here when customizing the catalog or brand. The deliverable includes verification notes for this build.

## Future features

Optional account synchronization, additional licensed catalogs, offline PWA support and richer provider-supported artist relationships could be added later. They are not required to run this version.

## License

Application source is MIT licensed. Third-party recordings, artist images and API content remain subject to their creators’ rights and provider terms.
