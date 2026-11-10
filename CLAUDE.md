# PULSE — guide for coding agents

A 56 s wordless film drawn in code (Canvas 2D), in 9:16 and 1:1.

- Read `SPEC.md` before changing anything: look rules, motion rules, shot list with sound cues, banned list, QA frames.
- `src/core.js` holds the timeline `T`, the rhythm `LAYERS` and the path `ground(x, t)`. `tools/make-audio.py` repeats
  the same `LAYERS` numbers: change a pattern or a time in one and change it in the other.
- Formats: `SQ` in `src/core.js` (URL `?ar=1x1`). Anything placed on the screen must work for both heights.
- Every path in the tools is relative to the repository root. Do not add absolute paths, machine names or keys.
- Preview: open `index.html` in a Chromium browser. Check stills with
  `node tools/render.mjs stills <9x16|1x1> <seconds...>` and look at them before rendering.
- Render: `node tools/render.mjs film <9x16|1x1>` (1,344 frames).
- Audio: `python tools/make-audio.py`. You cannot hear it: report the loudness numbers it prints and ask a person
  to listen.
- `renders/*.mp4` and `assets/audio/score.mp3` are committed. `frames/`, `preview/`, `node_modules/`,
  `assets/audio/score.wav` and `assets/sfx/` are not.
