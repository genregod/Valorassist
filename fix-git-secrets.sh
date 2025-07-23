#!/bin/bash

echo "=== Fixing Git Secret Detection Issue ==="
echo ""
echo "GitHub detected secrets in your commits. Follow these steps:"
echo ""

# Step 1: Remove the files with secrets
echo "Step 1: Remove files containing secrets from git tracking"
git rm --cached github-secrets-setup.md valor-assist-credentials.txt

# Step 2: Add to gitignore
echo "Step 2: Add to .gitignore to prevent future commits"
echo "" >> .gitignore
echo "# Files containing secrets" >> .gitignore
echo "github-secrets-setup.md" >> .gitignore
echo "valor-assist-credentials.txt" >> .gitignore
echo "*-credentials.txt" >> .gitignore

# Step 3: Commit the removal
echo "Step 3: Commit the changes"
git add .gitignore
git commit -m "Remove files containing secrets and update .gitignore"

# Step 4: Remove from history
echo "Step 4: Remove secrets from git history"
echo ""
echo "Run this command to remove the files from ALL commits:"
echo ""
echo "git filter-branch --force --index-filter \\"
echo "  'git rm --cached --ignore-unmatch github-secrets-setup.md valor-assist-credentials.txt' \\"
echo "  --prune-empty --tag-name-filter cat -- --all"
echo ""
echo "OR use the newer git filter-repo (if installed):"
echo "git filter-repo --path github-secrets-setup.md --path valor-assist-credentials.txt --invert-paths"
echo ""
echo "After cleaning history, force push with:"
echo "git push --force origin main"
echo ""
echo "IMPORTANT: Make sure you have already added the secrets to GitHub before removing these files!"