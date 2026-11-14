#!/usr/bin/env bash
# Push the current tree to GitHub remote `github` (https://github.com/binGe21/xiubo).
# Auth: set GITHUB_PAT (preferred) or GH_TOKEN in the environment / Cursor Secrets.
# Never put a token on the command line or in git remotes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TOKEN="${GITHUB_PAT:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Missing GITHUB_PAT (or GH_TOKEN). Add it under Cursor → Secrets, then retry." >&2
  exit 1
fi

if ! git remote get-url github >/dev/null 2>&1; then
  git remote add github https://github.com/binGe21/xiubo.git
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
STASHED=0
if [[ -n "$(git status --porcelain)" ]]; then
  git stash push -u -m "push-github-temp" >/dev/null
  STASHED=1
fi

cleanup() {
  git checkout -q "$BRANCH" 2>/dev/null || true
  git branch -D github-export >/dev/null 2>&1 || true
  if [[ "$STASHED" -eq 1 ]]; then
    git stash pop -q || true
  fi
}
trap cleanup EXIT

git checkout --orphan github-export >/dev/null
git reset >/dev/null
git add -A
# Fine-grained PATs without Workflows permission cannot push workflow YAML.
if [[ -d .github/workflows ]]; then
  git reset -- .github/workflows >/dev/null 2>&1 || true
  rm -rf .github/workflows
fi
git add -A
git commit -q -m "Sync: 锈泊 $(date -u +%Y-%m-%dT%H:%MZ)"

ASKPASS="$(mktemp)"
chmod 700 "$ASKPASS"
{
  echo '#!/bin/sh'
  echo 'case "$1" in'
  echo '  *Username*) echo x-access-token ;;'
  printf '  *Password*) echo %q ;;\n' "$TOKEN"
  echo 'esac'
} >"$ASKPASS"

GIT_ASKPASS="$ASKPASS" SSH_ASKPASS="$ASKPASS" DISPLAY= GIT_TERMINAL_PROMPT=0 \
  git -c credential.helper= push -f -u github github-export:main
rm -f "$ASKPASS"
echo "OK → https://github.com/binGe21/xiubo"
