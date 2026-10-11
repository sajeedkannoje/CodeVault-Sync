const $ = id => document.getElementById(id);
chrome.storage.local.get('sync_history').then(({ sync_history = [] }) => {
  const hasSuccessfulStatsSync = sync_history.some(item => item.path === 'stats.json' && item.state === 'synced');
  if (hasSuccessfulStatsSync) chrome.storage.local.set({ sync_history: sync_history.filter(item => !(item.path === 'stats.json' && item.state === 'failed' && item.message?.includes('(409)'))) });
});
const styleNames = { dashboard: 'Modern Dark Dashboard', showcase: 'Clean Light Dashboard', developer: 'Developer Aesthetic', glass: 'Glassmorphism', sidebar: 'Sidebar Layout', minimal: 'Terminal Inspired' };
function relativeTime(value) { const minutes = Math.max(1, Math.round((Date.now() - value) / 60000)); return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`; }
async function render() { const data = await chrome.storage.local.get(['github_profile','codevault_hook','stats','sync_status','sync_history','enable_gfg','readme_style','history_import_progress']); const stats = data.stats || {}; $('welcome').textContent = data.github_profile ? `Welcome back, ${data.github_profile.login}` : 'Welcome to your vault'; $('repo-name').textContent = data.codevault_hook ? `Syncing to ${data.codevault_hook}` : 'Connect GitHub and choose a repository to begin.'; for (const key of ['solved','easy','medium','hard']) $(key).textContent = stats[key] || 0; $('sync-state').textContent = data.sync_status?.state === 'failed' ? '● Needs attention' : data.sync_status?.state === 'connected' ? '● Connected' : '● Ready'; $('gfg-toggle').checked = Boolean(data.enable_gfg); $('readme-copy').textContent = styleNames[data.readme_style] || styleNames.dashboard; if (data.codevault_hook) { $('repo-link').hidden = false; $('repo-link').href = `https://github.com/${data.codevault_hook}`; } const history = data.sync_history || []; if (history.length) $('activity').innerHTML = history.slice(0,6).map(item => `<div class="activity-row"><span class="${item.state === 'failed' ? 'status-bad' : 'status-good'}">${item.state === 'failed' ? '✕' : '✓'}</span><div><strong>${item.message}</strong><small>${item.path || 'CodeVault Sync'}</small></div><time>${relativeTime(item.at)}</time></div>`).join(''); renderImportProgress(data.history_import_progress); }
function renderImportProgress(progress) { const box = $('import-progress'); if (!box || !progress?.total) return; const percent = Math.min(100, Math.round((progress.completed || 0) / progress.total * 100)); box.hidden = false; box.innerHTML = `<div><strong>${progress.completed || 0} / ${progress.total} imported${progress.failed ? ` · ${progress.failed} need attention` : ''}</strong><span>${progress.state === 'done' ? 'Completed' : 'Working…'}</span></div><i><b style="width:${percent}%"></b></i>`; }
$('theme-toggle').onclick = () => { const light = document.body.dataset.theme !== 'light'; document.body.dataset.theme = light ? 'light' : 'dark'; $('theme-toggle').textContent = light ? '◐ Dark' : '☀ Light'; chrome.storage.local.set({ dashboard_theme: document.body.dataset.theme }); };
$('settings').onclick = () => document.getElementById('live-settings').scrollIntoView({ behavior: 'smooth' }); $('preview-settings').onclick = () => document.getElementById('live-settings').scrollIntoView({ behavior: 'smooth' }); $('gfg-toggle').onchange = event => chrome.storage.local.set({ enable_gfg: event.target.checked }); chrome.storage.local.get('dashboard_theme').then(({dashboard_theme}) => { if (dashboard_theme) { document.body.dataset.theme = dashboard_theme; $('theme-toggle').textContent = dashboard_theme === 'light' ? '◐ Dark' : '☀ Light'; } });
async function setupLiveSettings() {
  const styles = [['developer', 'Developer Aesthetic — illustrated dark dashboard'], ['glass', 'Glassmorphism — premium neon cards'], ['sidebar', 'Sidebar Layout — structured light portfolio']];
  styles.forEach(([value, label]) => { if (!$('readme-style').querySelector(`option[value="${value}"]`)) $('readme-style').add(new Option(label, value)); });
  const keys = ['readme_style','question_readme_theme','default_branch','commit_style'];
  const values = await chrome.storage.local.get(keys);
  $('readme-style').value = values.readme_style || 'dashboard';
  $('question-theme').value = values.question_readme_theme || 'classic';
  $('branch').value = values.default_branch || 'main';
  $('commit-style').value = values.commit_style || 'clear';
  const questionPreview = document.createElement('img');
  questionPreview.id = 'question-theme-preview'; questionPreview.alt = 'Question README theme preview';
  const questionPreviewStyle = document.createElement('style'); questionPreviewStyle.textContent = '#question-theme-preview{display:block;width:100%;height:118px;object-fit:cover;object-position:top;margin-top:10px;border:1px solid var(--line);border-radius:8px;background:var(--surface2)}'; document.head.append(questionPreviewStyle);
  $('question-theme').parentElement.append(questionPreview);
  const refreshQuestionPreview = () => { const style = $('readme-style').value; const source = { dashboard: 'modern-dark.svg', showcase: 'clean-light.svg', glass: 'glass.svg', minimal: 'minimal.svg', developer: 'developer.svg', sidebar: 'clean-light.svg' }[style] || 'modern-dark.svg'; questionPreview.src = `assets/question-themes/${source}`; };
  refreshQuestionPreview();
  const mapping = { 'readme-style': 'readme_style', 'question-theme': 'question_readme_theme', branch: 'default_branch', 'commit-style': 'commit_style' };
  Object.entries(mapping).forEach(([id, key]) => $(id).addEventListener('change', async event => {
    await chrome.storage.local.set({ [key]: event.target.value.trim() });
    $('saved-state').textContent = '● Saved live';
    setTimeout(() => $('saved-state').textContent = '● Saved', 1600);
    render();
    refreshQuestionPreview();
  }));
}
chrome.storage.onChanged.addListener(() => render());
document.querySelectorAll('[data-readme-theme]').forEach(card => card.onclick = async () => {
  const style = card.dataset.readmeTheme;
  $('readme-style').value = style;
  await chrome.storage.local.set({ readme_style: style });
  $('saved-state').textContent = `● ${styleNames[style]} selected`;
  document.querySelectorAll('[data-readme-theme]').forEach(item => item.classList.toggle('selected', item === card));
  render();
});
const suppliedThemeStyle = document.createElement('style');
suppliedThemeStyle.textContent = '.supplied-card{padding:0 0 14px;gap:9px}.supplied-card img{width:100%;height:175px;object-fit:cover;object-position:top;border-radius:13px 13px 0 0;border-bottom:1px solid var(--line)}.supplied-card strong,.supplied-card small{margin:0 14px}.supplied-card small{margin-top:auto}';
document.head.append(suppliedThemeStyle);
const extraThemeCards = [['developer', 'Developer Aesthetic', 'assets/readme-themes/developer.svg'], ['glass', 'Glassmorphism', 'assets/readme-themes/glass.svg'], ['sidebar', 'Sidebar Layout', 'assets/readme-themes/sidebar.svg']];
const themeGallery = document.querySelector('.theme-gallery');
extraThemeCards.forEach(([style, name, source]) => {
  const card = document.createElement('button');
  card.className = 'theme-card supplied-card'; card.dataset.readmeTheme = style;
  card.innerHTML = `<img src="${source}" alt="${name} README dashboard preview"><strong>${name}</strong><small>Live SVG · real repository values</small>`;
  card.onclick = async () => { $('readme-style').value = style; await chrome.storage.local.set({ readme_style: style }); $('saved-state').textContent = `● ${styleNames[style]} selected`; document.querySelectorAll('[data-readme-theme]').forEach(item => item.classList.toggle('selected', item === card)); render(); };
  themeGallery?.append(card);
});
$('import-history').onclick = async () => {
  const button = $('import-history');
  button.disabled = true;
  button.textContent = 'Scanning LeetCode…';
  $('import-help').textContent = 'Reading your latest accepted submissions from the signed-in LeetCode tab…';
  const result = await chrome.runtime.sendMessage({ type: 'SCAN_LEETCODE_HISTORY' });
  button.disabled = false;
  button.textContent = 'Find my accepted submissions';
  if (!result?.ok) { $('import-help').textContent = result?.error || 'Could not read your submission history.'; return; }
  const submissions = result.submissions || [];
  if (!submissions.length) { $('import-help').textContent = 'No accepted submissions were returned by LeetCode.'; return; }
  const results = $('import-results');
  const escape = value => String(value || '').replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char]);
  results.hidden = false;
  results.innerHTML = `<div class="import-summary"><strong>${submissions.length} accepted submissions found for ${escape(result.username)}</strong><div><button id="import-selected">Import selected</button> <button id="import-all" class="apply-theme">Import all ${submissions.length}</button></div></div><p class="import-note">Imports run automatically in groups of 15. Existing solution folders are skipped and every README records its original solve date.</p><div id="import-progress" class="import-progress" hidden></div><div class="import-list">${submissions.map(item => `<label><input type="checkbox" value="${escape(item.id)}"><span><b>${escape(item.title)}</b><small>${escape(item.lang || 'Unknown language')} · ${new Date(Number(item.timestamp) * 1000).toLocaleDateString()}</small></span></label>`).join('')}</div>`;
  $('import-help').textContent = 'Import all runs automatically in safe groups of 15. Each historical commit uses its original LeetCode solve date.';
  const runImport = async ids => {
    const timestamps = new Map(submissions.map(item => [Number(item.id), Number(item.timestamp) || 0]));
    ids = [...new Set(ids)].sort((left, right) => (timestamps.get(left) || 0) - (timestamps.get(right) || 0));
    if (!ids.length) { $('import-help').textContent = 'Select at least one submission to import.'; return; }
    $('import-selected').disabled = true; $('import-all').disabled = true;
    await chrome.storage.local.set({ history_import_progress: { completed: 0, total: ids.length, failed: 0, state: 'running' } });
    $('import-help').textContent = `Importing ${ids.length} solutions automatically in groups of 15. Keep this dashboard open.`;
    const allResults = [];
    for (let offset = 0; offset < ids.length; offset += 15) {
      const imported = await chrome.runtime.sendMessage({ type: 'IMPORT_LEETCODE_HISTORY', submissionIds: ids.slice(offset, offset + 15), progressOffset: offset, total: ids.length });
      if (!imported?.ok) { $('import-help').textContent = imported?.error || 'Import stopped before completion.'; break; }
      allResults.push(...imported.results);
    }
    const failed = allResults.filter(item => !item.ok).length;
    await chrome.storage.local.set({ history_import_progress: { completed: allResults.length, total: ids.length, failed, state: 'done' } });
    $('import-selected').disabled = false; $('import-all').disabled = false;
    $('import-help').textContent = failed ? `${allResults.length - failed} imported; ${failed} need attention. Retry only those if needed.` : `${allResults.length} solutions imported successfully.`;
    render();
  };
  $('import-selected').onclick = () => runImport([...results.querySelectorAll('input:checked')].map(input => Number(input.value)).filter(Number.isFinite));
  $('import-all').onclick = () => runImport(submissions.map(item => Number(item.id)).filter(Number.isFinite));
};
document.querySelector('.hint').textContent = 'This applies your selected CodeVault Sync theme, keeps the topic index, and uploads the live SVG dashboard immediately.';
$('apply-repo-theme').onclick = async () => { const button = $('apply-repo-theme'); button.disabled = true; button.textContent = 'Applying theme…'; const result = await chrome.runtime.sendMessage({ type: 'APPLY_REPO_THEME' }); $('saved-state').textContent = result?.ok ? '● Theme applied to GitHub' : `● ${result?.error || 'Theme update failed'}`; button.disabled = false; button.textContent = 'Apply theme to linked repository now'; };
function setupBasicSettings() {
  $('preview-settings').hidden = true;
  document.querySelectorAll('.muted-platform').forEach(item => item.remove());
  const settingsPanel = $('live-settings');
  if (settingsPanel) {
    settingsPanel.querySelector('h3').textContent = 'Sync preferences';
    settingsPanel.querySelector('.panel-heading p').textContent = 'Choose how new accepted solutions are committed.';
  }
  $('commit-style').options[0].text = 'Clear — e.g. feat: sync two sum solution';
  $('commit-style').options[1].text = 'Classic — e.g. Added Two Sum solution';
  const visibilityStyle = document.createElement('style');
  visibilityStyle.textContent = '[hidden]{display:none!important}';
  document.head.append(visibilityStyle);
  const designPanel = document.querySelector('.design-sample')?.closest('.panel');
  if (designPanel) {
    designPanel.querySelector('h3').textContent = 'Clean Markdown';
    $('readme-copy').textContent = 'Emoji-led, readable repository and challenge pages.';
    document.querySelector('.design-sample').innerHTML = '<span>🚀 CodeVault Sync</span><strong>My Coding Vault</strong><small>🔥 accepted solutions · 💻 code · 🎯 topics</small>';
    new MutationObserver(() => { if ($('readme-copy').textContent !== 'Emoji-led, readable repository and challenge pages.') $('readme-copy').textContent = 'Emoji-led, readable repository and challenge pages.'; }).observe($('readme-copy'), { childList: true, characterData: true, subtree: true });
  }
  const nextPanel = [...document.querySelectorAll('.panel')].find(panel => panel.querySelector('h3')?.textContent === 'Next up');
  if (nextPanel) nextPanel.querySelector('ol').innerHTML = '<li>Solve an accepted challenge on LeetCode.</li><li>CodeVault Sync saves it to GitHub.</li><li>Open your repository and review the commit.</li>';
  const dashboardSections = [...document.querySelectorAll('main > section')].filter(section => section.id !== 'repository-setup');
  const setRepositoryFirst = linked => {
    dashboardSections.forEach(section => { section.hidden = !linked; });
    $('repository-setup').hidden = linked;
  };
  const send = message => new Promise(resolve => {
    chrome.runtime.sendMessage(message, response => resolve(response || { ok: false, error: chrome.runtime.lastError?.message || 'The extension was updated. Reload it once and try again.' }));
  });
  const selector = document.createElement('div');
  selector.className = 'setting-grid';
  selector.innerHTML = '<label>Link an existing repository<select id="existing-repository"><option value="">Loading your GitHub repositories…</option></select></label><label><span>&nbsp;</span><button id="link-repository" type="button">Link selected repository</button></label>';
  $('repository-setup').querySelector('.setting-grid').before(selector);
  const loadRepositories = async () => {
    const result = await send({ type: 'LIST_CODEVAULT_REPOSITORIES' });
    const select = $('existing-repository');
    if (!result?.ok) { select.innerHTML = '<option value="">Could not load repositories</option>'; $('repository-state').textContent = result?.error || 'GitHub connection needs attention'; return; }
    select.innerHTML = '<option value="">Choose an existing repository…</option>' + result.repositories.map(repo => `<option value="${repo.full_name}">${repo.full_name}${repo.private ? ' · private' : ''}</option>`).join('');
  };
  chrome.storage.local.get('codevault_hook').then(async ({ codevault_hook }) => {
    setRepositoryFirst(Boolean(codevault_hook));
    if (!codevault_hook) await loadRepositories();
  });
  $('link-repository').onclick = async () => {
    const fullName = $('existing-repository').value;
    if (!fullName) { $('repository-state').textContent = 'Choose a repository first'; return; }
    $('link-repository').disabled = true; $('repository-state').textContent = 'Linking repository…';
    const result = await send({ type: 'LINK_CODEVAULT_REPOSITORY', fullName });
    $('link-repository').disabled = false;
    if (!result?.ok) { $('repository-state').textContent = result?.error || 'Repository link failed'; return; }
    $('repository-state').textContent = `Linked: ${result.repository.full_name}`; setRepositoryFirst(true); render();
  };
  const themePanel = document.querySelector('.theme-gallery')?.closest('.panel');
  if (themePanel) themePanel.remove();
  const readmeLabel = $('readme-style')?.closest('label');
  const questionLabel = $('question-theme')?.closest('label');
  if (readmeLabel) readmeLabel.hidden = true;
  if (questionLabel) questionLabel.hidden = true;
  chrome.storage.local.get(['default_branch', 'commit_style']).then(values => {
    $('branch').value = values.default_branch || 'main';
    $('commit-style').value = values.commit_style || 'clear';
  });
  [['branch', 'default_branch'], ['commit-style', 'commit_style']].forEach(([id, key]) => $(id).addEventListener('change', event => chrome.storage.local.set({ [key]: event.target.value.trim() })));
  $('apply-repo-theme').textContent = 'Refresh repository README';
  document.querySelector('.hint').textContent = 'Your repository uses clean emoji Markdown. No SVG dashboard files are uploaded.';
  $('apply-repo-theme').onclick = async () => {
    const button = $('apply-repo-theme'); button.disabled = true; button.textContent = 'Refreshing…';
    const result = await chrome.runtime.sendMessage({ type: 'APPLY_REPO_THEME' });
    $('saved-state').textContent = result?.ok ? '● README updated' : `● ${result?.error || 'README update failed'}`;
    button.disabled = false; button.textContent = 'Refresh repository README';
  };
  $('create-repository').onclick = async () => {
    const button = $('create-repository'); const name = $('new-repo-name').value.trim();
    if (!name) { $('repository-state').textContent = 'Enter a repository name'; return; }
    button.disabled = true; button.textContent = 'Creating repository…'; $('repository-state').textContent = 'Working…';
    const result = await send({ type: 'CREATE_CODEVAULT_REPOSITORY', name, private: $('new-repo-private').checked });
    button.disabled = false; button.textContent = 'Create and link repository';
    $('repository-state').textContent = result?.ok ? `Linked: ${result.repository.full_name}` : (result?.error || 'Repository creation failed');
    if (result?.ok) { setRepositoryFirst(true); render(); }
  };
}
async function hydrateRepositoryStats() {
  const { codevault_token: token, codevault_hook: hook, stats } = await chrome.storage.local.get(['codevault_token', 'codevault_hook', 'stats']);
  if (!token || !hook || (stats && Number(stats.solved) > 0)) return;
  try {
    const response = await fetch(`https://api.github.com/repos/${hook}/contents/stats.json`, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' } });
    if (!response.ok) return;
    const file = await response.json();
    const decoded = decodeURIComponent(escape(atob(String(file.content || '').replace(/\n/g, ''))));
    const saved = JSON.parse(decoded)?.leetcode;
    if (saved) await chrome.storage.local.set({ stats: saved });
  } catch (_) {
    // A missing or old repository should still leave the dashboard usable.
  }
}
setupBasicSettings(); hydrateRepositoryStats(); render();
