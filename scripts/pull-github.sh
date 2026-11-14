#!/usr/bin/env bash
# Fetch GitHub `main` into a local review branch (does not rewrite Origin main).
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
  git -c credential.helper= fetch github main
rm -f "$ASKPASS"

git branch -f github-main github/main >/dev/null 2>&1 || git branch github-main github/main
echo "Fetched github/main → local branch github-main"
echo "Inspect with: git log --oneline github-main -5"
echo "Merge only if you intend to: git merge github-main"
