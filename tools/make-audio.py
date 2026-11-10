"""Score and sound for PULSE: a rhythm score built layer by layer, written note by note
(120 BPM, one beat = 0.5 s; the layer patterns are the ones src/core.js uses to move the picture), plus a few
recorded sounds from assets/sfx under it.
usage: python tools/make-audio.py -> assets/audio/score.wav, score.mp3
"""
import subprocess
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
import soundfile as sf

HERE = Path(__file__).parent.parent / "assets" / "audio"
SFX = HERE.parent / "sfx"
SR, TOTAL, BEAT = 48000, 56.0, 0.5
N = int(SR * (TOTAL + 3))
rng = np.random.default_rng(11)
dry = np.zeros((N, 2)); send = np.zeros((N, 2))
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)
tt = lambda dur: np.arange(int(dur * SR)) / SR


def filt(a, f, kind="low", order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), a, axis=0)


def ar(n, a, r):
    e = np.ones(n); i, o = min(n, int(a * SR)), min(n, int(r * SR))
    if i: e[:i] = np.linspace(0, 1, i)
    if o: e[-o:] *= np.linspace(1, 0, o)
    return e


def add(sig, beat, gain=1.0, pan=0.0, rev=0.3):
    s = int(beat * BEAT * SR)
    if s >= N: return
    sig = sig[: N - s] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    st = np.stack([sig * l, sig * r], 1) * 1.414
    dry[s:s + len(sig)] += st; send[s:s + len(sig)] += st * rev


# ---------- instruments ----------
def celesta(m, dur=1.6):
    t = tt(dur); f = hz(m)
    y = np.sin(2 * np.pi * f * t + 2.0 * np.exp(-t * 7) * np.sin(2 * np.pi * f * 4 * t)) * np.exp(-t * 3.4)
    return (y + .25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)) * ar(len(t), .002, .05)


def pluck(m, dur=1.4, damp=1.0):
    t = tt(dur); f = hz(m); y = np.zeros(len(t))
    for n in range(1, 9):
        if n * f > 9000: break
        y += np.sin(2 * np.pi * n * f * t + n) / n ** 1.15 * np.exp(-t * damp * (2.2 + n * 1.3))
    return y * ar(len(t), .003, .04)


def strings(m, dur, vib=1.0, trem=0.0, att=.28, rel=.4):
    t = tt(dur + rel); f = hz(m); y = np.zeros(len(t))
    v = 1 + .0045 * vib * np.sin(2 * np.pi * 5.6 * t + rng.uniform(0, 6)) * np.clip((t - .25) / .4, 0, 1)
    for d in (-.006, 0, .007):
        ph = 2 * np.pi * np.cumsum(f * (1 + d) * v) / SR
        for n in range(1, int(min(12, 5200 // f)) + 1):
            y += np.sin(n * ph + n * 1.7) / n * np.exp(-n * .12)
    if trem: y *= 1 - trem * .5 * (1 + np.sign(np.sin(2 * np.pi * 13 * t)))
    return y / 3 * ar(len(t), att, rel)


def flute(m, dur):
    t = tt(dur + .08); f = hz(m)
    v = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .12) / .3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * v) / SR
    y = np.sin(ph) + .22 * np.sin(2 * ph) + .07 * np.sin(3 * ph)
    y += filt(rng.normal(0, 1, len(t)), [min(f * 1.5, 9000), min(f * 4, 12000)], "band") * .05
    return y * ar(len(t), .04, .08)


def horn(m, dur, bright=1.0):
    t = tt(dur + .15); f = hz(m); y = np.zeros(len(t)); e = np.clip(t / .06, 0, 1)
    for n in range(1, 11):
        if n * f > 7000: break
        y += np.sin(2 * np.pi * n * f * t + n * .9) / n ** (1.9 - .6 * bright) * e ** n
    return y * ar(len(t), .04, .15)


def piano(m, dur=2.4):
    t = tt(dur); f = hz(m); y = np.zeros(len(t))
    for n in range(1, 8):
        y += np.sin(2 * np.pi * n * f * (1 + .0004 * n * n) * t) / n ** 1.5 * np.exp(-t * (1.3 + .55 * n))
    return y * ar(len(t), .004, .1)


def bass(m, dur=.5):
    t = tt(dur); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 5) * ar(len(t), .004, .05) * .5


def drum(f0, f1, dur, decay, noise=0.0):
    t = tt(dur); f = f1 + (f0 - f1) * np.exp(-t * 28)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay)
    if noise: y += filt(rng.normal(0, 1, len(t)), 2500, "high") * np.exp(-t * 22) * noise
    return y * ar(len(t), .002, .03) * .6


def shaker(dur=.09):
    t = tt(dur); return filt(rng.normal(0, 1, len(t)), 6500, "high") * np.exp(-t * 45)


def cymbal(dur, swell=False):
    t = tt(dur); n = filt(rng.normal(0, 1, len(t)), 4200, "high")
    return n * ((t / dur) ** 2.2 * ar(len(t), 0, .12) if swell else np.exp(-t * 2.6) * ar(len(t), .004, .1))


def chord(fn, notes, beat, dur_beats, gain, spread=.5, rev=.4, **kw):
    for i, m in enumerate(notes):
        add(fn(m, dur_beats * BEAT, **kw), beat, gain, spread * (i / max(1, len(notes) - 1) * 2 - 1) * (1 if i % 2 else -1), rev)


def sfx(name, t, gain_db, pan=0.0, ratio=1.0, cut=None, rev=.25, hp=None):
    if not (SFX / f"{name}.mp3").exists():
        print(f"(optional recording assets/sfx/{name}.mp3 not found: left out)"); return
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(SFX / f"{name}.mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).astype(float)
    if cut: a = a[int(cut[0] * SR): int(cut[1] * SR)]
    if ratio != 1.0: a = resample_poly(a, 100, int(100 * ratio))
    if hp: a = filt(a, hp, "high")
    a = a / max(1e-6, np.abs(a).max()) * ar(len(a), .01, min(.4, len(a) / SR / 3))
    add(a, t / BEAT, db(gain_db), pan, rev)


# ================= PULSE: the score is built on screen =================
# 120 BPM, a bar is 2 s. The layer patterns below are the same ones core.js uses to move the picture.
SG = 1.0
_add = add


def A(sig, t, gain=1.0, pan=0.0, rev=0.3):
    _add(sig, t / BEAT, gain * SG, pan, rev)


LAYERS = {"rain": ([0, 3, 6, 8, 11, 14], 8, 36), "train": ([0, 2, 8, 10], 12, 35), "dholLo": ([0, 10, 12], 18, 34),
          "dholHi": ([2, 4, 6, 8, 14], 18, 34), "rope": ([0, 4, 8, 12], 24, 33), "sea": ([0], 28, 32)}
HOME, IN = 41.0, 47.5
on = lambda n, t: LAYERS[n][1] <= t < LAYERS[n][2] or HOME <= t < IN
ROOTS = [38, 35, 43, 45]                                   # D | Bm | G | A, one bar each
CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
PENTA = [74, 76, 78, 81, 83, 86, 88, 90]


def beep(f=880.0, dur=.16):
    t = tt(dur); return (np.sin(2 * np.pi * f * t) + .18 * np.sin(4 * np.pi * f * t)) * ar(len(t), .004, .03)


def heart(strength=1.0):
    y = np.zeros(int(.5 * SR)); a = drum(95, 48, .26, 13) * strength; b = drum(80, 42, .22, 16) * strength * .65
    y[: len(a)] += a; s = int(.17 * SR); y[s: s + len(b)] += b; return filt(y, 220)


def drop(m):
    t = tt(.5); f = hz(m) * (1 + .5 * np.exp(-t * 90)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * ar(len(t), .002, .05)


def tick():
    t = tt(.05); return filt(rng.normal(0, 1, len(t)), [5000, 11000], "band") * np.exp(-t * 80)


def clack():
    t = tt(.16); return (filt(rng.normal(0, 1, len(t)), [1100, 3400], "band") * np.exp(-t * 42) + .5 * np.sin(2 * np.pi * 410 * t) * np.exp(-t * 34)) * ar(len(t), .001, .02)


def dhol_lo():
    t = tt(.55); f = 58 * (1 + 1.5 * np.exp(-t * 38)) * (1 + .12 * np.clip(t - .06, 0, 1) * 3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5) + filt(rng.normal(0, 1, len(t)), 900) * np.exp(-t * 60) * .5) * ar(len(t), .002, .05)


def dhol_hi():
    t = tt(.14); return (np.sin(2 * np.pi * np.cumsum(430 * (1 + .6 * np.exp(-t * 70))) / SR) * np.exp(-t * 34) + filt(rng.normal(0, 1, len(t)), [1800, 6500], "band") * np.exp(-t * 46) * .9) * ar(len(t), .001, .02)


def clap():
    y = np.zeros(int(.2 * SR))
    for k, d in enumerate([0, .011, .021, .034]):
        t = tt(.15); b = filt(rng.normal(0, 1, len(t)), [900, 3800], "band") * np.exp(-t * (60 if k < 3 else 22)); s = int(d * SR); y[s: s + len(b)] += b[: len(y) - s]
    return y


def whoosh(dur=.16):
    t = tt(dur); return filt(rng.normal(0, 1, len(t)), [500, 2600], "band") * np.sin(np.pi * t / dur) ** 2


def wave(dur=2.0):
    t = tt(dur); e = np.where(t < .45, (t / .45) ** 2, np.exp(-(t - .45) * 2.3)); return filt(rng.normal(0, 1, len(t)), 2800) * e


def pad(notes, t, dur, gain, att=.5, rel=.6):
    for i, m in enumerate(notes): A(strings(m, dur, att=att, rel=rel), t, gain, (-1) ** i * (.25 + .5 * i / len(notes)), .5)


def legato(notes, gain):
    for t, m, d in notes:
        A(strings(m, d, att=.06, rel=.2), t, gain, -.35, .45); A(strings(m + 12, d, att=.06, rel=.2), t, gain * .55, -.5, .5); A(horn(m - 12, d), t, gain * .5, .3, .5)


# ---- 0-5 s: the room. three beeps, the third late; then the flat tone ----
SG = .8
for t0, g in [(.5, .5), (1.5, .5), (2.7, .42)]: A(beep(), t0, g, -.3, .25); A(heart(.8), t0 - .02, .5)
pad([47, 54], 0, 5.2, .035, att=1.5, rel=.6)
t = tt(2.3); flat = np.sin(2 * np.pi * 880 * t) * ar(len(t), .01, .5) * np.clip(1.25 - t / 2.3, 0, 1)
A(flat, 3.2, .16, -.3, .3)
for i, m in enumerate([81, 86, 90, 93, 98]): A(celesta(m, .9), 4.4 + i * .1, .16, -.2 + i * .15, .6)       # the blip leaves
# ---- the heartbeat under the whole journey: one beat a second, fading out in the fog ----
SG = 1.0
for t0 in range(5, 36): A(heart(1.0), t0, .55 if t0 < 8 else .42)
A(heart(.8), 36.2, .34); A(heart(.6), 37.6, .22)
# ---- the layers ----
for bar in range(4, 24):
    for step in range(16):
        t0 = bar * 2 + step * .125; k = bar % 4; out = t0 < 40
        if not (8 <= t0 < 36 or HOME <= t0 < IN): continue
        g = 1.0 if out else 1.25
        if on("rain", t0):
            if step in LAYERS["rain"][0]:
                A(drop(PENTA[(bar * 3 + step * 5) % len(PENTA)]), t0, .4 * g, .5 - (step % 4) * .3, .5); A(tick(), t0, .34 * g, -.4, .2)
            elif step % 2 == 1: A(tick(), t0, .07 * g, .6, .2)
        if on("train", t0):
            if step in LAYERS["train"][0]: A(clack(), t0, .34 * g, -.25 if step % 4 == 0 else .25, .25)
            if step % 2 == 0: A(bass(ROOTS[k] + (0 if step % 8 < 4 else 7), .24), t0, .62 * g, 0, .1)
        if on("dholLo", t0):
            if step in LAYERS["dholLo"][0]: A(dhol_lo(), t0, 1.0 * g, .1, .22)
            if step in LAYERS["dholHi"][0]: A(dhol_hi(), t0, .5 * g, -.3, .22)
        if on("rope", t0):
            if step in (4, 12): A(clap(), t0, .5 * g, .35, .3)
            if step in LAYERS["rope"][0]: A(whoosh(), t0 - .06, .1 * g, -.2, .2)
            tune = {0: 81, 4: 78, 6: 81, 8: 86, 12: 83}
            if step in tune: A(pluck(tune[step], .9, 2.0), t0, .2 * g, -.45, .45); A(celesta(tune[step] + 12, .7), t0, .09 * g, .45, .5)
        if not out and step % 4 == 0: A(drum(120, 46, .3, 13), t0, .75)                       # the run home: four on the floor
    t0 = bar * 2
    if on("sea", t0) or (HOME <= t0 + 1 < IN):
        s0 = max(t0, HOME) if t0 >= 40 else t0; d = t0 + 2 - s0
        pad(CH[bar % 4], s0, d, .085 if t0 < 40 else .11, att=.25, rel=.35); A(wave(), t0 - .45, .22, 0, .4)
# ---- 32-38 s: the fog. (the layers stop on their own bars.) ----
SG = .6
pad([47, 54], 33, 4.4, .03, att=2.0, rel=.8)
t = tt(.9); A(np.sin(2 * np.pi * 880 * t) * ar(len(t), .3, .4), 37.5, .035, -.3, .5)        # the flat tone, remembered
# ---- 39 s: the spike, and the climb back ----
SG = 1.2
A(drum(100, 38, 2.2, 2.2), 39.0, 1.0, 0, .5); A(cymbal(2.2), 39.0, .09, 0, .6); A(heart(1.3), 39.0, .9)
for t0, g in [(39.6, .5), (40.1, .6), (40.5, .7), (40.75, .8)]: A(heart(1.1), t0, g)
t = tt(1.9); A(filt(rng.normal(0, 1, len(t)), 1500, "high") * (t / 1.9) ** 2.6, 39.1, .13, 0, .4)
for k in range(12): A(dhol_hi(), 40.25 + k * .0625, .12 + .04 * k, .3, .2)
for i, m in enumerate([62, 66, 69, 74, 78, 81, 86, 90]): A(pluck(m, 1.0), 40.2 + i * .1, .12 + .015 * i, -.5 + i * .13, .5)
# ---- 41-47.5 s: home. every rhythm at once, and the tune they add up to ----
SG = 1.25
A(drum(110, 40, 1.4, 4), 41.0, .9, 0, .4); A(cymbal(2.0), 41.0, .08, 0, .5)
legato([(41.0, 69, .5), (41.5, 74, .5), (42.0, 78, 1.0), (43.0, 76, .5), (43.5, 74, .5), (44.0, 74, .5), (44.5, 79, .5), (45.0, 83, 1.0),
        (46.0, 81, .5), (46.5, 83, .5), (47.0, 85, .5)], .2)
A(cymbal(1.0, True), 46.5, .13, 0, .5)
A(drum(100, 36, 1.6, 3), 47.5, 1.0, 0, .55); A(cymbal(1.4), 47.5, .07, 0, .6)                 # into the monitor. then nothing
# ---- 49.5 s: the beep. the room warms ----
SG = 1.0
for t0 in [49.5, 50.5, 51.5, 52.5, 53.5, 54.5]: A(beep(), t0, .46, -.2, .3); A(heart(1.0), t0 - .02, .6)
A(drum(100, 44, 1.4, 4), 49.5, .6, 0, .5)
pad([38, 50, 57, 62, 66, 69], 50.0, 3.0, .085, att=1.6, rel=.5); pad([43, 55, 59, 62, 69], 53.0, 2.0, .09, att=.5, rel=.4); pad([38, 50, 57, 62, 66, 74], 55.0, .9, .11, att=.15, rel=.9)
for t0, m in [(51.0, 81), (51.5, 86), (52.0, 90), (53.0, 88), (53.5, 86), (54.0, 83), (54.5, 86)]: A(pluck(m, 1.6, 1.4), t0, .22, -.3, .55); A(celesta(m + 12, 1.2), t0, .1, .3, .6)
A(beep(), 55.0, .5, 0, .4); A(heart(1.2), 54.98, .8); A(celesta(98, 1.6), 55.0, .2, .2, .7); A(pluck(50, 1.2, 1.4), 55.0, .3, 0, .5)

# ---------- recorded sounds of each place, kept low under the rhythm ----------
SG = 1.0
def S(name, t0, gdb, pan=0.0, cut=None, hp=None, rev=.25): sfx(name, t0, gdb, pan, 1.0, cut, rev, hp)
S("breeze_trees", 5.0, -30, 0, (1, 4))
S("rain_storm", 7.3, -25, 0, (10, 15.2), 300)
S("train_horn_distant", 12.3, -20, -.4, (0, 3.5)); S("steam_train_passing", 13.0, -23, -.3, (3, 7.5), 150)
S("fair_crowd", 17.6, -26, 0, (2, 7.8), 200)
S("child_laugh", 24.6, -19, .3, (0, 1.6))
S("sea_waves_close", 27.6, -21, 0, (2, 7), 120)
S("wind_forest", 32.2, -23, 0, (2, 8.4), 200)
S("child_laugh", 38.4, -2, .5, (0, 1.5), None, .6)          # the sound from the lit window
S("wind_swoosh", 40.7, -13, 0)

# ---------- hall reverb, master ----------
t = tt(2.4); ir = np.stack([rng.normal(0, 1, len(t)), rng.normal(0, 1, len(t))], 1) * np.exp(-t * 2.8)[:, None]
ir = filt(filt(ir, 6000), 300, "high"); ir[: int(.012 * SR)] *= 0; ir /= np.sqrt((ir ** 2).sum(0)).mean()
wet = np.stack([fftconvolve(send[:, i], ir[:, i])[:N] for i in (0, 1)], 1)
mix = (dry + wet * .45)[: int(TOTAL * SR)]
mix = filt(mix, 28, "high")
tm = np.arange(len(mix)) / SR
mix *= (np.clip(tm / .1, 0, 1) * np.clip((TOTAL - tm) / .6, 0, 1))[:, None]
mix *= np.where((tm > 47.9) & (tm < 49.45), np.clip(1 - (tm - 47.9) / .5, 0, 1), 1.0)[:, None]     # real silence before the beep
mix = np.tanh(mix / np.percentile(np.abs(mix), 99.97) * .95) / np.tanh(.95) * .86
sf.write(HERE / "score.wav", mix.astype(np.float32), SR, subtype="PCM_16")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(HERE / "score.wav"), "-b:a", "192k", str(HERE / "score.mp3")], check=True)
for a, b, name in [(0, 3.2, "room"), (3.2, 5, "flat"), (5, 8, "heart only"), (8, 12, "+rain"), (12, 18, "+train"), (18, 24, "+dhol"), (24, 28, "+rope"), (28, 32, "+sea"),
                   (32, 34, "fog 1"), (34, 36, "fog 2"), (36, 38.4, "fog 3"), (38.4, 39, "laugh"), (39, 41, "climb"), (41, 47.5, "home"), (48.4, 49.45, "silence"), (49.5, 53, "dawn"), (53, 56, "title")]:
    seg = mix[int(a * SR): int(b * SR)]; print("%-10s %6.1f dBFS" % (name, 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)))
