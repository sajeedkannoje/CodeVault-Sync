let polling;
const $ = id => document.getElementById(id);
function show(id, visible) { $(id).hidden = !visible; }
async function render() {
  const data = await chrome.storage.local.get(['codevault_token','github_profile','codevault_hook','stats','sync_status','sync_history']);
  const connected = Boolean(data.codevault_token && data.github_profile);
  show('signed-out', !connected); show('signed-in', connected);
  if (!connected) return;
  $('username').textContent = `@${data.github_profile.login}`;
  $('avatar').src = data.github_profile.avatar_url;
  $('repo').textContent = data.codevault_hook || 'Choose a repository to begin';
  for (const key of ['solved','easy','medium','hard']) $(key).textContent = data.stats?.[key] ?? 0;
  $('sync-status').textContent = data.sync_status?.message || 'Ready to sync your next accepted solution';
}
$('settings').onclick = () => chrome.runtime.openOptionsPage();
$('setup').onclick = () => chrome.tabs.create({url:chrome.runtime.getURL('welcome.html')});
$('dashboard').onclick = () => chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')});
async function connect() {
  try { $('connect').textContent = 'Starting secure sign-in…'; $('connect').disabled = true; const response = await chrome.runtime.sendMessage({ type: 'START_GITHUB_DEVICE_AUTH' }); if (!response?.ok) throw new Error(response?.error || 'Could not start GitHub sign-in.'); const device = response.device; $('device-code').hidden = false; $('device-code-value').textContent = device.user_code; $('auth-message').textContent = 'A GitHub tab opened in the background. Copy this code, open that tab, paste it, and approve CodeVault Sync. Setup will continue even after this popup closes.'; } catch (error) { $('auth-message').textContent = error.message; $('connect').disabled = false; $('connect').textContent = 'Try GitHub connection again'; }
}
$('connect').onclick = connect;
$('copy-device-code').onclick = async () => { await navigator.clipboard.writeText($('device-code-value').textContent); $('copy-device-code').textContent = 'Copied'; setTimeout(() => $('copy-device-code').textContent = 'Copy code', 1200); };
$('save-client-id').onclick = async () => { const clientId = $('quick-client-id').value.trim(); if (!clientId) { $('auth-message').textContent = 'Paste the public Client ID from your GitHub OAuth App.'; return; } await chrome.storage.local.set({ github_client_id: clientId }); $('client-id-setup').hidden = true; connect(); };
$('disconnect').onclick = async () => { clearInterval(polling); await chrome.storage.local.remove(['codevault_token','codevault_username','github_profile','device_auth','codevault_hook','mode_type']); render(); };
render();
