#!/usr/bin/env python3
"""Assemble le site statique SecureGuide.fr dans ./dist (publié sur GitHub Pages)."""
import re, shutil, json, datetime
from pathlib import Path

ROOT = Path(__file__).parent
SRC, OUT = ROOT / "src", ROOT / "dist"
SITE = "https://secureguide.fr"
TODAY = datetime.date.today().isoformat()

# Liens d'affiliation : remplacer chaque URL par le lien affilié dès qu'il est fourni.
AFFILIATE = json.loads((SRC / "affiliate.json").read_text())

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112..125,600..900'
         '&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap">')

MARK = (SRC / "brand/mark.svg").read_text().replace('role="img" aria-label="SecureGuide"', 'aria-hidden="true"')
def mark(uid):
    return MARK.replace("sg-in", f"sg-in-{uid}").replace("sg-sweep", f"sg-sweep-{uid}")
WORDMARK = '<span class="wm"><span class="wm-a">Secure</span><span class="wm-b">Guide</span><span class="wm-c">.fr</span></span>'

# Mentions de produits à transformer en liens d'affiliation (texte courant uniquement)
AUTOLINK = {"NordVPN": "LIEN_NORDVPN", "NordPass": "LIEN_NORDPASS"}

def autolink(html):
    """Relie chaque mention NordVPN / NordPass hors titres, liens et scripts vers le lien affilié."""
    parts = re.split(r"(<[^>]+>)", html)
    skip, out = 0, []
    pat = re.compile(r"\b(" + "|".join(AUTOLINK) + r")\b")
    for part in parts:
        if part.startswith("<"):
            m = re.match(r"<(/?)(a|h[1-6]|script|style|title)\b", part, re.I)
            if m:
                skip += -1 if m.group(1) else 1
            out.append(part)
        elif skip <= 0 and part:
            out.append(pat.sub(lambda m: f'<a class="aff-inline" href="{AFFILIATE[AUTOLINK[m.group(1)]]}" '
                                         f'rel="sponsored noopener" target="_blank">{m.group(1)}</a>', part))
        else:
            out.append(part)
    return "".join(out)

def nav(active):
    items = [("/radar/", "Radar", "radar"), ("/guides/", "Guides", "guides"),
             ("/test-protection/", "Faire le test", "test")]
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}{" class=\"cta-s\"" if k == "test" else ""}>{t}</a>'
        for h, t, k in items)
    return (f'<nav class="nav"><div class="nav-in"><a class="brand" href="/" aria-label="SecureGuide.fr, accueil">{mark("nav")}{WORDMARK}</a>'
            f'<div class="links">{links}</div></div></nav>')

FOOT = f'''<footer class="foot"><div class="foot-in">
<div><a class="brand foot-brand" href="/" aria-label="SecureGuide.fr, accueil">{mark("foot")}{WORDMARK}</a><p>La veille des arnaques en France, en Belgique et au Luxembourg, et les bons réflexes pour s'en protéger.</p>
<p>Contact : <span>secureguide2024@gmail.com</span></p></div>
<div><h4>Le site</h4><ul><li><a href="/radar/">Radar des arnaques</a></li><li><a href="/test-protection/">Test de protection</a></li><li><a href="/guides/">Guides et comparatifs</a></li></ul></div>
<div><h4>Infos</h4><ul><li><a href="/mentions-legales/">Mentions légales</a></li><li><a href="/mentions-legales/#affiliation">Affiliation</a></li><li><a href="/mentions-legales/#donnees">Données personnelles</a></li></ul></div>
<p class="small">Certains liens du site sont affiliés : SecureGuide.fr peut toucher une commission, sans surcoût pour vous. En cas d'arnaque en cours, contactez d'abord votre banque.</p>
</div></footer>'''

def page(path, title, desc, body, active="", extra_head="", og_type="website"):
    url = SITE + path
    html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="fr_FR">
<meta name="theme-color" content="#0A2533">
<meta name="impact-site-verification" value="9298fb5c-374a-40b3-9497-a3e6edbdf582">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="/assets/site.css">
{extra_head}
</head>
<body>
{nav(active)}
{body}
{FOOT}
<div hidden>Impact-Site-Verification: 9298fb5c-374a-40b3-9497-a3e6edbdf582</div>
</body>
</html>
'''
    dest = OUT / path.lstrip("/") / "index.html" if path.endswith("/") else OUT / path.lstrip("/")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html)
    return path

def must_sub(pattern, repl, text, flags=0):
    new, n = re.subn(pattern, repl, text, flags=flags)
    assert n, f"motif introuvable : {pattern[:60]}"
    return new

BREVO_FORM = (SRC / "brevo_form.html").read_text().strip() if (SRC / "brevo_form.html").exists() else ""

def strip_head(src):
    """Retire <title> et les <link> de polices d'une page autonome, et branche la newsletter."""
    src = re.sub(r"<title>.*?</title>\s*", "", src, flags=re.S)
    src = re.sub(r'<link [^>]*>\s*', "", src)
    if BREVO_FORM:
        src = must_sub(r'<form id="mail">.*?</form>', BREVO_FORM, src, re.S)
        src = must_sub(r'<p class="note" id="mailnote">.*?</p>', '<p class="note">Gratuit. Désinscription en un clic.</p>', src, re.S)
    else:
        # Tant que Brevo n'est pas relié, pas de faux formulaire en ligne
        src = must_sub(r'<form id="mail">.*?</form>\s*', "", src, re.S)
        src = must_sub(r'<p class="note" id="mailnote">.*?</p>',
                       '<p class="note"><b>Lancement très prochain.</b> Le formulaire d\'inscription arrive dans quelques jours.</p>', src, re.S)
    src = re.sub(r'(\$\("mail"\)|document\.getElementById\("mail"\))\.addEventListener', r'\1?.addEventListener', src)
    return src

def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "assets").mkdir(parents=True)
    shutil.copy(SRC / "site.css", OUT / "assets/site.css")
    shutil.copy(SRC / "alerts.js", OUT / "assets/alerts.js")
    shutil.copy(SRC / "brand/mark.svg", OUT / "assets/favicon.svg")
    shutil.copy(SRC / "brand/mark.svg", OUT / "assets/logo.svg")
    pages = []

    # Accueil
    pages.append(page("/", "SecureGuide.fr · Le radar des arnaques",
        "Les arnaques qui circulent en France, en Belgique et au Luxembourg, expliquées simplement, avec le bon réflexe pour chacune.",
        (SRC / "home.html").read_text()))

    # Radar : données dans /assets/alerts.js, partagées avec l'accueil
    radar = strip_head((SRC / "radar.html").read_text())
    radar = must_sub(r'<span class="logo">.*?</span>\s*', "", radar, re.S)
    radar = must_sub(r"const ALERTS=\[.*?\];\n", "const ALERTS=window.ALERTS||[];\n", radar, re.S)
    radar = must_sub(r"<script>", '<script src="/assets/alerts.js"></script>\n<script>', radar)
    radar = radar.replace('class="foot"', 'class="endnote"').replace(".foot{", ".endnote{").replace(".foot a{", ".endnote a{")
    radar = must_sub(r'<a href="https://secureguide.fr" target="_blank" rel="noopener">Faites le test en 2 minutes</a>',
                     '<a href="/test-protection/">Faites le test en 2 minutes</a>', radar)
    radar = must_sub(r"body\{background:var\(--bg\);[^}]*\}", "", radar)
    pages.append(page("/radar/", "Radar des arnaques · SecureGuide.fr",
        "Les arnaques en circulation cette semaine en France, en Belgique et au Luxembourg, le piège et le bon réflexe, avec les sources officielles.",
        radar, active="radar"))

    # Test de protection
    quiz = strip_head((SRC / "quiz.html").read_text())
    quiz = must_sub(r'<span class="logo">.*?</span>\s*', "", quiz, re.S)
    quiz = must_sub(r"body\{background:var\(--bg\);[^}]*\}", "", quiz)
    links = {"Voir notre comparatif des gestionnaires": "/guides/meilleur-gestionnaire-mots-de-passe/",
             "Comparer les gestionnaires": "/guides/meilleur-gestionnaire-mots-de-passe/",
             "Faut-il un VPN ? Notre guide": "/guides/vpn-famille/",
             "Reconnaître un SMS frauduleux": "/radar/"}
    for label, url in links.items():
        quiz = must_sub(re.escape(f'l:"{label}"'), f'l:"{label}",u:"{url}"', quiz)
    # Sans page dédiée, pas de lien : on retire les autres libellés
    quiz = re.sub(r',l:"[^"]*"(?!,u:)', "", quiz)
    quiz = must_sub(r'<a href="https://secureguide.fr" target="_blank" rel="noopener"></a>', "<a></a>", quiz)
    quiz = must_sub(re.escape('li.querySelector("a").textContent=g.q.l+" →";'),
                    'const A2=li.querySelector("a");if(g.q.u){A2.href=g.q.u;A2.textContent=g.q.l+" →"}else A2.remove();', quiz)
    quiz = quiz.replace("Rédigé par un expert réseau certifié CCNP", "Rédigé par un expert réseau certifié Cisco CCNP")
    pages.append(page("/test-protection/", "Test : votre famille est-elle protégée en ligne ? · SecureGuide.fr",
        "10 questions, 2 minutes : obtenez votre score de protection sur 100 et les 3 failles à corriger en priorité.",
        quiz, active="test"))

    # Guides
    guides = []
    for f in sorted((SRC / "guides").glob("*.html")):
        raw = f.read_text()
        meta = dict(re.findall(r"^(Titre SEO|Meta description|Slug|Mot-clé principal) : (.+)$", raw, re.M))
        body = re.sub(r"<!--.*?-->\s*", "", raw, flags=re.S)
        h1 = re.search(r"<h1>(.*?)</h1>", body).group(1)
        body = re.sub(r"<h1>.*?</h1>\s*", "", body)
        for key, url in AFFILIATE.items():
            body = body.replace(f"[{key}]", url)
        assert "[LIEN_" not in body, f"lien d'affiliation manquant dans {f.name}"
        body = autolink(body)
        body = re.sub(r"<table>(.*?)</table>", r'<div class="tbl"><table>\1</table></div>', body, flags=re.S)
        body = body.replace('href="/test-protection"', 'href="/test-protection/"')
        kind = "Alerte arnaque" if "arnaque" in meta["Slug"] else "Comparatif" if "comparatif" in meta["Meta description"].lower() or "Comparatif" in h1 else "Guide"
        slug = meta["Slug"].strip()
        ld = json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": meta["Titre SEO"],
                         "description": meta["Meta description"], "inLanguage": "fr",
                         "datePublished": TODAY, "dateModified": TODAY,
                         "author": {"@type": "Organization", "name": "SecureGuide.fr"},
                         "publisher": {"@type": "Organization", "name": "SecureGuide.fr"},
                         "mainEntityOfPage": f"{SITE}/guides/{slug}/"}, ensure_ascii=False)
        html = (f'<header class="art-hero"><div class="art-hero-in"><span class="kicker">{kind}</span><h1>{h1}</h1>'
                f'<span class="byline">Par SecureGuide.fr · mis à jour le {datetime.date.today().strftime("%d/%m/%Y")}</span></div></header>'
                f'<main class="art-wrap"><article class="art">{body}</article>'
                f'<aside class="promo"><div><b>Êtes-vous bien protégé ?</b><span>10 questions, un score sur 100, vos 3 priorités.</span></div>'
                f'<a class="btn-y" href="/test-protection/">Faire le test</a></aside></main>')
        guides.append((slug, h1, kind, meta["Meta description"]))
        pages.append(page(f"/guides/{slug}/", meta["Titre SEO"] + " · SecureGuide.fr", meta["Meta description"], html,
                          active="guides", og_type="article",
                          extra_head=f'<script type="application/ld+json">{ld}</script>'))

    cards = "".join(f'<a class="g-card" href="/guides/{s}/"><span>{k}</span><b>{t}</b><p>{d}</p></a>' for s, t, k, d in guides)
    pages.append(page("/guides/", "Guides et comparatifs · SecureGuide.fr",
        "Nos guides pratiques et comparatifs pour protéger votre famille ou votre petite entreprise en ligne.",
        '<style>.g-list{display:grid;gap:14px}.g-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;text-decoration:none;display:flex;flex-direction:column;gap:6px}'
        '.g-card:hover{border-color:var(--ink)}.g-card span{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}'
        '.g-card b{font-family:var(--wide);font-stretch:112%;font-weight:800;font-size:20px;line-height:1.2}.g-card p{margin:0;color:var(--muted);font-size:15.5px}</style>'
        f'<main class="page"><h1>Guides et comparatifs</h1><div class="g-list">{cards}</div></main>', active="guides"))

    pages.append(page("/mentions-legales/", "Mentions légales · SecureGuide.fr",
        "Mentions légales, affiliation et données personnelles de SecureGuide.fr.",
        (SRC / "legal.html").read_text()))

    page("/404.html", "Page introuvable · SecureGuide.fr", "Cette page n'existe pas.",
         '<main class="page"><h1>Page introuvable</h1><p>Cette page n\'existe pas ou a été déplacée.</p>'
         '<p><a class="btn-y" href="/">Retour à l\'accueil</a></p></main>')

    (OUT / "CNAME").write_text("secureguide.fr\n")
    (OUT / ".nojekyll").write_text("")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    urls = "".join(f"<url><loc>{SITE}{p}</loc><lastmod>{TODAY}</lastmod></url>" for p in pages)
    (OUT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
    print(f"{len(pages)} pages générées dans {OUT}")

if __name__ == "__main__":
    build()
