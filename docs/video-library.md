# Video library

The client's own films, judged from 12 frame contact sheets (plus denser sheets where a loop was needed) in `scripts/.video-cache/` (gitignored). Sources stay in `/Users/kait/Desktop/Freelance/Blake & Boky/` and are never modified. Web encodes live in `public/video/<slug>/`, made by `scripts/encode-video.sh <job>` (one job at a time, niced).

Deploy limit: Cloudflare Workers static assets, 25 MB per file. Long films are HLS with 6 s segments, so every file stays far below it.

| Source | What it shows | Length | Web slug | Used on |
|---|---|---|---|---|
| `BB 705 Prores 422.mov` (1080p25 ProRes) | "The Burning Buddha", Blake. A bronze seated Buddha figure engulfed in flame on a black mirror floor; close ups of the face and flames; human rights titles (Freedom of Movement, Due Process of Law, then country names) over the fire; ends "Support International Human Rights Organizations. You make the difference". | 6:06 | `burning-buddha` | Not placed (home page belongs to another agent). Hero candidate, see below. |
| `BR135201.mov` (1080p30 ProRes) | One slow tilt up a patinated bronze figure: lattice legs, torso, then the upturned head. Warm khaki wall; a faint mirrored "LICHTER" reflection sits on the wall at the left. | 0:07.6 | `bronze-tilt` | Not placed. Hero or ambient candidate. |
| `Chicago Invterview 2019.mov` (1550x868p60 h264) | Seated three person interview in a gallery: interviewer left, a blonde woman centre (likely Boky, the page credits her), a grey haired man right (likely Blake), bronzes behind. Locked wide shot throughout. | 27:35 | `chicago-interview` | `/past-works/chicago-interview-2019`, replaces the empty hero placeholder. |
| `Adrasteo Movie 1,01 - SD 480p.mov` (640x360) | Andromeda Adrasteo: 3D model turntable, then the lattice bronze on a grey gradient, slow moves over back, hips and arms; titles "ADRASTEO BLAKE" and "Music by Grant Ransom". | 1:09 | `adrasteo` | `/collections/andromeda/andromeda-adrasteo`, Film block after the text. |
| `blake audio_..._ext_presentation.mov` (1440x1080 HDV, interlaced) | Blake speaking to camera with a hand mic, grey concrete column, waterfront skyline through the window. | 21:52 | `blake-presentation` | `/blake-bio`, Film section. |
| `blake audio_..._ext_presentation-1.mov` (same camera) | Silent B-roll at the same venue: Blake's bronze torsos and figures on plinths against floor to ceiling windows and the river. No audio (both tracks measure about -83 dB). | 5:51 | `blake-sculptures` | `/blake-bio`, Film section, marked "No sound". |

Venue, city and date for the two presentation files are not in the material; the titles on the page ("Blake Ward, presentation" and "Sculptures, people, landscape", from the file name) are placeholders for the client to confirm.

## Encodes

- **HLS** (`burning-buddha`, `chicago-interview`, `blake-presentation`, `blake-sculptures`): `master.m3u8` with `1080/` and `540/` renditions, h264 High, AAC 128k stereo (none for the silent B-roll), keyframes forced every 6 s, 6 s TS segments. Chicago is the source size (1550x868, dropped from 60 to 30 fps, it is a locked seated interview). The HDV files are deinterlaced (yadif) and unsqueezed to 1920x1080. Burning Buddha gets a higher cap (6 Mbps) because flame is expensive to encode.
- **Posters**: `poster.jpg` (1920 wide, or source width) and `poster-1600.webp`.
- **Progressive** (`adrasteo`): `adrasteo-360.mp4` (h264 + AAC, faststart) and `adrasteo-360.webm` (VP9 + Opus). Kept at the 640x360 source size; the player is capped at 960px on the work page so it does not go soft.
- **Muted loops** (no audio track): `bronze-tilt/loop-1080.mp4`, `loop-720.mp4`, `loop-1080.webm`; `burning-buddha/loop-1080.mp4`, `loop-720.mp4`, `loop-1080.webm`, `loop-poster.jpg`.

## Poster frames and loop timecodes

| Slug | Poster | Loop |
|---|---|---|
| `burning-buddha` | 01:12.5, seated figure in flame with reflection, right two thirds empty black (room for type) | 02:00.2 to 02:07.2: locked profile shot of the kneeling figure in a column of flame, no titles. 6 s loop with a 1 s crossfade seam. Alternative 05:23.2 to 05:27.6 (frontal, but only 4.4 s before "Defend Human Rights" fades in). |
| `bronze-tilt` | 00:07.3, the upturned head and shoulders | Whole clip as a palindrome: up 00:00 to 00:07.55, then reversed back down, 15.1 s, seamless. |
| `chicago-interview` | 08:02, all three facing the room and smiling | none |
| `adrasteo` | 01:00.6, full figure, arms out, on the grey gradient | none |
| `blake-presentation` | 10:01, Blake mid sentence, looking into the lens | none |
| `blake-sculptures` | 00:30 | Shots are cut at 3.5, 9.9, 31.0, 54.5, 79.8, 104.4 s (scene detection) if an ambient excerpt is wanted later. |

## Components

- `src/components/VideoPlayer.astro`: poster with play ring and "Play film" label, then a minimal bar (play/pause, scrubber with buffered range, time, mute, fullscreen). Nothing loads before the press; HLS plays natively in Safari and through hls.js 1.5.13 (cdnjs, light build) elsewhere. Keys while focused: Space or K, M, F, arrows. One film plays at a time. Props: `video` (the JSON record), `tone` ("dark" | "light" | "grey"), `caption`.
- `src/components/AmbientVideo.astro`: muted loop over an always present poster. Sources arm a screen ahead, play only while in view and the tab is visible, pause button for WCAG 2.2.2, no video request at all under reduced motion.

## Data

`video` on an item (`past-works.json` chicago-interview-2019, `works.json` andromeda-adrasteo) and `videos` on `pages/blake-bio.json`:

```json
{ "hls": "/video/<slug>/master.m3u8", "poster": "/video/<slug>/poster.jpg", "posterWebp": "/video/<slug>/poster-1600.webp",
  "title": "...", "eyebrow": "Film", "duration": "27:35", "ratio": "1550 / 868", "caption": "...", "silent": false }
```

Use `mp4` (and optional `webm`) instead of `hls` for short progressive files.
