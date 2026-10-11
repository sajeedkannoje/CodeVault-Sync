const fields = ['github_client_id','default_branch','commit_style','readme_style','question_readme_theme','upload_notes','enable_gfg'];
const idFor = key => ({github_client_id:'client-id',default_branch:'branch',commit_style:'commit-style',readme_style:'readme-style',question_readme_theme:'question-theme',upload_notes:'private-notes',enable_gfg:'gfg'})[key];
async function load() { const data = await chrome.storage.local.get(fields); for (const key of fields) { const input = document.getElementById(idFor(key)); if (input.type === 'checkbox') input.checked = data[key] ?? (key === 'upload_notes'); else input.value = data[key] ?? (key === 'github_client_id' ? 'Ov23liIFNKb9if7qd5k1' : input.value); } }
async function save() { const values = {}; for (const key of fields) { const input = document.getElementById(idFor(key)); values[key] = input.type === 'checkbox' ? input.checked : input.value.trim(); } await chrome.storage.local.set(values); document.getElementById('saved').textContent = 'Saved.'; setTimeout(() => document.getElementById('saved').textContent = '', 1800); }
const previews = {
  dashboard: '# My Coding Vault\n\n> A personal archive of accepted coding challenges, securely synced with CodeVault Sync.\n\n## Progress\n\nSolutions are organized by topic below as you solve them. See `stats.json` for the latest totals.\n\n<!-- CodeVault Sync maintains the topic index below this line. -->',
  showcase: '# Sajeed’s Coding Vault\n\nA growing portfolio of accepted algorithms and data-structure challenges.\n\n## Highlights\n\n- Organised by problem and topic\n- Detailed question readmes and solutions\n- Progress automatically maintained by CodeVault Sync',
  minimal: 'A personal archive of accepted coding challenges — securely synced with CodeVault Sync.',
};
const questionPreviews = {
  classic: '# Two Sum\n\n## Problem\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\n## Solution\nSee the accompanying source file.',
  focus: '> 🎯 **Solution Record**  ·  Easy  ·  Arrays / Hash Table\n\n# Two Sum\n\n## Problem\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\n---\nSynced with CodeVault Sync.',
  vault: '<div align="center">\n\n# 🔐 Two Sum\n### CodeVault Challenge Record\n\n`Easy` · `Array` · `Hash Table`\n\n</div>\n\n## Challenge\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\n---\n*Saved by CodeVault Sync*',
};
function renderPreview(style = document.getElementById('readme-style').value) {
  document.getElementById('readme-preview').textContent = previews[style];
  const questionStyle = document.getElementById('question-theme').value;
  document.getElementById('question-preview').textContent = questionPreviews[questionStyle];
  document.getElementById('commit-preview').textContent = document.getElementById('commit-style').value === 'clear' ? 'Commit: feat: sync two sum solution' : 'Commit: Added solution - CodeVault Sync';
  document.getElementById('tree-preview').textContent = `Branch: ${document.getElementById('branch').value || 'main'}\n\n0001-two-sum/\n├── README.md\n├── NOTES.md (when enabled)\n└── 0001-two-sum.py`;
  document.querySelectorAll('[data-style]').forEach(button => button.classList.toggle('active', button.dataset.style === style));
  document.querySelectorAll('[data-question-theme]').forEach(button => button.classList.toggle('active', button.dataset.questionTheme === questionStyle));
}
for (const key of fields) document.getElementById(idFor(key)).addEventListener('change', () => { save(); renderPreview(); });
document.getElementById('toggle-preview').onclick = () => { const preview = document.getElementById('preview'); preview.hidden = !preview.hidden; document.getElementById('toggle-preview').textContent = preview.hidden ? 'Show preview' : 'Hide preview'; renderPreview(); };
document.querySelectorAll('[data-style]').forEach(button => button.onclick = () => { document.getElementById('readme-style').value = button.dataset.style; save(); renderPreview(button.dataset.style); });
document.querySelectorAll('[data-question-theme]').forEach(button => button.onclick = () => { document.getElementById('question-theme').value = button.dataset.questionTheme; save(); renderPreview(); });
document.getElementById('forget').onclick = async () => { if (confirm('Forget this GitHub connection and all local CodeVault Sync data?')) { await chrome.storage.local.clear(); document.getElementById('saved').textContent = 'Local data removed.'; load(); } };
load().then(renderPreview);
