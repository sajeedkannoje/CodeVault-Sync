let api = isChrome() ? chrome : isFirefox() ? browser : undefined;
const DEFAULT_GITHUB_CLIENT_ID = 'Ov23liIFNKb9if7qd5k1';
const DEVICE_AUTH_ALARM = 'codevault-device-auth';

async function migrateLegacyCodeVaultSettings() {
  const legacy = await api.storage.local.get(['lee' + 'thub_token', 'lee' + 'thub_username', 'lee' + 'thub_hook', 'pipe_lee' + 'thub']);
  const updates = {};
  if (legacy['lee' + 'thub_token']) updates.codevault_token = legacy['lee' + 'thub_token'];
  if (legacy['lee' + 'thub_username']) updates.codevault_username = legacy['lee' + 'thub_username'];
  if (legacy['lee' + 'thub_hook']) updates.codevault_hook = legacy['lee' + 'thub_hook'];
  if (legacy['pipe_lee' + 'thub'] !== undefined) updates.pipe_codevault = legacy['pipe_lee' + 'thub'];
  if (Object.keys(updates).length) await api.storage.local.set(updates);
}
migrateLegacyCodeVaultSettings();

// const ONE_HOUR_MS = 60 * 60 * 1000;

api.runtime.onInstalled.addListener(details => {
  api.storage.local.get('github_client_id', data => {
    if (!data.github_client_id) api.storage.local.set({ github_client_id: DEFAULT_GITHUB_CLIENT_ID });
  });
  if (details.reason === 'install') api.storage.local.set({ sync_stats: true });
});

api.runtime.onMessage.addListener(handleMessage);
api.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === DEVICE_AUTH_ALARM) pollGitHubDeviceAuth();
});

async function githubJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { throw new Error(`GitHub returned an unexpected response (${response.status}).`); }
  if (!response.ok) throw new Error(data.error_description || `GitHub request failed (${response.status}).`);
  return data;
}

async function startGitHubDeviceAuth() {
  const { github_client_id = DEFAULT_GITHUB_CLIENT_ID } = await api.storage.local.get('github_client_id');
  const device = await githubJson('https://github.com/login/device/code', { client_id: github_client_id, scope: 'repo read:user' });
  if (!device.device_code || !device.user_code || !device.verification_uri) throw new Error('GitHub did not return a device code. Confirm Device Flow is enabled for CodeVault Sync.');
  await api.storage.local.set({ device_auth: { ...device, created_at: Date.now() }, sync_status: { state: 'authorizing', message: 'Waiting for GitHub approval…', at: Date.now() } });
  await api.alarms.create(DEVICE_AUTH_ALARM, { delayInMinutes: 0.5, periodInMinutes: 0.5 });
  await api.tabs.create({ url: device.verification_uri, active: false });
  // Check promptly while the service worker is active; the alarm remains a fallback.
  setTimeout(() => pollGitHubDeviceAuth(), Math.max(device.interval || 5, 5) * 1000);
  return device;
}

async function pollGitHubDeviceAuth() {
  const { github_client_id = DEFAULT_GITHUB_CLIENT_ID, device_auth } = await api.storage.local.get(['github_client_id', 'device_auth']);
  if (!device_auth) return api.alarms.clear(DEVICE_AUTH_ALARM);
  try {
    const result = await githubJson('https://github.com/login/oauth/access_token', { client_id: github_client_id, device_code: device_auth.device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
    if (!result.access_token) {
      setTimeout(() => pollGitHubDeviceAuth(), Math.max(device_auth.interval || 5, 5) * 1000);
      return;
    }
    const userResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${result.access_token}`, Accept: 'application/vnd.github+json' } });
    if (!userResponse.ok) throw new Error('GitHub approved access but the account could not be read.');
    const user = await userResponse.json();
    await api.storage.local.set({ codevault_token: result.access_token, codevault_username: user.login, github_profile: { login: user.login, avatar_url: user.avatar_url }, device_auth: null, sync_status: { state: 'connected', message: `Connected as @${user.login}`, at: Date.now() } });
    await api.alarms.clear(DEVICE_AUTH_ALARM);
    await api.tabs.create({ url: api.runtime.getURL('welcome.html'), active: true });
  } catch (error) {
    if (error.message.includes('authorization_pending') || error.message.includes('slow_down')) return;
    await api.storage.local.set({ device_auth: null, sync_status: { state: 'failed', message: error.message, at: Date.now() } });
    await api.alarms.clear(DEVICE_AUTH_ALARM);
  }
}

function dashboardSvgLegacy(stats = {}) {
  const cards = [['Solved',stats.solved||0],['Easy',stats.easy||0],['Medium',stats.medium||0],['Hard',stats.hard||0]].map((v,i)=>`<rect x="${35+i*170}" y="125" width="145" height="80" rx="12" fill="#102033"/><text x="${50+i*170}" y="155" fill="#94a3b8" font-size="14">${v[0]}</text><text x="${50+i*170}" y="188" fill="#22d3ee" font-size="28" font-weight="700">${v[1]}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="280"><rect width="720" height="280" rx="20" fill="#07111f"/><text x="35" y="55" fill="#22d3ee" font-size="18">&lt;/&gt; CODEVAULT SYNC</text><text x="35" y="98" fill="#f8fafc" font-size="30" font-weight="700">My Coding Vault</text>${cards}<text x="35" y="245" fill="#94a3b8" font-size="13">Generated by CodeVault Sync</text></svg>`;
}
function dashboardSvgLegacy(stats = {}, theme = 'dashboard') {
  const values = [['Solved',stats.solved||0],['Easy',stats.easy||0],['Medium',stats.medium||0],['Hard',stats.hard||0]];
  if (theme === 'minimal') return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360"><rect width="820" height="360" rx="18" fill="#06130f" stroke="#166534"/><text x="40" y="55" fill="#4ade80" font-family="monospace" font-size="19">&gt; codevault-sync</text><text x="40" y="95" fill="#bbf7d0" font-family="monospace" font-size="28" font-weight="700">MY CODING VAULT</text>${values.map((v,i)=>`<text x="45" y="${155+i*40}" fill="#bbf7d0" font-family="monospace" font-size="16">${v[0].toLowerCase()}  ${v[1]}</text><rect x="220" y="${143+i*40}" width="${Math.min(350,30+Number(v[1])*12)}" height="10" fill="${['#22d3ee','#34d399','#a78bfa','#fbbf24'][i]}"/>`).join('')}<text x="40" y="330" fill="#4ade80" font-family="monospace" font-size="13">status: synced</text></svg>`;
  const light = theme === 'showcase'; const bg = light ? '#f8fafc' : '#0b1727'; const ink = light ? '#10203a' : '#f8fafc'; const card = light ? '#ffffff' : '#111f31'; const accent = light ? '#2563eb' : '#38bdf8';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360"><rect width="820" height="360" rx="20" fill="${bg}"/>${light?'<rect width="185" height="360" rx="20" fill="#eff6ff"/><text x="30" y="60" fill="#2563eb" font-size="17" font-weight="700">&lt;/&gt; CODEVAULT</text><text x="30" y="105" fill="#64748b" font-size="13">Overview</text><text x="30" y="140" fill="#64748b" font-size="13">Topics</text>':''}<text x="${light?225:38}" y="55" fill="${accent}" font-size="18" font-weight="700">CodeVault Sync</text><text x="${light?225:38}" y="98" fill="${ink}" font-size="30" font-weight="700">My Coding Vault</text>${values.map((v,i)=>`<rect x="${(light?225:38)+(i%2)*180}" y="${135+Math.floor(i/2)*92}" width="150" height="72" rx="10" fill="${card}" stroke="${accent}55"/><text x="${(light?240:53)+(i%2)*180}" y="${160+Math.floor(i/2)*92}" fill="#94a3b8" font-size="12">${v[0]}</text><text x="${(light?240:53)+(i%2)*180}" y="${190+Math.floor(i/2)*92}" fill="${accent}" font-size="25" font-weight="700">${v[1]}</text>`).join('')}<text x="${light?225:38}" y="330" fill="#94a3b8" font-size="13">Live dashboard generated by CodeVault Sync</text></svg>`;
}
async function dashboardSvg(stats = {}, theme = 'dashboard') {
  const themes = { dashboard: 'modern-dark.svg', showcase: 'clean-light.svg', developer: 'developer.svg', glass: 'glass.svg', sidebar: 'sidebar.svg', minimal: 'terminal.svg' };
  const svg = await fetch(api.runtime.getURL(`assets/readme-themes/${themes[theme] || themes.dashboard}`)).then(response => response.text());
  const solved = String(stats.solved || 0);
  return svg.replace(/>leetcode</gi, '>CodeVault Sync<').replace(/>124</g, `>${solved}<`).replace(/>98</g, `>${solved}<`).replace(/>78\.3%</g, '>Live<').replace(/>12 days</g, '>Synced<').replace(/Updated automatically by CodeVault Sync/g, `Updated · ${solved} solved · CodeVault Sync`);
}
async function applyRepoTheme() {
  const data = await api.storage.local.get(['codevault_token','codevault_hook','stats','default_branch','readme_style']);
  if (!data.codevault_token || !data.codevault_hook) throw new Error('Connect GitHub and select a repository first.');
  const headers = { Authorization: `token ${data.codevault_token}`, Accept: 'application/vnd.github.v3+json' };
  const readmeResponse = await fetch(`https://api.github.com/repos/${data.codevault_hook}/contents/README.md`, { headers });
  if (!readmeResponse.ok && readmeResponse.status !== 404) throw new Error('Could not read the linked repository README.');
  const previous = readmeResponse.ok ? await readmeResponse.json() : null;
  const old = previous ? decodeURIComponent(escape(atob(previous.content.replace(/\n/g,'')))) : '';
  const topicStart = '<!---LeetCode Topics Start-->';
  const topicEnd = '<!---LeetCode Topics End-->';
  const start = old.indexOf(topicStart);
  const end = old.indexOf(topicEnd);
  const legacyTopics = value => {
    const legacyStart = value.indexOf('# LeetCode Topics');
    return legacyStart >= 0 ? value.slice(legacyStart).trim() : '';
  };
  let topics = start >= 0 && end >= start ? old.slice(start, end + topicEnd.length) : '';
  if (!topics) {
    let legacy = legacyTopics(old);
    if (!legacy) {
      const commitsResponse = await fetch(`https://api.github.com/repos/${data.codevault_hook}/commits?path=README.md&per_page=8`, { headers });
      const commits = commitsResponse.ok ? await commitsResponse.json() : [];
      for (const commit of commits.slice(1)) {
        const historicalResponse = await fetch(`https://api.github.com/repos/${data.codevault_hook}/contents/README.md?ref=${commit.sha}`, { headers });
        if (!historicalResponse.ok) continue;
        const historical = await historicalResponse.json();
        legacy = legacyTopics(decodeURIComponent(escape(atob(String(historical.content || '').replace(/\n/g, '')))));
        if (legacy) break;
      }
    }
    topics = legacy ? `${topicStart}\n${legacy}\n${topicEnd}` : `${topicStart}\n# LeetCode Topics\n${topicEnd}`;
  }
  const readme = `<div align="center">\n\n# 🧭 CodeVault\n\n### A structured knowledge base for coding questions, solutions, and problem-solving patterns.\n\n[![Repository](https://img.shields.io/badge/GitHub-CodeVault-181717?style=flat-square&logo=github)](https://github.com/sajeedkannoje/leetcode)\n[![Practice](https://img.shields.io/badge/Practice-LeetCode-FFA116?style=flat-square&logo=leetcode&logoColor=white)](https://leetcode.com/)\n\n**Solve with intent. Understand the pattern. Keep the lesson.**\n\n</div>\n\n---\n\n## 🎯 About this repository\n\nCodeVault is a version-controlled coding journal for LeetCode questions. Each solution keeps the code, the underlying idea, and useful review notes together.\n\n## 🗂️ Topic index\n\n${topics}\n\n---\n\n## 🧠 Problem-solving workflow\n\n1. **Understand** — restate the question, constraints, and output.\n2. **Recognize** — identify the pattern and why it fits.\n3. **Solve** — write a clear solution before optimizing.\n4. **Analyze** — record time and space complexity.\n5. **Validate** — cover normal and edge cases.\n6. **Review** — keep one takeaway for later revision.\n\n## 🔄 LeetCode → CodeVault workflow\n\n\`Choose a question\` → \`Solve and test\` → \`Save the solution\` → \`Sync to GitHub\` → \`Review the pattern\`\n\n<div align="center">\n\n**Build consistency, one question at a time.**\n\n<sub>Maintained by Sajeed Kannoje · CodeVault</sub>\n\n</div>`;
  const branch = data.default_branch || 'main';
  const put = async (path, content, sha, message) => fetch(`https://api.github.com/repos/${data.codevault_hook}/contents/${path}`, { method:'PUT', headers, body: JSON.stringify({ message, content: btoa(unescape(encodeURIComponent(content))), sha, branch }) });
  const readmeResult = await put('README.md', readme.replace('<sub>Maintained by Sajeed Kannoje · CodeVault</sub>', '<sub>Made with ♥ by Sajeed Kannoje · CodeVault</sub>'), previous?.sha, 'docs: update CodeVault Sync README');
  if (!readmeResult.ok) throw new Error('GitHub could not update the README. Check the selected branch.');
}

async function createCodeVaultRepository(name, isPrivate = true) {
  const { codevault_token: token } = await api.storage.local.get('codevault_token');
  if (!token) throw new Error('Connect GitHub before creating a repository.');
  const repositoryName = String(name || '').trim();
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(repositoryName)) throw new Error('Use a repository name with letters, numbers, dots, dashes, or underscores.');
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: repositoryName,
      private: Boolean(isPrivate),
      // GitHub needs an initial branch before the Contents API can write our README.
      auto_init: true,
      description: 'Personal coding vault — accepted solutions synced with CodeVault Sync by Sajeed Kannoje.',
    }),
  });
  const repository = await response.json();
  if (!response.ok) throw new Error(repository.message || 'GitHub could not create the repository.');
  await api.storage.local.set({ codevault_hook: repository.full_name, repo: repository.html_url, default_branch: repository.default_branch || 'main' });
  await applyRepoTheme();
  return repository;
}

async function listCodeVaultRepositories() {
  const { codevault_token: token } = await api.storage.local.get('codevault_token');
  if (!token) throw new Error('Connect GitHub before choosing a repository.');
  const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
  });
  const repositories = await response.json();
  if (!response.ok) throw new Error(repositories.message || 'GitHub could not list your repositories.');
  return repositories.map(repository => ({ full_name: repository.full_name, private: repository.private, html_url: repository.html_url, default_branch: repository.default_branch || 'main' }));
}

async function linkCodeVaultRepository(fullName) {
  const { codevault_token: token } = await api.storage.local.get('codevault_token');
  if (!token) throw new Error('Connect GitHub before choosing a repository.');
  const safeName = String(fullName || '').trim();
  if (!/^[^/\s]+\/[^/\s]+$/.test(safeName)) throw new Error('Choose a repository from the list.');
  const response = await fetch(`https://api.github.com/repos/${safeName}`, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' } });
  const repository = await response.json();
  if (!response.ok) throw new Error(repository.message || 'GitHub could not open that repository.');
  await api.storage.local.set({ codevault_hook: repository.full_name, repo: repository.html_url, default_branch: repository.default_branch || 'main' });
  return repository;
}

function handleMessage(request, sender, sendResponse) {
  if (request?.type === 'START_GITHUB_DEVICE_AUTH') {
    startGitHubDeviceAuth().then(device => sendResponse({ ok: true, device })).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  else if (request?.type === 'APPLY_REPO_THEME') {
    applyRepoTheme().then(() => sendResponse({ ok: true })).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  else if (request?.type === 'CREATE_CODEVAULT_REPOSITORY') {
    createCodeVaultRepository(request.name, request.private).then(repository => sendResponse({ ok: true, repository })).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  else if (request?.type === 'LIST_CODEVAULT_REPOSITORIES') {
    listCodeVaultRepositories().then(repositories => sendResponse({ ok: true, repositories })).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  else if (request?.type === 'LINK_CODEVAULT_REPOSITORY') {
    linkCodeVaultRepository(request.fullName).then(repository => sendResponse({ ok: true, repository })).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  else if (request?.type === 'SCAN_LEETCODE_HISTORY') {
    api.tabs.query({ url: 'https://leetcode.com/*' }, tabs => {
      if (!tabs.length) return sendResponse({ ok: false, error: 'Open LeetCode in a signed-in tab, then try again.' });
      api.tabs.sendMessage(tabs[0].id, { type: 'CODEVAULT_SCAN_HISTORY' }, response => {
        if (api.runtime.lastError) return sendResponse({ ok: false, error: 'Reload the open LeetCode tab, then try again.' });
        sendResponse(response || { ok: false, error: 'LeetCode did not return submission history.' });
      });
    });
    return true;
  }
  else if (request?.type === 'IMPORT_LEETCODE_HISTORY') {
    api.tabs.query({ url: 'https://leetcode.com/*' }, tabs => {
      if (!tabs.length) return sendResponse({ ok: false, error: 'Open LeetCode in a signed-in tab, then try again.' });
      api.tabs.sendMessage(tabs[0].id, { type: 'CODEVAULT_IMPORT_HISTORY', submissionIds: request.submissionIds || [], progressOffset: request.progressOffset || 0, total: request.total || 0 }, response => {
        if (api.runtime.lastError) return sendResponse({ ok: false, error: 'Reload the open LeetCode tab, then try again.' });
        sendResponse(response || { ok: false, error: 'LeetCode did not return an import result.' });
      });
    });
    return true;
  }
  else if (request?.type === 'HISTORY_IMPORT_PROGRESS') {
    api.storage.local.set({ history_import_progress: { ...request.progress, state: 'running' } });
    sendResponse({ ok: true });
  }
  else if (request && request.closeWebPage === true && request.isSuccess === true)
  {
    api.storage.local.set({ codevault_username: request.username });
    api.storage.local.set({ codevault_token: request.token });
    api.storage.local.set({ pipe_codevault: false }, () => {
      console.log('Closed pipe.');
    });

    api.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      var tab = tabs[0];
      api.tabs.remove(tab.id);
    });

    /* Go to onboarding UX */
    const urlOnboarding = api.runtime.getURL('welcome.html');
    api.tabs.create({ url: urlOnboarding, active: true }); // creates new tab
  } 
  else if (request && request.closeWebPage === true && request.isSuccess === false)
  {
    alert('Something went wrong while trying to authenticate your profile!');
    api.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      var tab = tabs[0];
      api.tabs.remove(tab.id);
    });
  } 
  else if (request?.type === 'LEETCODE_SUBMISSION') {
    const currentMatch = sender?.tab?.url?.match(/\/submissions\/(\d+)/);
    if (currentMatch) {
      sendResponse({ submissionId: currentMatch[1] });
      return false;
    }
    let replied = false;
    const reply = payload => {
      if (replied) return;
      replied = true;
      api.webNavigation.onHistoryStateUpdated.removeListener(onSubmissionUrl);
      sendResponse(payload);
    };
    const onSubmissionUrl = details => {
      const match = details.url.match(/\/submissions\/(\d+)/);
      if (match) reply({ submissionId: match[1] });
    };
    api.webNavigation.onHistoryStateUpdated.addListener(onSubmissionUrl, { url: [{ hostSuffix: 'leetcode.com', pathContains: 'submissions' }] });
    setTimeout(() => reply({ submissionId: null }), 15000);
    return true;
  }
  return false;
}

function isChrome() {
  return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined';
}

function isFirefox() {
  return typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined';
}
