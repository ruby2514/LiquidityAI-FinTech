# Git & GitHub — Universal Command Reference

**For:** Every project you'll ever push, manage, or collaborate on.
**Setup:** SSH key already configured (`SHA256:g9Wi0/FaHfq6NPfdnyp/wgyp/XaBF26pUGl7p7kW3qU`)
**GitHub:** `Shellshock9001`

---

## First-Time Project Upload (New Repo)

```powershell
# 1. Initialize git in your project folder
git init

# 2. Stage all files
git add -A

# 3. First commit
git commit -m "Initial commit — [Project Name]"

# 4. Rename branch to main
git branch -M main

# 5. Add your GitHub repo as remote
git remote add origin git@github.com:Shellshock9001/YOUR-REPO-NAME.git

# 6. Push to GitHub
git push -u origin main
```

---

## Daily Workflow — Save & Push Changes

```powershell
# See what changed
git status

# See exact line changes
git diff

# Stage all changes
git add -A

# Commit with message
git commit -m "description of what you changed"

# Push to GitHub
git push
```

---

## Frontend Changes Only

```powershell
# Stage only frontend files
git add src/

# Commit
git commit -m "frontend: updated dashboard layout and fixed login styles"

# Push
git push
```

---

## Backend Changes Only

```powershell
# Stage only backend files
git add server/

# Commit
git commit -m "backend: added rate limiting to user endpoints"

# Push
git push
```

---

## Docs / Config Changes Only

```powershell
# Stage only docs
git add docs/ README.md

# Commit
git commit -m "docs: updated API reference and demo guide"

# Push
git push
```

---

## Undo Mistakes

```powershell
# Undo last commit but KEEP the changes (safe)
git reset --soft HEAD~1

# Undo last commit and DISCARD changes (dangerous)
git reset --hard HEAD~1

# Discard all uncommitted changes (dangerous — can't undo)
git checkout -- .

# Unstage a file (keep changes, just remove from staging)
git restore --staged filename.js

# Revert a specific commit (creates a new "undo" commit — safe)
git revert abc1234
```

---

## Branching — Work on Features Without Breaking Main

```powershell
# Create and switch to a new branch
git checkout -b feat/new-feature

# Switch between branches
git checkout main
git checkout feat/new-feature

# List all branches
git branch -a

# Push a branch to GitHub
git push -u origin feat/new-feature

# Merge a branch into main
git checkout main
git merge feat/new-feature

# Delete a branch after merging
git branch -d feat/new-feature
git push origin --delete feat/new-feature
```

---

## View History

```powershell
# Last 10 commits (compact)
git log --oneline -10

# Last 5 commits with details
git log -5

# Pretty graph view
git log --oneline --graph --all -20

# See what changed in a specific commit
git show abc1234

# See who changed each line of a file
git blame server/server.js

# Search commit messages
git log --grep="auth" --oneline
```

---

## Working with Remote (GitHub)

```powershell
# Pull latest changes from GitHub
git pull

# Pull and rebase (cleaner history)
git pull --rebase

# See remote URL
git remote -v

# Change remote URL
git remote set-url origin git@github.com:Shellshock9001/NEW-REPO.git

# Fetch without merging (just download)
git fetch origin

# See what's different between local and remote
git log origin/main..main --oneline
```

---

## Tags — Mark Releases

```powershell
# Create a version tag
git tag v1.0.0

# Create a tag with a message
git tag -a v1.0.0 -m "First production release"

# Push tags to GitHub
git push --tags

# List all tags
git tag -l

# Delete a tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## Stashing — Save Work Without Committing

```powershell
# Stash current changes (hides them temporarily)
git stash

# See stashed items
git stash list

# Bring back stashed changes
git stash pop

# Bring back but keep in stash
git stash apply

# Drop a stash
git stash drop
```

---

## .gitignore — Files to Never Upload

```powershell
# After editing .gitignore, clear the cache so removed files get untracked
git rm -r --cached .
git add -A
git commit -m "chore: updated gitignore"
git push
```

---

## Clone an Existing Repo

```powershell
# Clone a repo to your machine
git clone git@github.com:Shellshock9001/REPO-NAME.git

# Clone into a specific folder
git clone git@github.com:Shellshock9001/REPO-NAME.git my-folder

# Clone only the latest commit (faster for huge repos)
git clone --depth=1 git@github.com:Shellshock9001/REPO-NAME.git
```

---

## GitHub Pages (Free Hosting for Static Sites)

```powershell
# Build your frontend
npm run build

# Create gh-pages branch from dist/
git checkout -b gh-pages
git add -f dist/
git commit -m "deploy: github pages"
git subtree push --prefix dist origin gh-pages
```

---

## Multiple Projects — Quick Push Template

```powershell
# Universal "save and push" one-liner
git add -A && git commit -m "update: your message here" && git push
```

---

## SSH Key Verification

```powershell
# Test SSH connection to GitHub
ssh -T git@github.com

# Expected output: "Hi Shellshock9001! You've successfully authenticated"

# See which SSH key is being used
ssh -vT git@github.com 2>&1 | Select-String "identity file"
```

---

## Danger Zone — Use Carefully

```powershell
# Force push (overwrites remote — DANGEROUS for shared repos)
git push --force

# Delete all local branches except main
git branch | Where-Object { $_ -notmatch "main" } | ForEach-Object { git branch -D $_.Trim() }

# Completely remove a file from all history (large files, secrets)
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch FILENAME" --prune-empty --tag-name-filter cat -- --all
git push --force --all

# Nuclear option — start fresh but keep files
Remove-Item -Recurse -Force .git
git init
git add -A
git commit -m "fresh start"
git branch -M main
git remote add origin git@github.com:Shellshock9001/REPO.git
git push -u origin main --force
```

---

## Quick Reference Card

| What You Want | Command |
|--------------|---------|
| Save everything | `git add -A && git commit -m "msg" && git push` |
| See what changed | `git status` |
| See line changes | `git diff` |
| Undo last commit (keep code) | `git reset --soft HEAD~1` |
| New branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |
| Merge branch | `git checkout main && git merge branch-name` |
| Pull updates | `git pull` |
| View history | `git log --oneline -10` |
| Clone a repo | `git clone git@github.com:Shellshock9001/REPO.git` |
| Tag a release | `git tag v1.0.0 && git push --tags` |
| Stash work | `git stash` / `git stash pop` |
