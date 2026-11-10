// Render PULSE. The film is one canvas drawn from film time (window.renderAt(t)), so frames can be made in any order.
// usage: node tools/render.mjs stills <9x16|1x1> 0.6 9 20 ...   -> preview/<format>/still-XX.jpg
//        node tools/render.mjs film   <9x16|1x1> [fps=24]         -> renders/pulse_<format>.mp4 (frames + assets/audio/score.wav, or score.mp3 if the wav has not been built)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [mode = 'film', format = '9x16', ...rest] = process.argv.slice(2);
const sq = format === '1x1', height = sq ? 1080 : 1920;
// By default this drives the Chrome already installed. Set PULSE_BROWSER=chromium to use Playwright's own browser
// (after `npx playwright install chromium`), or PULSE_BROWSER=msedge for Edge.
const channel = process.env.PULSE_BROWSER || 'chrome';
const browser = await chromium.launch({ ...(channel === 'chromium' ? {} : { channel }), args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height } });
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?render=1' + (sq ? '&ar=1x1' : ''));
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const shot = async (t, out, q) => {
  await page.evaluate(t => window.renderAt(t), t);
  const b64 = await page.evaluate(q => document.getElementById('stage').toDataURL('image/jpeg', q), q);
  fs.writeFileSync(out, Buffer.from(b64.split(',')[1], 'base64'));
};
if (mode === 'stills') {
  const dir = path.join(root, 'preview', format); fs.mkdirSync(dir, { recursive: true });
  for (const [i, t] of rest.map(Number).entries()) await shot(t, path.join(dir, `still-${String(i).padStart(2, '0')}.jpg`), 0.9);
  await browser.close();
} else {
  const fps = +(rest[0] || 24), total = await page.evaluate(() => window.TOTAL);
  const dir = path.join(root, 'frames', format); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(total * fps);
  for (let f = 0; f < n; f++) {
    await shot(f / fps, path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), 0.97);
    if (f % 120 === 0) console.log(`frame ${f}/${n}`);
  }
  await browser.close();
  const wav = path.join(root, 'assets', 'audio', 'score.wav'), audio = fs.existsSync(wav) ? wav : path.join(root, 'assets', 'audio', 'score.mp3');
  const out = path.join(root, 'renders', `pulse_${format}.mp4`); fs.mkdirSync(path.dirname(out), { recursive: true });
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.jpg'), '-i', audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(r.status === 0 ? `wrote ${out}` : 'ffmpeg failed');
}
