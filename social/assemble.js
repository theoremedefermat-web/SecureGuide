// Équivalent Node de assemble.py (pour un poste sans Python) : assemble la voix d'un Short et écrit le JSON de rendu pour short2.js.
// Usage : node social/assemble.js social/shorts/XXX.spec.json
// Même format de spec que assemble.py ; « dir » peut aussi viser un WAV d'un autre dossier (ex. "../s002/t8.wav").
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const specPath = process.argv[2]; const base = path.dirname(specPath); const S = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const src = path.join(base, S.dir);
const dur = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const r2 = x => Math.round(x * 100) / 100;

let t = 0.3; const starts = []; const phrases = [];
const cmd = ['-y', '-loglevel', 'error', '-f', 'lavfi', '-t', '0.3', '-i', 'anullsrc=r=44100:cl=mono']; const segs = ['[0:a]']; let i = 1;
for (const s of S.sentences) {
  const wav = path.join(src, s.wav); const d = dur(wav); const gap = s.gap ?? 0.6; starts.push(t);
  for (const [a, b, tx, hi] of s.subs) phrases.push({ from: r2(t + a), to: r2(t + (b === null ? d : b)), text: tx, hi });
  cmd.push('-i', wav, '-f', 'lavfi', '-t', String(gap), '-i', 'anullsrc=r=44100:cl=mono');
  segs.push(`[${i}:a]`, `[${i + 1}:a]`); i += 2;
  t += d + gap;
}
const audio = `${S.out}-voix.mp3`;
cmd.push('-filter_complex', segs.join('') + `concat=n=${segs.length}:v=0:a=1[o]`, '-map', '[o]', '-c:a', 'libmp3lame', '-b:a', '192k', path.join(base, audio));
execFileSync('ffmpeg', cmd, { stdio: 'inherit' });

const st = n => starts[n - 1];
const imgs = S.images; const images = imgs.map((im, k) => {
  const name = `${S.out}-${im.src}`; fs.copyFileSync(path.join(src, im.src), path.join(base, name));
  const end = k + 1 < imgs.length ? st(imgs[k + 1].from_sentence) : st(S.cta.sentence) + (S.cta.offset || 0) + 0.5;
  return { src: name, from: k === 0 ? 0 : st(im.from_sentence), to: end };
});
const stickers = (S.stickers || []).map(x => ({ from: st(x.sentence) + (x.offset || 0), to: st(x.end_sentence) - 0.15, text: x.text, ...(x.sub ? { sub: x.sub } : {}) }));
const { sentence, offset, ...c } = S.cta; c.from = st(sentence) + (offset ?? -0.1);
const R = { label: S.label || 'ALERTE ARNAQUE', audio, images, phrases, stickers, cta: c };
fs.writeFileSync(path.join(base, `${S.out}.json`), JSON.stringify(R, null, 0));
console.log(path.join(base, `${S.out}.json`), `${t.toFixed(1)}s`);
