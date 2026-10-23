#!/usr/bin/env python3
"""Assemble la voix d'un Short (une phrase par fichier WAV) et écrit le JSON de rendu pour short2.js.

Usage : python3 social/assemble.py social/shorts/XXX.spec.json
Spec : {
  "out": "XXX",                       # préfixe des fichiers produits dans social/shorts/
  "dir": "s002",                      # dossier des WAV (t1.wav, t2.wav…) et images, relatif à social/shorts/
  "sentences": [ { "wav": "t1.wav", "gap": 0.6, "subs": [[début, fin|null, "texte", ["mots en jaune"]], …] }, … ],
  "images": [ { "src": "img1.jpg", "from_sentence": 1 }, … ],
  "stickers": [ { "sentence": 2, "offset": 0.9, "end_sentence": 3, "text": "…", "sub": "…" } ],
  "cta": { "sentence": 7, "kicker": "…", "title": "…", "url": "…", "sub": "…" },
  "label": "ALERTE ARNAQUE"
}
Une fin de sous-phrase à null vaut la durée de la phrase.
"""
import json, subprocess, sys, shutil
from pathlib import Path

spec_path = Path(sys.argv[1]); base = spec_path.parent; S = json.loads(spec_path.read_text())
src = base / S["dir"]
dur = lambda f: float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))

t = 0.3; starts = []; phrases = []
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-t", "0.3", "-i", "anullsrc=r=44100:cl=mono"]; segs = ["[0:a]"]; i = 1
for s in S["sentences"]:
    d = dur(src / s["wav"]); starts.append(t)
    for a, b, tx, hi in s["subs"]:
        phrases.append({"from": round(t + a, 2), "to": round(t + (d if b is None else b), 2), "text": tx, "hi": hi})
    cmd += ["-i", str(src / s["wav"]), "-f", "lavfi", "-t", str(s.get("gap", 0.6)), "-i", "anullsrc=r=44100:cl=mono"]
    segs += [f"[{i}:a]", f"[{i+1}:a]"]; i += 2
    t += d + s.get("gap", 0.6)
audio = f"{S['out']}-voix.mp3"
cmd += ["-filter_complex", "".join(segs) + f"concat=n={len(segs)}:v=0:a=1[o]", "-map", "[o]", "-c:a", "libmp3lame", "-b:a", "192k", str(base / audio)]
subprocess.run(cmd, check=True)

st = lambda n: starts[n - 1]
imgs = S["images"]; images = []
for k, im in enumerate(imgs):
    name = f"{S['out']}-{im['src']}"; shutil.copy(src / im["src"], base / name)
    end = st(imgs[k + 1]["from_sentence"]) if k + 1 < len(imgs) else st(S["cta"]["sentence"]) + S["cta"].get("offset", 0) + 0.5
    images.append({"src": name, "from": 0 if k == 0 else st(im["from_sentence"]), "to": end})
stickers = [{"from": st(x["sentence"]) + x.get("offset", 0), "to": st(x["end_sentence"]) - 0.15, "text": x["text"], **({"sub": x["sub"]} if x.get("sub") else {})} for x in S.get("stickers", [])]
c = dict(S["cta"]); c["from"] = st(c.pop("sentence")) + c.pop("offset", -0.1)
R = {"label": S.get("label", "ALERTE ARNAQUE"), "audio": audio, "images": images, "phrases": phrases, "stickers": stickers, "cta": c}
(base / f"{S['out']}.json").write_text(json.dumps(R, ensure_ascii=False, indent=0))
print(base / f"{S['out']}.json", f"{t:.1f}s")
