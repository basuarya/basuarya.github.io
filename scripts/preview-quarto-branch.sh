#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-}"
REMOTE="${REMOTE:-origin}"
PORT="${PORT:-4200}"

if [[ -z "$BRANCH" ]]; then
  echo "Usage: bash scripts/preview-quarto-branch.sh <branch-name>"
  echo "Example: bash scripts/preview-quarto-branch.sh codex/tighten-homepage-copy"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but was not found."
  exit 1
fi

if ! command -v quarto >/dev/null 2>&1; then
  echo "Quarto is required but was not found. Install it from https://quarto.org/docs/get-started/"
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script from inside your local basuarya.github.io checkout."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Your working tree has uncommitted changes. Commit, stash, or discard them before previewing another branch."
  git status --short
  exit 1
fi

echo "Fetching $REMOTE/$BRANCH..."
git fetch --prune "$REMOTE" "$BRANCH"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git switch "$BRANCH"
  git reset --hard "$REMOTE/$BRANCH"
else
  git switch --track -c "$BRANCH" "$REMOTE/$BRANCH"
fi

echo "Starting Quarto preview on http://localhost:$PORT"
quarto preview --no-browser --port "$PORT" &
PREVIEW_PID=$!

cleanup() {
  if kill -0 "$PREVIEW_PID" >/dev/null 2>&1; then
    kill "$PREVIEW_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if command -v open >/dev/null 2>&1; then
  open "http://localhost:$PORT"
fi

echo "Review the site in your browser."
read -r -p "Render, commit, and push this branch after preview? [y/N] " SHOULD_PUSH

if [[ ! "$SHOULD_PUSH" =~ ^[Yy]$ ]]; then
  echo "Leaving branch unchanged."
  exit 0
fi

cleanup
trap - EXIT

echo "Rendering Quarto site..."
quarto render

if [[ -z "$(git status --porcelain)" ]]; then
  echo "No rendered changes to commit."
  exit 0
fi

echo "Rendered changes:"
git status --short

default_message="Render site preview for $BRANCH"
read -r -p "Commit message [$default_message]: " COMMIT_MESSAGE
COMMIT_MESSAGE="${COMMIT_MESSAGE:-$default_message}"

read -r -p "Commit and push these changes to $REMOTE/$BRANCH? [y/N] " FINAL_CONFIRM
if [[ ! "$FINAL_CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Rendered files are left in your working tree for review."
  exit 0
fi

git add -A
git commit -m "$COMMIT_MESSAGE"
git push "$REMOTE" "$BRANCH"

echo "Pushed rendered changes to $REMOTE/$BRANCH."
