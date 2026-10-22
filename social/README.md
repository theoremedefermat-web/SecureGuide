# Publications Facebook quotidiennes (page SecureGuide)

Chaque jour : 1 publication = 1 visuel 1080x1350 + 1 texte, **validée par Stéphane avant publication**.

## Fabriquer
1. `social/posts/AAAA-MM-JJ.json` (champs : type, kicker, big, title, lines, cta) puis
   `node social/post.js social/posts/AAAA-MM-JJ.json` → PNG (playwright requis ; Chromium : /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
2. `social/posts/AAAA-MM-JJ.txt` : texte du post (400-900 caractères, emojis sobres, 1 CTA, 3-5 hashtags).
   Lien : https://secureguide.fr/kit/?utm_source=facebook&utm_medium=organic&utm_campaign=posts (ou /radar/, /test-protection/).

## Calendrier éditorial (jour de la semaine)
- Lundi : ALERTE (type alerte) — une arnaque du Radar (src/alerts.js), le piège et le réflexe.
- Mardi : RÉFLEXE (type reflexe) — un geste concret (double authentification, mot code familial, WhatsApp…).
- Mercredi : VRAI OU FAUX (type quiz) — une idée reçue, réponse dans le texte, inviter à commenter.
- Jeudi : LE CHIFFRE (type stat) — une statistique officielle sourcée.
- Vendredi : KIT (type kit) — promo du kit gratuit /kit/ ou du test /test-protection/.
- Samedi : RÉFLEXE pour les parents/seniors — 1 fois sur 2 mentionner le guide seniors Etsy (5,99 €) sans insister.
- Dimanche : ALERTE — « Radar de la semaine » : les 3 arnaques de la semaine, lien /radar/.

## Règles
- Jamais de chiffre, de citation ou d'arnaque non sourcés (sources officielles : Cybermalveillance, Police grand-ducale, Safeonweb, OSMP, BEE SECURE). Citer la source dans le texte.
- Jamais de faux témoignage ni de faux avis.
- Ne pas répéter un sujet des 14 derniers jours (lire social/posts/).
- Français sans fautes, espaces insécables avant : ; ? !
