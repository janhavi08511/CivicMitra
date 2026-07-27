import test from 'node:test';
import assert from 'node:assert/strict';

import { createServer } from 'node:http';

function getPortFromServer(server: ReturnType<typeof createServer>): number {
  const address = server.address();
  if (typeof address === 'object' && address) {
    return address.port;
  }
  return 0;
}

test('server can report a bound port', () => {
  const server = createServer();
  server.listen(0, '127.0.0.1', () => {
    const port = getPortFromServer(server);
    assert.ok(port > 0);
    server.close();
  });
});
