#!/bin/bash
# Run this in Shell tab to fix the git push error
# It resets the bad commits and pushes cleanly

echo "=== Step 1: Reset to last clean commit (before clone folders were added) ==="
git reset --soft 031994e

echo "=== Step 2: Remove tracked clone folders from index ==="
git rm -r --cached ashik/ v2dash/ goatv2/ Main/ 2>/dev/null || true

echo "=== Step 3: Remove git-fix.sh and git-push.sh from index (cleanup scripts) ==="
git rm --cached git-fix.sh git-push.sh 2>/dev/null || true

echo "=== Step 4: Stage all current clean files ==="
git add -A

echo "=== Step 5: Single clean commit ==="
git commit -m "Add 91 new commands, fix author locks, remove hardcoded API keys — 359 total commands"

echo "=== Step 6: Push to GitHub ==="
git push origin main

echo ""
echo "=== DONE! Check above for success or errors ==="
