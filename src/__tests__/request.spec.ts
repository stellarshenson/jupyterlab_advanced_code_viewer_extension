/**
 * Unit tests for the call to the server extension.
 *
 * `ServerConnection.makeRequest` is replaced for each test, so the tests run
 * without a server and read exactly what `requestAPI` would send and return.
 */
import { ServerConnection } from '@jupyterlab/services';

import { requestAPI } from '../request';

const settings = ServerConnection.makeSettings({
  baseUrl: 'http://localhost:8888/'
});

function answer(body: string, status = 200): void {
  jest
    .spyOn(ServerConnection, 'makeRequest')
    .mockResolvedValue(new Response(body, { status }));
}

describe('requestAPI', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls the endpoint under the extension namespace', async () => {
    answer('{}');
    await requestAPI('hello', settings);
    const [url] = (ServerConnection.makeRequest as jest.Mock).mock.calls[0];
    expect(url).toBe(
      'http://localhost:8888/jupyterlab-advanced-code-viewer-extension/hello'
    );
  });

  it('passes the request init through', async () => {
    answer('{}');
    await requestAPI('hello', settings, { method: 'POST', body: '{"a":1}' });
    const [, init] = (ServerConnection.makeRequest as jest.Mock).mock.calls[0];
    expect(init).toEqual({ method: 'POST', body: '{"a":1}' });
  });

  it('returns the JSON body parsed', async () => {
    answer('{"data": "Hello, world!"}');
    await expect(requestAPI('hello', settings)).resolves.toEqual({
      data: 'Hello, world!'
    });
  });

  it('returns a body that is not JSON as text', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    answer('plain text');
    await expect(requestAPI('hello', settings)).resolves.toBe('plain text');
  });

  it('rejects with a ResponseError on a failed response', async () => {
    answer('{"message": "no such route"}', 404);
    await expect(requestAPI('missing', settings)).rejects.toBeInstanceOf(
      ServerConnection.ResponseError
    );
  });

  it('rejects with a NetworkError when the request itself fails', async () => {
    jest
      .spyOn(ServerConnection, 'makeRequest')
      .mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(requestAPI('hello', settings)).rejects.toBeInstanceOf(
      ServerConnection.NetworkError
    );
  });
});
