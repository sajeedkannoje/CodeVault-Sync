# CodeVault Sync

<p align="center">
  <img src="assets/codevault-sync.png" width="112" alt="CodeVault Sync logo" />
</p>

<p align="center">
  <strong>Own every accepted solution.</strong><br>
  A Chromium extension that saves your accepted coding challenges to a GitHub repository you control.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> · <a href="#what-is-saved">What is saved</a> · <a href="#security">Security</a> · <a href="#development">Development</a>
</p>

---

## What it does

CodeVault Sync watches for accepted LeetCode submissions and saves the solution, problem statement, submission performance, tags, and revision prompts in your selected GitHub repository.

Every user connects their own GitHub account. Your solutions are pushed to your repository—not the extension author’s account.

### Highlights

- 🔐 GitHub Device Authorization Flow; no client secret is embedded in the extension.
- 📦 Link an existing repository or create a private/public one during first-run setup.
- 🧩 A structured CodeVault README for each accepted question.
- 🧭 A searchable repository-level topic index.
- 🏆 Preserves submission language, runtime, memory, and percentiles when LeetCode supplies them.
- 🕒 Historical accepted-submission import with original solve dates.
- ⚙️ Choose target branch, commit wording, and experimental GeeksforGeeks syncing.

## Quick start

### 1. Load the extension

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome, Edge, Brave, or another Chromium browser.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project folder.

### 2. Connect GitHub

1. Open CodeVault Sync and choose **Connect GitHub**.
2. GitHub opens its official device-authorization page.
3. Approve the GitHub account you want to use.
4. Complete the CodeVault Sync setup wizard: link an existing repository or create a new one, then choose your branch and commit style.

### 3. Sync a solution

1. Visit an accepted submission on LeetCode.
2. CodeVault Sync records the solution in the repository selected during setup.
3. Open the repository to review the question README and main topic index.

## What is saved

```text
your-repository/
├── README.md                    # CodeVault homepage and topic index
├── stats.json                   # local sync metadata and totals
└── 0001-two-sum/
    ├── README.md                # problem, performance, code, review prompts
    └── 0001-two-sum.py          # submitted solution
```

Question READMEs are intentionally structured for learning: problem context, performance record, pattern-recognition notes, approach, dry run, complexity, edge cases, and revision notes. Measured submission fields are filled automatically; learning notes stay editable so the extension never invents explanations.

## Security

- The extension uses GitHub Device Flow with the public OAuth client ID only.
- Never put a GitHub client secret or personal access token in this repository.
- The access token is stored in the local extension profile used to authorize GitHub.
- You can revoke the OAuth authorization from GitHub’s application settings at any time.
- Do not publish a solution repository if it includes anything you intend to keep private.

## Settings

| Setting | Example |
|---|---|
| Target branch | `main` |
| Clear commit wording | `feat: sync two sum solution` |
| Classic commit wording | `Added Two Sum solution` |
| GeeksforGeeks | Experimental, disabled by default |

## Development

This project is a Manifest V3 browser extension with no build step required for local development.

1. Make changes in this folder.
2. Open `chrome://extensions`.
3. Press **Reload** on CodeVault Sync.
4. Test on a signed-in LeetCode tab using your own GitHub account and repository.

## Project status

LeetCode sync is the primary supported flow. Historical import and GeeksforGeeks sync are available but should be treated as features to test carefully against platform changes.

## Author

Made with ♥ by [Sajeed Kannoje](https://github.com/sajeedkannoje) · CodeVault
