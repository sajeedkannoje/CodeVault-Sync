const $ = id => document.getElementById(id);
async function github(path, options = {}) {
  const { codevault_token: token } = await chrome.storage.local.get('codevault_token');
  if (!token) throw new Error('GitHub is not connected. Use “Connect GitHub” from the extension, then return here.');
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub request failed (${response.status}).`);
  return data;
}
async function linkRepository(fullName) {
  const repository = await github(`/repos/${fullName}`);
  await chrome.storage.local.set({ mode_type: 'commit', codevault_hook: repository.full_name, repo: repository.html_url, default_branch: repository.default_branch || 'main' });
  return repository;
}
async function createRepository(name, isPrivate) {
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(name)) throw new Error('Use letters, numbers, dots, dashes, or underscores for the repository name.');
  const repository = await github('/user/repos', { method: 'POST', body: JSON.stringify({ name, private: Boolean(isPrivate), auto_init: true, description: 'Personal coding vault — accepted solutions synced with CodeVault Sync by Sajeed Kannoje.' }) });
  await chrome.storage.local.set({ mode_type: 'commit', codevault_hook: repository.full_name, repo: repository.html_url, default_branch: repository.default_branch || 'main' });
  return repository;
}

function showStep(name) {
  ['repository-step', 'preferences-step', 'success-step'].forEach(id => $(id).hidden = id !== name);
  document.querySelectorAll('.steps span').forEach((item, index) => item.classList.toggle('active', (name === 'repository-step' && index === 0) || (name === 'preferences-step' && index === 1) || (name === 'success-step' && index === 2)));
}

async function loadRepositories() {
  const select = $('existing-repository');
  try {
    const repositories = await github('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member');
    select.innerHTML = '<option value="">Choose an existing repository…</option>' + repositories.map(repo => `<option value="${repo.full_name}">${repo.full_name}${repo.private ? ' · private' : ''}</option>`).join('');
  } catch (error) { select.innerHTML = '<option value="">Unable to load repositories</option>'; $('repository-message').textContent = error.message; }
}

async function connectRepository(message, button) {
  button.disabled = true;
  const original = button.textContent;
  button.textContent = 'Working…';
  $('repository-message').textContent = '';
  let result;
  try {
    const repository = message.type === 'CREATE_CODEVAULT_REPOSITORY' ? await createRepository(message.name, message.private) : await linkRepository(message.fullName);
    result = { ok: true, repository };
  } catch (error) { result = { ok: false, error: error.message }; }
  button.disabled = false;
  button.textContent = original;
  if (!result.ok) { $('repository-message').textContent = result.error || 'Repository setup failed.'; return; }
  $('success-copy').textContent = `${result.repository.full_name} is linked to CodeVault Sync.`;
  showStep('preferences-step');
}

async function initialise() {
  $('commit-style').options[0].text = 'Clear — e.g. feat: sync two sum solution';
  $('commit-style').options[1].text = 'Classic — e.g. Added Two Sum solution';
  const data = await chrome.storage.local.get(['github_profile', 'codevault_hook', 'default_branch', 'commit_style', 'enable_gfg']);
  $('account-name').textContent = data.github_profile?.login || 'CODER';
  $('branch').value = data.default_branch || 'main';
  $('commit-style').value = data.commit_style || 'clear';
  $('gfg-toggle').checked = Boolean(data.enable_gfg);
  if (data.codevault_hook) {
    try {
      const repository = await github(`/repos/${data.codevault_hook}`);
      $('success-copy').textContent = `${repository.full_name} is already linked to CodeVault Sync.`;
      showStep('preferences-step');
    } catch (_) {
      await chrome.storage.local.remove(['codevault_hook', 'repo']);
      showStep('repository-step');
      await loadRepositories();
    }
  } else {
    showStep('repository-step');
    await loadRepositories();
  }
}

$('link-repository').onclick = () => {
  const fullName = $('existing-repository').value;
  if (!fullName) { $('repository-message').textContent = 'Choose a repository first.'; return; }
  connectRepository({ type: 'LINK_CODEVAULT_REPOSITORY', fullName }, $('link-repository'));
};
$('create-repository').onclick = () => {
  const name = $('new-repo-name').value.trim();
  if (!name) { $('repository-message').textContent = 'Enter a repository name first.'; $('new-repo-name').focus(); return; }
  connectRepository({ type: 'CREATE_CODEVAULT_REPOSITORY', name, private: $('new-repo-private').checked }, $('create-repository'));
};
$('finish-setup').onclick = async () => {
  await chrome.storage.local.set({ default_branch: $('branch').value.trim() || 'main', commit_style: $('commit-style').value, enable_gfg: $('gfg-toggle').checked });
  showStep('success-step');
};
$('open-dashboard').onclick = () => location.href = 'dashboard.html';
initialise();
