/* GitHub device authorization: a browser extension never contains a client secret. */
const DEFAULT_GITHUB_CLIENT_ID = 'Ov23liIFNKb9if7qd5k1';
const readGitHubResponse = async response => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`GitHub returned an unexpected response (${response.status}). Confirm that Device Flow is enabled for the OAuth App.`);
  }
};
const oAuth2 = {
  async begin() {
    const { github_client_id } = await chrome.storage.local.get('github_client_id');
    const clientId = github_client_id || DEFAULT_GITHUB_CLIENT_ID;
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, scope: 'repo read:user' }),
    });
    const device = await readGitHubResponse(response);
    if (!response.ok) throw new Error(device.error_description || 'Could not start GitHub sign-in.');
    if (!device.device_code || !device.user_code || !device.verification_uri) {
      throw new Error('GitHub did not return a device code. Open your OAuth App on GitHub, enable Device Flow, save the change, then try again.');
    }
    await chrome.storage.local.set({ device_auth: device });
    // Keep the popup visible so the user can copy the verification code before switching tabs.
    await chrome.tabs.create({ url: device.verification_uri_complete || device.verification_uri, active: false });
    return device;
  },
  async poll() {
    const { github_client_id, device_auth } = await chrome.storage.local.get(['github_client_id', 'device_auth']);
    const clientId = github_client_id || DEFAULT_GITHUB_CLIENT_ID;
    if (!device_auth) return { status: 'idle' };
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, device_code: device_auth.device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }),
    });
    const result = await readGitHubResponse(response);
    if (result.access_token) {
      const userResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${result.access_token}`, Accept: 'application/vnd.github+json' } });
      if (!userResponse.ok) throw new Error('GitHub approved sign-in but the account could not be read.');
      const user = await userResponse.json();
      await chrome.storage.local.set({ codevault_token: result.access_token, codevault_username: user.login, github_profile: { login: user.login, avatar_url: user.avatar_url }, device_auth: null, sync_status: { state: 'connected', message: `Connected as @${user.login}`, at: Date.now() } });
      return { status: 'connected', user };
    }
    if (result.error === 'authorization_pending' || result.error === 'slow_down') return { status: 'pending' };
    await chrome.storage.local.remove('device_auth');
    throw new Error(result.error_description || 'GitHub sign-in expired. Please try again.');
  },
};
