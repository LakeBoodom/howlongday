#!/usr/bin/env bash
# HowLongDay — Step 1: push to GitHub
#
# PREREQUISITE: create an empty repo at https://github.com/new
#   - Owner: LakeBoodom
#   - Name:  howlongday
#   - Visibility: Public (recommended) or Private
#   - DO NOT tick "Add a README" / .gitignore / license
#
# Then run this script in Terminal:
#   cd "/Users/heikkiaura/Documents/Claude/Projects/Howlongday.com"
#   bash deploy-step-1-github.sh

set -euo pipefail

cd "$(dirname "$0")"

# Reset any stale git state from the sandbox attempt
if [ -d .git ]; then
  echo "→ Removing stale .git from sandbox attempt"
  rm -rf .git
fi

echo "→ Initializing fresh git repo"
git init -b main
git config user.email "heikki.aura@uplause.com"
git config user.name "Heikki Aura"

echo "→ Staging files"
git add -A

echo "→ Creating first commit"
git commit -m "feat: initial scaffold — Next.js 14 + Tailwind + branded landing"

echo "→ Adding GitHub remote"
git remote add origin https://github.com/LakeBoodom/howlongday.git

echo "→ Pushing to GitHub (will prompt for credentials)"
git push -u origin main

echo ""
echo "✅ Done. Repo is live at: https://github.com/LakeBoodom/howlongday"
echo "→ Next: import this repo in Vercel (see README in Cowork chat)"
