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

PRODUCTS = json.loads((SRC / "products.json").read_text())
PROD = {p["id"]: p for p in PRODUCTS}
ICONS = {
    "shield": '<path d="M12 2.5l8 3v6c0 5-3.4 9.1-8 10.5-4.6-1.4-8-5.5-8-10.5v-6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "family": '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6"/><path d="M13.5 20c.3-2.6 1.8-4.6 3.5-4.6s3.4 2 3.5 4.6"/>',
    "check": '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9l2 2 4-4"/><path d="M8 15h8"/>',
    "spark": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
}
def icon(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'

def product_promo(pid, lead="Allez plus loin"):
    p = PROD[pid]
    return (f'<aside class="prod-promo"><div class="pp-ic">{icon(p["icon"])}</div><div class="pp-tx">'
            f'<span class="pp-k">{lead} · Guide PDF</span><b>{p["title"]}</b><span>{p["desc"]}</span></div>'
            f'<a class="btn-y" href="{p["url"]}" target="_blank" rel="noopener">Voir le guide</a></aside>')

def cover(p, size=""):
    l1, l2, l3 = p["cover"]
    return (f'<div class="cv {size}" style="--ac:{p["accent"]}" aria-hidden="true"><span class="cv-band"></span>'
            f'<span class="cv-k">SecureGuide.fr</span><span class="cv-t">{l1}<br>{l2}<br><em>{l3}</em></span>'
            f'<span class="cv-f">{mark("cv-" + p["id"] + size)}<span>Guide PDF</span></span></div>')

def ebooks_page():
    li = lambda xs: "".join(f"<li>{x}</li>" for x in xs)
    order = ["seniors", "parents", "famille", "ia50"]
    cards = "".join(
        f'<article class="eb" id="{p["id"]}"><div class="eb-cv">{cover(p)}</div><div class="eb-tx">'
        f'<span class="eb-pay">E-book payant · PDF</span><h2>{p["title"]}</h2><p class="eb-for">{p["for"]}</p>'
        f'<p>{p["desc"]}</p><h3>Les principaux sujets</h3><ul class="sh-in">{li(p["inside"])}</ul>'
        f'<a class="btn-y" href="{p["url"]}" target="_blank" rel="noopener">Voir le guide et son prix sur Etsy</a></div></article>'
        for p in (PROD[k] for k in order))
    return f"""
<header class="sh-hero"><div class="sh-hero-in">
<span class="kicker">E-books</span>
<h1>Des e-books simples pour protéger vos proches</h1>
<p>Rédigés par un expert réseau et sécurité certifié Cisco CCNP, en français et sans jargon. Chaque e-book est un guide PDF payant, vendu sur Etsy.</p>
<ul class="sh-pts"><li>PDF en français</li><li>Téléchargement immédiat</li><li>Paiement sécurisé par Etsy</li></ul>
</div></header>
<main class="sh-main"><div class="sh-wrap">
<nav class="eb-toc" aria-label="Les e-books"><a href="#seniors">Seniors</a><a href="#parents">Parents et enfants</a><a href="#famille">Toute la famille</a><a href="#ia50">IA après 50 ans</a></nav>
<section class="eb-list">{cards}</section>
<section class="sh-steps"><h2 class="sh-h">Comment ça marche</h2><ol>
<li><b>Choisissez votre e-book</b><span>Cliquez sur « Voir le guide et son prix sur Etsy » pour consulter le détail et le prix.</span></li>
<li><b>Payez sur Etsy</b><span>Paiement sécurisé par carte ou PayPal, géré entièrement par Etsy.</span></li>
<li><b>Téléchargez le PDF</b><span>Le fichier est disponible tout de suite. Lisible sur téléphone et ordinateur, ou à imprimer.</span></li>
</ol></section>
<section class="eb-free"><span class="eb-freek">Gratuit</span><h2 class="sh-h">Conseils et comparatifs gratuits</h2>
<p>Sans achat ni inscription : nos contenus gratuits pour vous protéger dès aujourd'hui.</p>
<div class="eb-free-grid">
<a href="/test-protection/"><b>Faire le test</b><span>5 questions, un score sur 100 et vos priorités.</span></a>
<a href="/radar/"><b>Le Radar des arnaques</b><span>Les arnaques de la semaine et le bon réflexe pour chacune.</span></a>
<a href="/guides/"><b>Guides et comparatifs</b><span>Gestionnaires de mots de passe, VPN, antivirus, alertes détaillées.</span></a>
<a href="/kit/?utm_source=site&amp;utm_medium=ebooks&amp;utm_campaign=kit2026"><b>Le Kit anti-arnaques 2026</b><span>Un PDF gratuit, reçu par email.</span></a>
</div></section>
<p class="sh-note">Tous nos e-books sont aussi visibles sur notre <a href="https://www.etsy.com/fr/shop/SecureGuideFR" target="_blank" rel="noopener">boutique SecureGuideFR sur Etsy</a>.</p>
</div></main>"""

REDIRECT = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>E-books · SecureGuide.fr</title><meta name="robots" content="noindex"><link rel="canonical" href="{site}{to}">
<meta http-equiv="refresh" content="0; url={to}"><script>location.replace("{to}"+location.hash)</script>
<style>body{{margin:0;font-family:system-ui,sans-serif;background:#0A2533;color:#EAF3F7;display:grid;place-items:center;min-height:100vh;padding:16px}}a{{color:#F2B33D}}</style></head>
<body><p>La boutique s'appelle désormais « E-books » : <a href="{to}">continuer vers les e-books</a>.</p></body></html>
"""

def nav(active):
    items = [("/radar/", "Radar", "radar"), ("/guides/", "Guides", "guides"), ("/ebooks/", "E-books", "shop"),
             ("/test-protection/", "Faire le test", "test")]
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}{" class=\"cta-s\"" if k == "test" else ""}>{t}</a>'
        for h, t, k in items)
    return (f'<nav class="nav"><div class="nav-in"><a class="brand" href="/" aria-label="SecureGuide.fr, accueil">{mark("nav")}{WORDMARK}</a>'
            f'<div class="links">{links}</div></div></nav>')

MINI_NAV = (f'<nav class="nav"><div class="nav-in"><a class="brand" href="/" aria-label="SecureGuide.fr, accueil">{mark("nav")}{WORDMARK}</a></div></nav>')

KIT_BAR = ('<a class="kit-bar" href="/kit/?utm_source=site&amp;utm_medium=bandeau&amp;utm_campaign=kit2026">'
           '<b>Gratuit</b><span>Le Kit anti-arnaques 2026 : les 6 arnaques du moment et la carte des numéros utiles</span><i>Le recevoir →</i></a>')

def kit_form():
    """Formulaire Brevo adapté à la page du kit."""
    f = BREVO_FORM.replace(">Recevoir le Radar</button>", ">Recevoir le kit gratuit</button>")
    f = f.replace('<form id="sib-form" ', '<form id="sib-form" data-redirect="/kit/merci/" ', 1)
    f = f.replace("Merci ! Le prochain Radar arrive dimanche.",
                  'C\'est envoyé ! <a href="/kit/merci/">Ouvrez votre kit ici</a>.')
    assert "Recevoir le kit gratuit" in f and "/kit/merci/" in f
    return f

FOOT = f'''<footer class="foot"><div class="foot-in">
<div><a class="brand foot-brand" href="/" aria-label="SecureGuide.fr, accueil">{mark("foot")}{WORDMARK}</a><p>La veille des arnaques en France, en Belgique et au Luxembourg, et les bons réflexes pour s'en protéger.</p>
<p>Contact : <span>secureguide2024@gmail.com</span></p></div>
<div><h4>Le site</h4><ul><li><a href="/radar/">Radar des arnaques</a></li><li><a href="/test-protection/">Test de protection</a></li><li><a href="/guides/">Guides et comparatifs</a></li><li><a href="/ebooks/">E-books</a></li></ul></div>
<div><h4>Infos</h4><ul><li><a href="/mentions-legales/">Mentions légales</a></li><li><a href="/mentions-legales/#affiliation">Affiliation</a></li><li><a href="/mentions-legales/#donnees">Données personnelles</a></li></ul></div>
<p class="small">Certains liens du site sont affiliés : SecureGuide.fr peut toucher une commission, sans surcoût pour vous. En cas d'arnaque en cours, contactez d'abord votre banque.</p>
</div></footer>'''

def page(path, title, desc, body, active="", extra_head="", og_type="website", minimal=False, noindex=False, kit_bar=True):
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
{extra_head}{'<meta name="robots" content="noindex">' if noindex else ""}
</head>
<body>
{MINI_NAV if minimal else nav(active) + (KIT_BAR if kit_bar else '')}
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
    shutil.copytree(SRC / "ads", OUT / "assets/ads")
    shutil.copytree(SRC / "kit", OUT / "assets/kit")
    shutil.copytree(SRC / "social", OUT / "assets/social")
    pages = []

    # Accueil
    pages.append(page("/", "SecureGuide.fr · Le radar des arnaques",
        "Les arnaques qui circulent en France, en Belgique et au Luxembourg, expliquées simplement, avec le bon réflexe pour chacune.",
        (SRC / "home.html").read_text(), kit_bar=False))

    # Radar : données dans /assets/alerts.js, partagées avec l'accueil
    radar = strip_head((SRC / "radar.html").read_text())
    radar = must_sub(r'<span class="logo">.*?</span>\s*', "", radar, re.S)
    radar = must_sub(r"const ALERTS=\[.*?\];\n", "const ALERTS=window.ALERTS||[];\n", radar, re.S)
    radar = must_sub(r"<script>", '<script src="/assets/alerts.js"></script>\n<script>', radar)
    radar = radar.replace('class="foot"', 'class="endnote"').replace(".foot{", ".endnote{").replace(".foot a{", ".endnote a{")
    radar = must_sub(r'<a href="https://secureguide.fr" target="_blank" rel="noopener">Faites le test en 1 minute</a>',
                     '<a href="/test-protection/">Faites le test en 1 minute</a>', radar)
    radar = must_sub(r"body\{background:var\(--bg\);[^}]*\}", "", radar)
    pages.append(page("/radar/", "Radar des arnaques · SecureGuide.fr",
        "Les arnaques en circulation cette semaine en France, en Belgique et au Luxembourg, le piège et le bon réflexe, avec les sources officielles.",
        radar, active="radar"))

    # Test de protection
    quiz = strip_head((SRC / "quiz.html").read_text())
    quiz = must_sub(r'<span class="logo">.*?</span>\s*', "", quiz, re.S)
    quiz = must_sub(r"body\{background:var\(--bg\);[^}]*\}", "", quiz)
    links = {"Voir notre comparatif des gestionnaires": "/guides/meilleur-gestionnaire-mots-de-passe/",
             "Voir les arnaques du moment": "/radar/"}
    for label, url in links.items():
        quiz = must_sub(re.escape(f'l:"{label}"'), f'l:"{label}",u:"{url}"', quiz)
    # Sans page dédiée, pas de lien : on retire les autres libellés
    quiz = re.sub(r',l:"[^"]*"(?!,u:)', "", quiz)
    quiz = must_sub(r'<a href="https://secureguide.fr" target="_blank" rel="noopener"></a>', "<a></a>", quiz)
    quiz = must_sub(re.escape('li.querySelector("a").textContent=g.q.l+" →";'),
                    'const A2=li.querySelector("a");if(g.q.u){A2.href=g.q.u;A2.textContent=g.q.l+" →"}else A2.remove();', quiz)
    quiz = quiz.replace("Rédigé par un expert réseau certifié CCNP", "Rédigé par un expert réseau certifié Cisco CCNP")
    quiz = quiz.replace("/*PRODUCTS*/[]", json.dumps({k: {"t": v["title"], "d": v["desc"], "u": v["url"], "f": v["for"]} for k, v in PROD.items()}, ensure_ascii=False))
    pages.append(page("/test-protection/", "Test : vos habitudes en ligne vous protègent-elles ? · SecureGuide.fr",
        "5 questions, environ 1 minute : un bilan de vos habitudes en ligne, avec un score sur 100 et vos priorités. Résultat immédiat, sans email.",
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
                f'<aside class="promo"><div><b>Êtes-vous bien protégé ?</b><span>5 questions, un score sur 100 et vos priorités, sans email.</span></div>'
                f'<a class="btn-y" href="/test-protection/">Faire le test</a></aside>'
                f'<aside class="promo"><div><b>Le Kit anti-arnaques 2026, gratuit</b><span>Les 6 arnaques du moment, la carte des numéros utiles, 10 points à cocher.</span></div>'
                f'<a class="btn-y" href="/kit/?utm_source=site&amp;utm_medium=article&amp;utm_campaign=kit2026">Recevoir le kit</a></aside>' + product_promo("seniors" if kind == "Alerte arnaque" else "famille", "Protégez vos proches" if kind == "Alerte arnaque" else "Allez plus loin") + '</main>')
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

    pages.append(page("/ebooks/", "E-books de cybersécurité pour la famille · SecureGuide.fr",
        "Quatre e-books PDF en français, sans jargon : arnaques et seniors, enfants et écrans, cybersécurité en famille, IA après 50 ans. Disponibles sur Etsy.",
        ebooks_page(), active="shop"))
    # Ancienne adresse : redirection vers /ebooks/ (GitHub Pages n'a pas de redirection serveur)
    (OUT / "boutique").mkdir(parents=True, exist_ok=True)
    (OUT / "boutique/index.html").write_text(REDIRECT.format(site=SITE, to="/ebooks/"))
    # Tunnel : page de capture du kit gratuit, puis page de téléchargement avec l'offre
    kit = (SRC / "kit.html").read_text().replace("<!--FORM-->", kit_form()).replace("<!--MARK-->", mark("kit"))
    pages.append(page("/kit/", "Kit anti-arnaques 2026 gratuit · SecureGuide.fr",
        "Recevez gratuitement le Kit anti-arnaques 2026 : les 6 arnaques du moment, la carte des numéros utiles et 10 points pour protéger la famille.",
        kit, minimal=True))
    fe = PROD["seniors"]
    merci = (SRC / "kit_merci.html").read_text()
    page("/kit/confirme/", "Adresse confirmée · SecureGuide.fr", "Votre Kit anti-arnaques 2026 arrive par email.", (SRC / "kit_confirme.html").read_text(), minimal=True, noindex=True)
    page("/kit/merci/", "Votre kit est prêt · SecureGuide.fr", "Téléchargez votre Kit anti-arnaques 2026.", merci, minimal=True, noindex=True)

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
