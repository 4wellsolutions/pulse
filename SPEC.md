# PULSE — brief

GOAL:   The viewer feels a heart stop and start again, and remembers one image: a single line of light that runs
        out of a hospital monitor, draws the whole world, and comes back as a heartbeat.
OUTPUT: 1080 x 1920 (9:16), 24 fps, 56 s, wordless. One canvas drawn from film time (`window.renderAt(t)`).
TIME:   120 BPM, a bar is 2 s. Every cut, entry and hit sits on the half-second grid.

LOOK:   - ground: night blue-black #070B18 with fine grain
        - the line: one unbroken stroke of light. Monitor green #4DFFA0 at the start, warming to gold #FFD166 as
          it collects rhythms, grey in the fog, white-gold on the way home
        - the world: line art only, revealed as the line passes and left behind as a dim blue trace #2B3A6E.
          Nothing is filled except to hide what is behind it, lit windows, and the hospital room
        - each place has one colour, seen only in its rhythm: rain cyan, train amber, dhol pink, rope violet, sea teal
        - five beads follow the head of the line, one per rhythm collected
        - full colour exists once: the hospital room from the first new beep (49.5 s)
MOTION: The line moves on ones (it is light). People move on twos (12 poses a second). Everything that makes a
        sound moves on its hit. Impact frames (1 inverted, 1 gold, 1 white) at the spike and the first new beep.
SOUND:  The score is built on screen. A faint heartbeat, then each place adds one layer and keeps it:
        rain = ticking drops, train = clack and bass, dhol = the drive, rope = claps and a small tune, sea = the chords.
        The fog takes the layers away one by one to silence. After the laugh all of them play together.
SHOTS:  s01  0.0- 5.0  hospital room at night; beeps at 0.5, 1.5, 2.7; flat at 3.2; the last blip stirs,     | beep x3, flat tone
                       slides to the edge of the monitor and runs out of the window
        s02  5.0- 7.3  outside: the line drops down the hospital wall and runs along the street            | faint heartbeat
        s03  7.3-12.3  rooftops in rain; drops ring on tin roofs                                           | + rain ticks (8.0)
        s04 12.3-17.3  railway viaduct; the line is the rail; a steam train overtakes                      | + train clack, bass (12.0)
        s05 17.3-23.3  wedding street; the line becomes the string of lights; dhol player, dancers          | + dhol (18.0)
        s06 23.3-27.3  alley; the line becomes the skipping rope                                           | + claps, tune (24.0)
        s07 27.3-32.3  pier and open sea; the line rides the waves past a boat and a lighthouse             | + chords, wave crash (28.0)
        s08 32.3-38.4  snow field in fog; layers drop out at 32, 33, 34, 35, 36; the line slows, thins,     | to silence; flat tone returns
                       goes flat and grey; beads go dark
        s09 38.4-41.0  a far window lights; a child laughs; one huge spike at 39.0; beads relight          | laugh, thump, riser
        s10 41.0-47.0  the run home, right to left, six times faster, every rhythm at once                  | full score + theme
        s11 47.0-53.0  the room: the line dives into the monitor; silence; BEEP at 49.5; fingers close;     | silence, beep, warm chord
                       dawn colour floods in; the girl wakes
        s12 53.0-56.0  the trace writes PULSE in one stroke; last beep at 55.0                              | last beep
BANNED: text other than the title; a HUD; glow on anything that is not the line or a rhythm; smooth easing on
        people; fades between shots; any place without a visible source for its rhythm.
QA:     0.3 room reads (bed, girl, monitor); 3.4 flat line; 9 rain on roofs; 14.5 train; 20 dhol player reads;
        25.2 rope reads as a skipping rope; 30 boat + waves; 37.5 near-empty frame that still reads; 39.0 spike;
        43 speed; 49.6 beep; 52 dawn colour; 54.8 PULSE legible.
