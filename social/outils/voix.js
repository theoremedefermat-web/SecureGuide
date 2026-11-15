// Voix Hortense phrase par phrase : synthèse de chaque morceau, coupe des silences, puis t<n>.wav par phrase
// avec un petit blanc entre morceaux. Écrit subs.json : pour chaque phrase, [début, fin, texte affiché].
// Usage : node voix.js <dossier sXXX> <phrases.json>  (phrases.json : [[ [dit, affiché], ... ], ...])
const fs = require('fs'); const path = require('path'); const { execFileSync: x } = require('child_process');
const [out, src] = process.argv.slice(2); const S = JSON.parse(fs.readFileSync(src, 'utf8'));
const flat = S.flat(); const tmp = path.join(out, 'parts'); fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'l.json'), JSON.stringify(flat.map(p => p[0])));
x('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, "tts2.ps1"), tmp, path.join(tmp, 'l.json')]);
const dur = f => parseFloat(x('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
let k = 0; const subs = [];
S.forEach((sent, n) => {
  const files = []; let t = 0; const ss = [];
  sent.forEach(([, shown], j) => {
    const f = path.join(tmp, `q${k}.wav`);
    x('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(tmp, `p${k}.wav`), '-af', trim, '-ar', '44100', '-ac', '1', f]);
    const d = dur(f); ss.push([+t.toFixed(2), j === sent.length - 1 ? null : +(t + d).toFixed(2), shown]);
    files.push(f); t += d;
    if (j < sent.length - 1) { const g = path.join(tmp, `g${k}.wav`); const gap = /[.:]$/.test(shown) ? 0.28 : 0.14;
      x('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-t', String(gap), '-i', 'anullsrc=r=44100:cl=mono', g]); files.push(g); t += gap; }
    k++;
  });
  const args = ['-y', '-loglevel', 'error']; files.forEach(f => args.push('-i', f));
  args.push('-filter_complex', files.map((_, i) => `[${i}:a]`).join('') + `concat=n=${files.length}:v=0:a=1[o]`, '-map', '[o]', path.join(out, `t${n + 1}.wav`));
  x('ffmpeg', args); subs.push(ss); console.log(`t${n + 1}`, t.toFixed(2), JSON.stringify(ss));
});
fs.writeFileSync(path.join(out, 'subs.json'), JSON.stringify(subs));
try { fs.rmSync(tmp, { recursive: true, maxRetries: 3 }); } catch {}
