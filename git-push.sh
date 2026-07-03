#!/bin/bash
# Run this in the Shell tab to push all bot changes to GitHub
echo "=== Staging all changes ==="
git add -A
echo "=== Committing ==="
git commit -m "Add 91 new commands, fix author locks, remove hardcoded API keys — 359 total commands"
echo "=== Pushing to GitHub ==="
git push origin main
echo "=== Done! ==="
