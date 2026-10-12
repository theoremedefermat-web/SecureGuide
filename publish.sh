#!/usr/bin/env bash
# Génère le site et publie dist/ sur la branche gh-pages, en gardant le CNAME écrit par GitHub.
set -euo pipefail
cd "$(dirname "$0")"
MSG="${1:-Publication}"
python3 build.py
git fetch -q origin '+refs/heads/gh-pages:refs/remotes/origin/gh-pages'
WT=$(mktemp -d)
git worktree add -q --detach "$WT" origin/gh-pages
git -C "$WT" rm -rq .
cp -r dist/. "$WT"/
git show origin/gh-pages:CNAME > "$WT/CNAME" 2>/dev/null || echo "secureguide.fr" > "$WT/CNAME"
git -C "$WT" add -A
if git -C "$WT" diff --cached --quiet; then
  echo "Rien à publier."
else
  git -C "$WT" -c user.name="SecureGuide" -c user.email="info@secureguide.fr" commit -q -m "$MSG"
  git -C "$WT" push -q origin HEAD:gh-pages
  echo "Publié."
fi
git worktree remove --force "$WT"
