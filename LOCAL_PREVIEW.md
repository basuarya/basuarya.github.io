# Local Quarto Preview Workflow

Use this workflow to preview a remote branch on your Mac, render the Quarto site locally, and push the rendered output back to the same branch after you confirm it looks right.

## First-time setup

1. Install Quarto: https://quarto.org/docs/get-started/
2. Clone the site repository if you do not already have it locally:

```bash
git clone https://github.com/basuarya/basuarya.github.io.git
cd basuarya.github.io
```

## Preview a branch

Run the helper script with the branch you want to preview:

```bash
bash scripts/preview-quarto-branch.sh <branch-name>
```

Example:

```bash
bash scripts/preview-quarto-branch.sh codex/tighten-homepage-copy
```

The script will:

1. Refuse to continue if your local working tree has uncommitted changes.
2. Fetch and check out the requested remote branch.
3. Start `quarto preview` at `http://localhost:4200` and open it in your browser.
4. Ask whether to render, commit, and push after you review the preview.
5. Run `quarto render`, show the changed files, ask for a commit message, and push to the same remote branch only after a second confirmation.

## Optional settings

Use a different preview port:

```bash
PORT=4300 bash scripts/preview-quarto-branch.sh <branch-name>
```

Use a different remote name:

```bash
REMOTE=upstream bash scripts/preview-quarto-branch.sh <branch-name>
```
