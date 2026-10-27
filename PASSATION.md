# Passation SecureGuide.fr

À lire en premier par toute nouvelle conversation Claude qui reprend le projet.
Dernière mise à jour : 25/10/2026.

**Aucun mot de passe, jeton ni clé API ne figure ici, et il ne faut jamais en ajouter.** Les accès passent par les connecteurs de Stéphane (Brevo, Adspirer, invideo, Google Drive, Canva) et par son navigateur Chrome, déjà connecté à Facebook, Brevo, YouTube et Etsy.

## Le projet

- **Quoi** : SecureGuide.fr, « le Radar des arnaques » pour la France, la Belgique et le Luxembourg.
- **Pour qui** : Stéphane, expert réseau et sécurité certifié Cisco CCNP, qui travaille au Luxembourg.
- **Comment ça rapporte** : affiliation (NordVPN, NordPass, Bitdefender, 1Password) et e-books PDF vendus sur Etsy.
- **Budget** : 100 € par mois.
- **Ton** : simple, rassurant, sans jargon ni alarmisme. Aucun chiffre sans source, aucun faux témoignage, aucun prix inventé.
- **Règle de travail** : Stéphane veut que Claude fasse tout lui-même. Il faut toutefois **son « ok » explicite avant** :
  - toute publication sur Facebook ;
  - tout déploiement du site ;
  - toute dépense.

## Le site

- **Dépôt** : https://github.com/theoremedefermat-web/SecureGuide.
- **Branches** :
  - `main` : les sources ;
  - `gh-pages` : le site publié (GitHub Pages, domaine secureguide.fr).
- **Générer** : `python3 build.py` produit `dist/`.
- **Publier** : `./publish.sh "message"` génère le site puis pousse `dist/` sur `gh-pages`. Uniquement après validation de Stéphane.
- **Pages** :
  - `/` : accueil, avec « Faire le test » comme bouton principal ;
  - `/radar/` : le Radar (données dans `src/alerts.js`) ;
  - `/test-protection/` : le test en 5 questions (`src/quiz.html`) ;
  - `/ebooks/` : les e-books ; l'ancienne adresse `/boutique/` y redirige ;
  - `/guides/…` : les articles (`src/guides/*.html`) ;
  - `/kit/`, `/kit/merci/` : le tunnel du kit gratuit.
- **Fichiers de données** :
  - `src/products.json` : les 4 e-books et leurs liens Etsy (boutique SecureGuideFR) ;
  - `src/affiliate.json` : les liens d'affiliation ;
  - `src/brevo_form.html` : le formulaire Brevo, avec un script d'envoi maison.
- **Tests du parcours** : `outils/test.js` (Playwright, mobile et ordinateur). Il suppose `python3 -m http.server 8765 -d dist`.
- **Outils de génération** (`outils/`) : `kit.js` (PDF du kit), `ads.js` et `adkit.js` (visuels des pubs), `logo.js`. Les chemins y sont écrits pour `/home/claude/` : il faut les adapter sur l'ordinateur.

## E-mails : Brevo

- **Liste** : n°2 « Votre première liste ».
- **Expéditeur** : id 2, SecureGuide, radar@secureguide.fr.
- **Formulaire** « Radar des arnaques » : id `6ad127192a018b8e9ad7b3c0`, inscription simple sans double opt-in. Après inscription, la page `/kit/merci/` renvoie vers la boîte email.
- **Automatisation n°1** « Tunnel kit gratuit » (active) :
  1. déclenchement : ajout à la liste 2 ;
  2. modèle 9 (le kit) ;
  3. attente de 2 jours, puis modèle 10 (seniors) ;
  4. attente de 3 jours, puis modèle 11 (test et guides).
- **Sources des emails** : `emails/e1.html`, `e2.html`, `e3.html`.
- **Attention** : une adresse déjà présente dans la liste ne redéclenche pas l'automatisation. Pour tester, utiliser une adresse nouvelle (par exemple avec `+test`).

## Publicité Meta (via Adspirer, offre gratuite de 15 actions par mois)

- **Compte** : 988056564712575.
- **Campagne** : 120251361275970185 « SecureGuide - Guide anti-arnaques seniors - Sprint 14j ».
- **Ensemble A (35-60 ans)** : 120251361276130185, pub kit A 120251365319900185.
- **Ensemble B (62 ans et plus)** : 120251361277540185, pub kit B 120251365320320185.
- **Visuel** : `src/ads/pub-4-kit.png`. Les anciennes pubs sont désactivées.

## Facebook

- **Page** : « SecureGuide », id 1239294215931177.
- **Fonctionnement** : un post par jour, toujours validé par Stéphane avant publication.
- **Où est tout** :
  - posts : `social/posts/AAAA-MM-JJ.{json,png,txt}` ;
  - générateur de visuel : `social/post.js` ;
  - calendrier et règles : `social/README.md`.
- **Constat du 27/10**, d'après la liste des posts publiés dans Meta Business Suite :
  - publiés : le 25/10 (« Radar de la semaine ») et le 27/10 (« verrouillez votre WhatsApp », publié par Stéphane depuis son téléphone) ;
  - jamais publiés : le 22/10 (« 516 M€ »), le 23/10, le 24/10 et le 26/10. Ils sont dans `social/posts/` et peuvent être réutilisés ;
  - avant ça, le dernier post datait du 26 août.
- **Cause** : la routine cloud préparait les posts mais ne pouvait pas les publier, faute d'accès à Chrome.
- **Pour vérifier ce qui est publié** : ouvrir https://business.facebook.com/latest/posts/published_posts?asset_id=1239294215931177. Le profil public charge mal les posts.
- **Depuis le 27/10** : une tâche planifiée tourne sur le PC de Stéphane, « Post Facebook du jour SecureGuide » (`post-facebook-secureguide`), tous les jours vers 7 h 45. Elle prépare le post, attend le « ok », puis publie via Claude in Chrome. L'application Claude doit être ouverte. La routine cloud `trig_01RX6XbETPZDWtRoLPqSm178` est désactivée.
- **Piège Meta Business Suite** : sur Facebook, read_page, find et les captures échouent. Il faut piloter la page en JavaScript : un ClipboardEvent 'paste' dans le `[contenteditable]` pour le texte. L'ajout automatique du visuel n'est pas encore résolu ; en cas d'échec, Stéphane ajoute l'image et clique sur « Publier ».
- **Visuel sous Windows** : `post.js` prend Chrome via `CHROME`, avec `PW_MODULE=playwright-core` et `NODE_PATH` pointant sur les outils.

## YouTube

- **Chaîne** : SecureGuide, id `UCK884YEWXcYr2x-3N4_dUqg`.
- **Réglages faits** :
  - mots-clés (arnaque, faux conseiller bancaire, phishing, Wero, itsme…) ;
  - pays : Luxembourg ;
  - chaîne déclarée non destinée aux enfants.
- **Shorts publiés le 24/10** :
  - « Votre banque vous appelle ? » ;
  - « Coucou maman, j'ai changé de numéro ».
- **Short n°3** « Passez à Wero » (`social/shorts/003-wero.*`) : publié le 25/10 à 18 h.
- **Short n°4** « Fausse confirmation de réservation d'hôtel » (`social/shorts/004-reservation-hotel.*`) : programmé le 26/10 à 18 h.
- **Fichiers** : `social/shorts/`. Rendu avec `social/short2.js`, assemblage avec `social/assemble.py` ou `social/assemble.js` (même chose en Node, pour un poste sans Python). Voix ElevenLabs « Sébastien » via invideo, images Nano Banana en 9:16.
- **Sous Windows** : `short2.js` prend Chrome via la variable `CHROME` et accepte `playwright-core` ; ffmpeg/ffprobe doivent être dans le PATH. Garder les outils dans un dossier au chemin court (limite de 260 caractères).
- **Programmer un Short** : vidIQ bloque l'outil dès que la fenêtre d'édition s'ouvre. Lancer un script en tâche de fond dans la page, qui écrit son journal dans `localStorage` puis recharge la page. Date : `ytcp-date-picker.validateDateText()` puis `commitDate(value)`. Heure : `ytcp-datetime-picker.commitTimeOfDay(secondes)`, 18:00 = 64800 ; `validateTimeOfDayText` renvoie une heure de trop.
- **Visuels de la chaîne** : `social/youtube/`.
- **Piège** : l'extension vidIQ bloque l'automatisation de la fenêtre d'envoi. Il faut agir en un seul script JavaScript juste après l'ouverture.
- **À faire par Stéphane** : la validation par téléphone (Paramètres → Chaîne → Accès aux fonctionnalités), sinon les liens des descriptions ne sont pas cliquables.
- **Rythme prévu** : 3 Shorts par semaine, chacun validé par Stéphane.

## Tâches planifiées (elles tournent dans le cloud, indépendamment des conversations)

| Tâche | Quand | Rôle |
|---|---|---|
| Post Facebook du jour SecureGuide (tâche locale `post-facebook-secureguide`, sur le PC) | tous les jours vers 7 h 45 | prépare le post, attend le « ok », puis publie via Chrome (l'ancienne routine cloud est désactivée) |
| Radar des arnaques hebdo (`trig_011UUSQCs3zYchYQWJyp8uan`) | dimanche à 6 h 50, heure de Bruxelles | veille, Radar, 2 articles, publication, newsletter, bilan |
| Bilan J+5 campagne Meta (`trig_013CNpdjirpvZHApUnf66LWa`) | 25/10 à 17 h, heure de Bruxelles | compare A et B, coupe la plus chère, envoie le bilan |

Le bilan Meta arrive dans l'ancienne conversation cloud, pas dans la nouvelle.

- **Radar hebdo, correction du 26/10** : le dépôt manquait dans les sources de la tâche, si bien que le Radar n°2 n'a pas pu être publié le 25/10. Il a été republié le 26/10 par une tâche ponctuelle (« Radar n°2 – rattrapage ponctuel », désactivée, à supprimer sur claude.ai/code/routines). Le dépôt est maintenant dans les sources de la tâche du dimanche.
- **Attention** : via l'API, la mise à jour d'une tâche (`job_config`) remplace toute la configuration ; il faut renvoyer la configuration complète (événements, modèle, sources, mode auto).

## Publication automatique du site (depuis le 27/10)

- **Fonctionnement** : chaque push sur `main` lance GitHub Actions (`.github/workflows/publier.yml`), qui exécute `build.py` puis `publish.sh`. Aucun push à faire depuis le PC ou le cloud, et pas besoin de Python en local.
- **Ce qui ne déclenche rien** : `social/**` et `PASSATION.md`. On peut aussi relancer la publication à la main dans l'onglet Actions (« Run workflow »).
- **Validation** : Stéphane l'a demandé le 27/10, donc tout push qui touche le site est publié sans nouvelle confirmation. Il ne faut donc pousser sur `main` que des modifications validées.
- **Sur le PC** : la règle qui autorise `git push` est dans `.claude/settings.local.json`, non versionné.

## Points ouverts

- Ne plus utiliser « 16 fiches » pour le guide seniors : ce chiffre n'est pas vérifié. L'ancienne pub B, désactivée, le contient encore.
- Validation téléphone YouTube (par Stéphane).
- Prochains Shorts : 3 par semaine, à faire valider.
