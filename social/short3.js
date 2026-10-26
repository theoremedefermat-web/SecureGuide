// Short v3 : montage dynamique. Plans recadrés avec transitions (zoom, flou, flash), secousses, glitchs,
// animations (compteur, appel entrant, carte coupée, solde qui fond, tampon, règles), sous-titres mot à mot,
// grain + vignette, et bande-son complète : voix accélérée, musique de tension et bruitages synthétisés (ffmpeg).
// Usage : node social/assemble.js social/shorts/XXX.spec.json, puis node social/short3.js social/shorts/XXX.json
const fs = require('fs'); const path = require('path'); const os = require('os'); const { execFileSync, spawn } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('playwright-core')); }
const dir = __dirname;
const FF = fs.readFileSync(path.join(dir, 'fonts.html'), 'utf8');
const mark = fs.readFileSync(path.join(dir, '../src/brand/mark.svg'), 'utf8');
const file = process.argv[2]; const base = path.dirname(file); const S = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = file.replace(/\.json$/, '.mp4');
const SP = S.speed || 1;
const probe = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const ff = args => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sg3-'));

// ---------- Audio ----------
// Voix : accélérée (sans changer la hauteur), plus présente et compressée.
const voice = path.join(tmp, 'voice.wav');
ff(['-i', path.join(base, S.audio), '-af', `atempo=${SP},highpass=f=70,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=5:release=80`, '-ar', '44100', '-ac', '2', voice]);
const dur = probe(voice) + 0.6;
const T = x => x / SP; // temps de la spec (vitesse 1) → temps de la vidéo
// Bruitages synthétisés : chaque entrée est un graphe lavfi.
const SFX = {
  impact: "aevalsrc='0.95*sin(2*PI*(42*t+70*(1-exp(-14*t))/14))*exp(-2.6*t)+0.5*sin(2*PI*190*t)*exp(-45*t)':d=1.8:s=44100",
  boom: "aevalsrc='0.9*sin(2*PI*(36*t+50*(1-exp(-8*t))/8))*exp(-1.6*t)':d=2.5:s=44100",
  whoosh: "anoisesrc=d=0.75:c=pink:a=0.9:r=44100,aeval='val(0)*pow(sin(PI*t/0.75),3)',highpass=f=350,lowpass=f=6000,aecho=0.6:0.5:35:0.3",
  glitch: "anoisesrc=d=0.45:c=white:a=0.55:r=44100,aeval='val(0)*lt(mod(floor(t*41),3),1)',acrusher=bits=4:mode=log:aa=1,lowpass=f=7000",
  ring: "aevalsrc='(0.2*(sin(2*PI*880*t)+sin(2*PI*1320*t))*lt(mod(t,0.11),0.055)+0.3*sin(2*PI*165*t))*lt(mod(t,1.6),0.85)':d=3.4:s=44100",
  snip: "anoisesrc=d=0.35:c=white:a=0.9:r=44100,aeval='val(0)*(exp(-95*t)+exp(-95*abs(t-0.14))*gte(t,0.14))',highpass=f=2600",
  dingdong: "aevalsrc='0.35*sin(2*PI*659.3*t)*exp(-2.4*t)*lt(t,0.55)+0.35*sin(2*PI*523.3*(t-0.55))*exp(-1.8*(t-0.55))*gte(t,0.55)+0.08*sin(2*PI*1318.5*t)*exp(-5*t)':d=2.2:s=44100",
  tick: "aevalsrc='0.22*sin(2*PI*2500*t)*exp(-160*mod(t,0.06))':d=0.8:s=44100",
  type: "anoisesrc=d=1.0:c=white:a=0.5:r=44100,aeval='val(0)*exp(-110*mod(t,0.075))',highpass=f=1800",
  heartbeat: "aevalsrc='0.95*sin(2*PI*50*t)*exp(-20*mod(t,0.82))+0.65*sin(2*PI*50*t)*exp(-20*mod(t-0.2,0.82))*gte(t,0.2)':d=3.3:s=44100,lowpass=f=160",
  riser: "aevalsrc='0.28*sin(2*PI*(140*t+380*t*t/1.6))*pow(t/1.6,2)':d=1.6:s=44100",
  msg: "aevalsrc='0.3*sin(2*PI*1046.5*t)*exp(-30*t)*lt(t,0.09)+0.3*sin(2*PI*1568*(t-0.09))*exp(-25*(t-0.09))*gte(t,0.09)':d=0.4:s=44100",
  pop: "aevalsrc='0.35*sin(2*PI*(900*t-1800*t*t))*exp(-28*t)':d=0.25:s=44100",
};
const used = [...new Set(S.fx.filter(f => f.sfx).map(f => f.sfx))];
for (const k of used) ff(['-f', 'lavfi', '-i', SFX[k], '-ac', '2', path.join(tmp, k + '.wav')]);
// Musique : pulsation grave (battement), nappe sombre et arpège mineur, avec silences (quiet) aux moments clés.
const music = path.join(tmp, 'music.wav');
const arp = "if(eq(mod(floor(t*4),8),0),220,if(eq(mod(floor(t*4),8),1),261.63,if(eq(mod(floor(t*4),8),2),329.63,if(eq(mod(floor(t*4),8),3),261.63,if(eq(mod(floor(t*4),8),4),207.65,if(eq(mod(floor(t*4),8),5),261.63,if(eq(mod(floor(t*4),8),6),311.13,261.63)))))))";
const mexpr = `0.55*sin(2*PI*(46*mod(t,0.5)+3*(1-exp(-28*mod(t,0.5)))))*exp(-7*mod(t,0.5))+0.11*sin(2*PI*55*t)+0.07*sin(2*PI*82.41*t)*(0.7+0.3*sin(2*PI*0.2*t))+0.065*sin(2*PI*${arp}*t)*exp(-11*mod(t,0.25))`;
const quiet = (S.quiet || []).map(([a, b]) => `between(t,${T(a).toFixed(2)},${T(b).toFixed(2)})`).join('+') || '0';
ff(['-f', 'lavfi', '-i', `aevalsrc='${mexpr}':d=${dur.toFixed(2)}:s=44100`, '-f', 'lavfi', '-i', `anoisesrc=d=${dur.toFixed(2)}:c=white:a=0.25:r=44100`,
  '-filter_complex', `[1]aeval='val(0)*exp(-55*mod(t-0.25,0.5))*gte(t,0.25)',highpass=f=6000[h];[0][h]amix=inputs=2:normalize=0,lowpass=f=3000,aecho=0.8:0.6:240:0.22,volume='if(${quiet},0.04,1)':eval=frame,afade=t=in:d=0.2,afade=t=out:st=${(dur - 1.2).toFixed(2)}:d=1.2`,
  '-ac', '2', music]);
// Mixage : musique en retrait et compressée par la voix (ducking), bruitages placés à leur instant.
const fxs = S.fx.filter(f => f.sfx);
const mix = path.join(tmp, 'mix.wav');
const inputs = ['-i', voice, '-i', music, ...fxs.flatMap(f => ['-i', path.join(tmp, f.sfx + '.wav')])];
const fl = ['[0]asplit=2[v][key]', '[1]volume=0.42[m0]', '[m0][key]sidechaincompress=threshold=0.04:ratio=7:attack=15:release=320[m]'];
fxs.forEach((f, i) => { const ms = Math.max(0, Math.round(T(f.at) * 1000)); fl.push(`[${i + 2}]adelay=${ms}|${ms},volume=${f.vol || 0.75}[f${i}]`); });
fl.push(`[v][m]${fxs.map((_, i) => `[f${i}]`).join('')}amix=inputs=${fxs.length + 2}:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5[o]`);
ff([...inputs, '-filter_complex', fl.join(';'), '-map', '[o]', '-ar', '44100', '-t', dur.toFixed(2), mix]);

// ---------- Image ----------
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(base, f)).toString('base64');
const words = [];
S.phrases.forEach((p, pi) => {
  const ws = p.text.split(/\s+/).filter(Boolean); const tot = ws.reduce((a, w) => a + w.length + 1.5, 0);
  let t = T(p.from); const d0 = T(p.to) - T(p.from);
  ws.forEach(w => { const d = d0 * (w.length + 1.5) / tot; words.push({ w, from: t, to: t + d, p: pi, hi: (p.hi || []).some(h => w.toLowerCase().includes(h.toLowerCase())) }); t += d; });
});
const D = {
  SP, dur, words,
  phrases: S.phrases.map(p => ({ from: T(p.from), to: T(p.to) })),
  scenes: S.scenes.map(s => ({ ...s, ...(s.type === 'img' ? { src: undefined } : {}), from: T(s.from), to: T(s.to) })),
  fx: S.fx.map(f => ({ ...f, at: T(f.at) })),
  cta: T(S.cta.from),
};
const ov = (s, i) => {
  const id = `sc${i}`;
  switch (s.type) {
    case 'counter': return `<div class="ov counter" id="${id}"><b>0</b><small>${s.label || ''}</small></div>`;
    case 'quote': return `<div class="ov quote" id="${id}"><q data-t="${s.text}"></q><div class="by">${s.by || ''}</div><div class="src">${s.src || ''}</div></div>`;
    case 'phone': return `<div class="ov phone" id="${id}"><div class="pc"><div class="st">Appel entrant…</div><div class="av">👤</div><div class="nm">${s.name}</div><div class="sb">${s.sub}</div><div class="bt"><i class="r">✆</i><i class="g">✆</i></div></div></div>`;
    case 'card': return `<div class="ov cardw" id="${id}"><div class="card a"><div class="chip"></div><div class="num">•••• •••• •••• 4821</div><div class="cn">CARTE BANCAIRE</div></div><div class="card b"><div class="chip"></div><div class="num">•••• •••• •••• 4821</div><div class="cn">CARTE BANCAIRE</div></div><div class="cutl"></div><div class="lbl">✂ « Coupez-la en deux »</div></div>`;
    case 'tag': return `<div class="ov stk" id="${id}"><b>${s.text}</b>${s.sub ? `<small>${s.sub}</small>` : ''}</div>`;
    case 'balance': return `<div class="ov bal" id="${id}"><div class="bc"><div class="h">Compte courant</div><div class="l">Solde disponible</div><div class="v">20 000,00 €</div><div class="bar2"><i></i></div></div></div>`;
    case 'stamp': return `<div class="ov stamp" id="${id}"><div class="sp">${s.text}</div><div class="ss">${s.sub || ''}</div></div>`;
    case 'chat': return `<div class="ov chat" id="${id}"><div class="ch"><span class="av">${s.icon || '👤'}</span><div><b>${s.title}</b><small>Reconstitution</small></div></div>${s.items.map(([side, tx, , bad], j) => `<div class="bu ${side}${bad ? ' bad' : ''}" id="${id}m${j}">${tx}</div>`).join('')}</div>`;
    case 'confirm': return `<div class="ov conf" id="${id}"><div class="cf"><div class="h">${s.title}</div><div class="l">${s.sub}</div><div class="btn">${s.btn}</div><div class="n">Opérations validées : <b>0</b></div></div></div>`;
    case 'rules': return `<div class="ov rules" id="${id}"><div class="k">${s.kicker}</div><div class="big"${s.bigSize ? ` style="font-size:${s.bigSize}px"` : ''}>${s.big}</div>${s.items.map(([ic, tx], j) => `<div class="it" id="${id}i${j}"><span class="${ic === '✓' ? 'ok' : 'no'}">${ic}</span>${tx}</div>`).join('')}</div>`;
    default: return '';
  }
};
const html = `<!doctype html><html><head><meta charset="utf-8">${FF}<style>
*{box-sizing:border-box;margin:0}html,body{width:1080px;height:1920px;overflow:hidden;background:#05141C}
body{font-family:Figtree,sans-serif;color:#fff;position:relative}
#stage{position:absolute;inset:-40px;overflow:hidden}
.shot{position:absolute;left:40px;top:40px;width:1080px;height:1920px;overflow:hidden;opacity:0}
.shot img{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover;transform-origin:50% 50%}
.shot .tn{position:absolute;inset:0}
.shot.red .tn{background:radial-gradient(ellipse at 50% 45%,rgba(210,69,58,0) 30%,rgba(150,10,10,.55) 100%);mix-blend-mode:multiply}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,20,28,.6) 0%,rgba(5,20,28,0) 16%,rgba(5,20,28,0) 55%,rgba(5,20,28,.85) 80%,rgba(5,20,28,.95) 100%);pointer-events:none}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 55%,rgba(0,0,0,.6) 100%);z-index:30}
#grain{position:absolute;inset:0;width:1080px;height:1920px;opacity:.11;mix-blend-mode:overlay;z-index:31}
.top{position:absolute;left:70px;right:70px;top:120px;display:flex;justify-content:space-between;align-items:center;z-index:40}
.brand{display:flex;align-items:center;gap:16px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:44px;text-shadow:0 2px 12px rgba(0,0,0,.6)}.brand svg{width:72px;height:72px}.g{color:#F2B33D}
.tag{font-family:'JetBrains Mono';font-weight:700;font-size:28px;letter-spacing:.14em;padding:14px 20px;border-radius:12px;background:#D2453A;color:#fff}
#cap{position:absolute;left:60px;right:60px;top:1395px;font-family:Archivo;font-stretch:118%;font-weight:900;text-transform:uppercase;font-size:88px;line-height:1.08;text-align:center;z-index:35;text-shadow:0 6px 0 rgba(0,0,0,.55),0 0 28px rgba(0,0,0,.7)}
#cap span{display:inline-block;margin:0 .18em;opacity:0}
#cap span.hi{color:#F2B33D}
.ov{position:absolute;opacity:0;z-index:20}
.counter{left:0;right:0;top:560px;text-align:center}
.counter b{display:block;white-space:nowrap;font-family:Archivo;font-stretch:118%;font-weight:900;font-size:180px;line-height:1;color:#FF4A3D;text-shadow:0 0 60px rgba(255,60,40,.6),0 10px 0 #5A0B05}
.counter small{display:inline-block;margin-top:26px;font-family:'JetBrains Mono';font-weight:700;font-size:40px;letter-spacing:.14em;background:#fff;color:#111;padding:12px 22px;border-radius:10px}
.quote{inset:0;background:#05141C;display:flex;flex-direction:column;justify-content:center;padding:0 90px;z-index:25}
.quote q{quotes:none;font-family:Archivo;font-stretch:115%;font-weight:900;font-size:118px;line-height:1.02;color:#fff}
.quote q i{font-style:normal;opacity:0}.quote q i.on{opacity:1}
.quote .by{margin-top:50px;font-size:46px;font-weight:700;color:#F2B33D}
.quote .src{margin-top:14px;font-family:'JetBrains Mono';font-size:28px;letter-spacing:.06em;color:#8FB3C2}
.phone{left:140px;right:140px;top:330px}
.pc{background:rgba(14,22,28,.82);backdrop-filter:blur(18px);border:2px solid rgba(255,255,255,.12);border-radius:56px;padding:50px 40px 46px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.pc .st{font-size:34px;color:#9FC1CF;letter-spacing:.04em}
.pc .av{width:170px;height:170px;border-radius:50%;background:#2A4C5B;margin:30px auto 24px;font-size:96px;line-height:170px}
.pc .nm{font-family:Archivo;font-stretch:112%;font-weight:800;font-size:66px}
.pc .sb{font-size:34px;color:#B9D0DA;margin-top:8px}
.pc .bt{display:flex;justify-content:space-around;margin-top:46px}
.pc .bt i{font-style:normal;width:128px;height:128px;border-radius:50%;font-size:64px;line-height:128px}
.pc .r{background:#E5483D}.pc .g{background:#30C15A}
.phone.bad .pc{border-color:#E5483D;box-shadow:0 0 0 6px rgba(229,72,61,.35),0 30px 80px rgba(0,0,0,.6)}
.phone.bad .nm{color:#FF6155}.phone.bad .av{background:#5A1712}
.cardw{left:0;right:0;top:470px;height:700px}
.card{position:absolute;left:150px;top:80px;width:780px;height:492px;border-radius:40px;background:linear-gradient(135deg,#1F4E63,#0B2430 60%,#14394A);box-shadow:0 30px 70px rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.15)}
.card.a{clip-path:inset(0 50% 0 0)}.card.b{clip-path:inset(0 0 0 50%)}
.chip{position:absolute;left:70px;top:150px;width:120px;height:92px;border-radius:16px;background:linear-gradient(135deg,#F7D27A,#B98A2C)}
.num{position:absolute;left:70px;top:300px;font-family:'JetBrains Mono';font-size:48px;letter-spacing:.06em}
.cn{position:absolute;left:70px;top:390px;font-family:'JetBrains Mono';font-size:26px;letter-spacing:.2em;color:#9FC1CF}
.cutl{position:absolute;left:538px;top:40px;width:6px;height:572px;background:#fff;box-shadow:0 0 30px #fff;opacity:0}
.cardw .lbl{position:absolute;left:0;right:0;top:620px;text-align:center;font-family:Archivo;font-stretch:112%;font-weight:800;font-size:58px;color:#F2B33D;text-shadow:0 4px 18px rgba(0,0,0,.7)}
.stk{left:70px;top:470px;background:#F2B33D;color:#2A1C00;border-radius:18px;padding:22px 30px;box-shadow:0 10px 0 #B07A12}
.stk b{display:block;font-family:Archivo;font-stretch:120%;font-weight:900;font-size:70px;line-height:1}
.stk small{font-size:30px;font-weight:700}
.bal{left:110px;right:110px;top:420px}
.bc{background:#F5F8FA;color:#0A2533;border-radius:44px;padding:48px 50px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.bc .h{font-weight:800;font-size:40px}.bc .l{font-size:32px;color:#5B7684;margin-top:30px}
.bc .v{font-family:Archivo;font-stretch:110%;font-weight:900;font-size:124px;margin-top:6px;letter-spacing:-.02em}
.bar2{height:20px;border-radius:10px;background:#DCE6EB;margin-top:26px;overflow:hidden}.bar2 i{display:block;height:100%;background:#2E9E6A;width:100%}
.bal.zero .v{color:#E5483D}.bal.zero .bar2 i{background:#E5483D}
.stamp{left:0;right:0;top:560px;text-align:center}
.sp{display:inline-block;font-family:Archivo;font-stretch:120%;font-weight:900;font-size:82px;line-height:1.05;color:#FF4A3D;border:12px solid #FF4A3D;border-radius:24px;padding:26px 36px;transform:rotate(-8deg);background:rgba(20,0,0,.35);text-shadow:0 0 30px rgba(255,60,40,.5)}
.ss{margin:70px auto 0;display:table;font-size:44px;font-weight:700;background:#fff;color:#111;padding:14px 26px;border-radius:12px}
.rules{inset:0;background:radial-gradient(ellipse at 50% 35%,#0F3A4D,#05141C 75%);padding:330px 80px 0;z-index:22}
.rules .k{font-family:'JetBrains Mono';font-weight:700;font-size:40px;letter-spacing:.18em;color:#F2B33D}
.rules .big{font-family:Archivo;font-stretch:125%;font-weight:900;font-size:205px;line-height:1;color:#FF4A3D;margin:20px 0 50px;opacity:0;text-shadow:0 0 60px rgba(255,60,40,.45)}
.rules .it{font-size:48px;font-weight:700;line-height:1.2;margin:0 0 30px;display:flex;gap:26px;align-items:flex-start;opacity:0}
.rules .it span{flex:none;width:76px;height:76px;border-radius:50%;text-align:center;line-height:76px;font-size:44px;font-weight:900}
.rules .no{background:#E5483D}.rules .ok{background:#30C15A}
.chat{left:90px;right:90px;top:300px;background:rgba(11,20,26,.92);border-radius:44px;padding:0 0 30px;box-shadow:0 30px 80px rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.1);overflow:hidden}
.chat .ch{display:flex;align-items:center;gap:22px;background:#1F2C33;padding:26px 34px;margin-bottom:24px}
.chat .ch .av{width:84px;height:84px;border-radius:50%;background:#2A4C5B;text-align:center;line-height:84px;font-size:46px}
.chat .ch b{display:block;font-size:42px}.chat .ch small{font-family:'JetBrains Mono';font-size:22px;letter-spacing:.12em;color:#8FB3C2;text-transform:uppercase}
.bu{max-width:82%;margin:14px 30px;padding:22px 28px;border-radius:28px;font-size:40px;line-height:1.25;opacity:0;transform-origin:0 100%}
.bu.in{background:#26353D;border-bottom-left-radius:8px}.bu.out{background:#005C4B;margin-left:auto;border-bottom-right-radius:8px;transform-origin:100% 100%}
.bu.bad{background:#5A1712;border:3px solid #FF4A3D}
.conf{left:120px;right:120px;top:380px}
.cf{background:#F5F8FA;color:#0A2533;border-radius:44px;padding:50px 46px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.cf .h{font-weight:900;font-size:50px}.cf .l{font-size:34px;color:#5B7684;margin-top:14px}
.cf .btn{margin:40px auto 26px;background:#FF4600;color:#fff;font-weight:800;font-size:46px;border-radius:24px;padding:26px 0}
.cf .n{font-size:34px;color:#5B7684}.cf .n b{color:#E5483D;font-size:44px}
.flash{position:absolute;inset:0;z-index:50;opacity:0;pointer-events:none}
.gb{position:absolute;left:0;width:1080px;z-index:45;backdrop-filter:hue-rotate(150deg) saturate(3) brightness(1.4);opacity:0}
.ctaw{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,#0F3A4D,#05141C 75%);z-index:48;display:flex;flex-direction:column;justify-content:center;padding:0 80px;opacity:0}
.ctaw>*{opacity:0}
.ctaw .k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;font-size:34px;color:#F2B33D}
.ctaw h1{font-family:Archivo;font-stretch:122%;font-weight:900;text-transform:uppercase;font-size:120px;line-height:.98;margin:24px 0 40px}
.ctaw h1 em{font-style:normal;color:#F2B33D}
.ctaw .u{display:inline-block;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:112%;font-weight:800;font-size:60px;padding:26px 36px;border-radius:18px;box-shadow:0 10px 0 #B07A12;align-self:flex-start}
.ctaw p{font-size:44px;font-weight:700;color:#fff;margin-top:50px}
.pbar{position:absolute;left:0;bottom:0;height:12px;background:#F2B33D;width:0;z-index:60}
</style></head><body>
<div id="stage">
${S.scenes.map((s, i) => s.type === 'img' ? `<div class="shot${s.tint === 'red' ? ' red' : ''}" id="sc${i}"><img src="${img(s.src)}"><div class="tn"></div></div>` : '').join('')}
<div class="shade"></div>
${S.scenes.map(ov).join('')}
</div>
<canvas id="grain" width="360" height="640"></canvas><div class="vig"></div>
<div class="top"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div><span class="tag">${S.label}</span></div>
<div id="cap"></div>
${[0, 1, 2, 3, 4, 5].map(i => `<div class="gb" id="gb${i}"></div>`).join('')}
<div class="ctaw" id="cta"><div class="k">${S.cta.kicker}</div><h1>${S.cta.title}</h1><span class="u">${S.cta.url}</span><p>${S.cta.sub}</p></div>
<div class="flash" id="flash"></div>
<div class="pbar" id="pbar"></div>
<script>
const D=${JSON.stringify(D)};
const $=id=>document.getElementById(id);
const cl=x=>Math.max(0,Math.min(1,x)), eo=x=>1-Math.pow(1-cl(x),3), ei=x=>cl(x)*cl(x);
const rnd=(n)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const fmt=v=>Math.round(v).toLocaleString('fr-FR').replace(/\\u202f|\\u00a0/g,' ');
const cap=$('cap');let curP=-1;
document.querySelectorAll('.quote q').forEach(q=>{q.innerHTML=[...q.dataset.t].map(c=>'<i>'+c+'</i>').join('')});
const g=$('grain').getContext('2d'),gi=g.createImageData(360,640);
function frame(t){
  const fr=Math.round(t*30);
  // Secousse et glitch globaux
  let sx=0,sy=0,gl=0;
  D.fx.forEach(f=>{const d=t-f.at;
    if(f.shake&&d>=0&&d<f.shake[0]){const a=f.shake[1]*(1-d/f.shake[0]);sx+=(rnd(fr)-.5)*2*a;sy+=(rnd(fr+99)-.5)*2*a;}
    if(f.glitch&&d>=0&&d<f.glitch)gl=1;});
  $('stage').style.transform='translate('+sx+'px,'+sy+'px)'+(gl?' skewX('+((rnd(fr+7)-.5)*6)+'deg)':'');
  $('stage').style.filter=gl?'contrast(1.5) saturate(1.8)':'none';
  for(let i=0;i<6;i++){const e=$('gb'+i);if(gl&&rnd(fr*7+i)>.35){e.style.opacity=1;e.style.top=(rnd(fr*3+i)*1800)+'px';e.style.height=(20+rnd(fr*5+i)*140)+'px';e.style.transform='translateX('+((rnd(fr+i*11)-.5)*120)+'px)';}else e.style.opacity=0;}
  // Flash
  let fo=0,fc='#fff';D.fx.forEach(f=>{if(!f.flash)return;const d=t-f.at,L=f.flash==='#000'?0.35:0.2;if(d>=0&&d<L){const o=(1-d/L)*(f.flash==='#fff'?0.85:0.75);if(o>fo){fo=o;fc=f.flash;}}});
  $('flash').style.opacity=fo;$('flash').style.background=fc;
  // Scènes
  let nocap=false;
  D.scenes.forEach((s,i)=>{const e=$('sc'+i);if(!e)return;const on=t>=s.from&&t<s.to;const lt=t-s.from,lr=lt*D.SP,len=s.to-s.from;
    if(s.type==='img'){
      if(!on){e.style.opacity=0;return;}
      e.style.opacity=1;const k=cl(lt/len),en=eo(lt/0.28);
      let z=s.crop[2],dx=0;
      if(s.move==='in')z*=1+0.13*k; else if(s.move==='out')z*=1.14-0.13*k; else z*=1.06;
      if(s.move==='left')dx=60-120*k; if(s.move==='right')dx=-60+120*k;
      z*=1+0.22*(1-en);
      const mx=(z-1)*540,my=(z-1)*960;
      const tx=Math.max(-mx,Math.min(mx,(0.5-s.crop[0])*1080*z))+dx,ty=Math.max(-my,Math.min(my,(0.5-s.crop[1])*1920*z));
      const im=e.firstChild;im.style.transform='translate('+tx+'px,'+ty+'px) scale('+z+')';
      im.style.filter='blur('+(16*(1-en))+'px)'+(s.tint==='dark'?' brightness(.62) saturate(.55)':s.tint==='red'?' saturate(.5) brightness(.8)':' brightness(.9)');
      return;}
    if(!on){e.style.opacity=0;return;}
    if(s.nocap)nocap=true;
    const out=cl((s.to-t)/0.15);
    if(s.type==='counter'){const v=s.value*eo(lr/s.count);e.firstChild.textContent=fmt(v)+s.suffix;
      const en=eo(lt/0.15);e.style.opacity=Math.min(en,out);e.style.transform='scale('+(1.6-0.6*en+(1-out)*0.5)+')';e.style.filter='blur('+(1-out)*10+'px)';
      e.lastChild.style.opacity=lr>0.95?1:0;}
    if(s.type==='quote'){e.style.opacity=Math.min(cl(lt/0.12),out);const cs=e.querySelectorAll('q i');const n=Math.floor(cs.length*cl(lr/0.85));cs.forEach((c,j)=>c.classList.toggle('on',j<n));
      e.querySelector('.by').style.opacity=cl((lr-0.95)/0.3);e.querySelector('.src').style.opacity=cl((lr-1.15)/0.3);}
    if(s.type==='phone'){const en=eo(lt/0.3);e.style.opacity=Math.min(en,out);const bad=lr>=s.flip;e.classList.toggle('bad',bad);
      e.querySelector('.nm').textContent=bad?(s.badName||'⚠ FAUX CONSEILLER'):s.name;e.querySelector('.st').textContent=bad?(s.badSt||'Escroquerie en cours'):'Appel entrant…';e.querySelector('.av').textContent=bad?'🕵':'👤';
      const vib=!bad&&(lt%1.6)<0.85?Math.sin(lt*95)*9:0;e.style.transform='translate('+vib+'px,'+(80*(1-en))+'px) scale('+(bad&&lr-s.flip<0.2?1.06:1)+')';}
    if(s.type==='card'){const en=eo(lt/0.3);e.style.opacity=Math.min(en,out);const c=cl((lr-s.cut)/0.35),ce=eo(c);
      e.querySelector('.a').style.transform='translate('+(-90*ce)+'px,'+(60*ce)+'px) rotate('+(-14*ce-4)+'deg)';
      e.querySelector('.b').style.transform='translate('+(90*ce)+'px,'+(80*ce)+'px) rotate('+(12*ce-4)+'deg)';
      e.querySelector('.cutl').style.opacity=lr>=s.cut&&lr<s.cut+0.25?1-(lr-s.cut)/0.25:0;
      e.querySelector('.lbl').style.opacity=cl((lr-0.2)/0.2);e.style.transform='translateY('+(90*(1-en))+'px)';}
    if(s.type==='tag'){const en=cl(lt/0.2),ov=en<1?1+0.18*Math.sin(en*Math.PI):1;e.style.opacity=Math.min(en,out);e.style.transform='rotate(-3deg) scale('+((0.5+0.5*en)*ov)+')';}
    if(s.type==='balance'){const en=eo(lt/0.3);e.style.opacity=Math.min(en,out);const k=ei((lr-s.start)/s.dur);const v=s.from_value*(1-k);
      e.querySelector('.v').textContent=v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/\\u202f|\\u00a0/g,' ')+' €';
      e.querySelector('.bar2 i').style.width=(100*(1-k))+'%';e.classList.toggle('zero',k>=1);
      e.style.transform='translateY('+(90*(1-en))+'px) scale('+(k>=1&&(lr-s.start-s.dur)<0.25?1.05:1)+')';}
    if(s.type==='stamp'){const en=cl(lt/0.14);e.style.opacity=Math.min(en,out);e.firstChild.style.transform='rotate(-8deg) scale('+(2.6-1.6*en)+')';e.lastChild.style.opacity=cl((lt-0.35)/0.2);}
    if(s.type==='chat'){const en=eo(lt/0.3);e.style.opacity=Math.min(en,out);e.style.transform='translateY('+(80*(1-en))+'px)';
      s.items.forEach((it,j)=>{const x=$('sc'+i+'m'+j),k=cl((lr-it[2])/0.18);x.style.display=lr>=it[2]-0.01?'block':'none';x.style.opacity=k;x.style.transform='scale('+(0.6+0.4*eo(k)+(k<1?0.08*Math.sin(k*Math.PI):0))+')';});}
    if(s.type==='confirm'){const en=eo(lt/0.3);e.style.opacity=Math.min(en,out);e.style.transform='translateY('+(80*(1-en))+'px)';
      const n=s.presses.filter(x=>lr>=x).length,last=Math.max(-9,...s.presses.filter(x=>lr>=x)),pk=lr-last;
      e.querySelector('.btn').style.transform='scale('+(pk<0.15?0.9:1)+')';e.querySelector('.btn').style.background=pk<0.2?'#30C15A':'#FF4600';e.querySelector('.n b').textContent=n;}
    if(s.type==='rules'){e.style.opacity=Math.min(cl(lt/0.15),out);const b=e.querySelector('.big'),bk=cl((lr-s.bigAt)/0.14);
      b.style.opacity=bk;b.style.transform='scale('+(2.4-1.4*bk)+')';b.style.transformOrigin='0 50%';
      s.items.forEach((it,j)=>{const x=e.querySelector('#sc'+i+'i'+j),k=eo((lr-it[2])/0.25);x.style.opacity=k;x.style.transform='translateX('+(-120*(1-k))+'px)';});}
  });
  // Sous-titres : chaque mot surgit quand il est prononcé
  let p=nocap||t>=D.cta?-1:D.phrases.findIndex(p=>t>=p.from-0.05&&t<p.to+0.3);
  if(p!==curP){curP=p;cap.innerHTML=p<0?'':D.words.map((w,i)=>w.p===p?'<span data-i="'+i+'" class="'+(w.hi?'hi':'')+'">'+w.w+'</span>':'').join('');}
  cap.querySelectorAll('span').forEach(s=>{const w=D.words[+s.dataset.i],k=cl((t-w.from)/0.12);s.style.opacity=k;s.style.transform='scale('+(1.45-0.45*eo(k))+') translateY('+(20*(1-k))+'px)';});
  // CTA
  const c=t-D.cta;$('cta').style.opacity=cl(c/0.2);
  [...$('cta').children].forEach((x,j)=>{const k=eo((c-0.1-j*0.18)/0.3);x.style.opacity=k;x.style.transform='translateY('+(60*(1-k))+'px)'+(j===2&&k>=1?' scale('+(1+0.04*Math.sin(c*6))+')':'');});
  $('pbar').style.width=(100*t/D.dur)+'%';
  // Grain
  const a=gi.data;let sd=fr*9973+1;for(let j=0;j<a.length;j+=4){sd=(sd*16807)%2147483647;const v=sd&255;a[j]=a[j+1]=a[j+2]=v;a[j+3]=255;}g.putImageData(gi,0,0);
}
frame(0);
</script></body></html>`;
fs.writeFileSync(path.join(tmp, 'page.html'), html);
(async () => {
  const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file:///' + path.join(tmp, 'page.html').replace(/\\/g, '/')); await p.evaluate(() => document.fonts.ready);
  const fps = 30, n = Math.ceil(dur * fps);
  const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', mix,
    '-map', '0:v', '-map', '1:a', '-t', dur.toFixed(2), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '192k', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => frame(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 88 });
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
  }
  enc.stdin.end(); await new Promise(r => enc.on('close', r)); await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', out, '-frames:v', '1', out.replace(/\.mp4$/, '-cover.jpg')]);
  console.log(out, dur.toFixed(1) + 's', n + ' frames');
})();
