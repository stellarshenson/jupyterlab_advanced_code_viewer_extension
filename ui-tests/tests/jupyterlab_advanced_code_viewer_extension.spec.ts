import { expect, test } from '@jupyterlab/galata';

const NAMESPACE = 'jupyterlab-advanced-code-viewer-extension';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  expect(
    logs.filter(
      s =>
        s ===
        'JupyterLab extension @stellarshenson/jupyterlab-advanced-code-viewer-extension is activated!'
    )
  ).toHaveLength(1);
});

test('should load the settings of the plugin', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  // The plugin logs its composite settings once they are loaded; a schema the
  // setting registry rejects logs the failure instead.
  expect(
    logs.filter(s =>
      s.startsWith('jupyterlab_advanced_code_viewer_extension settings loaded:')
    )
  ).toHaveLength(1);
  expect(
    logs.filter(s =>
      s.startsWith(
        'Failed to load settings for jupyterlab_advanced_code_viewer_extension.'
      )
    )
  ).toHaveLength(0);
});

test('the server extension answers the hello route', async ({
  page,
  baseURL
}) => {
  // The route exists only where the Python package is installed and its
  // server extension is enabled; a frontend-only install answers 404 here.
  const response = await page.request.get(`${baseURL}/${NAMESPACE}/hello`);
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.data).toContain(`/${NAMESPACE}/hello`);
});
