/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Contributors
--------------
This is the official list of the Mojaloop project contributors for this file.
Names of the original copyright holders (individuals or organizations)
should be listed with a '*' in the first column. People who have
contributed from an organization can be listed under the organization
that actually holds the copyright for their contributions (see the
Mojaloop Foundation for an example). Those individuals should have
their names indented and be marked with a '-'. Email address can be added
optionally within square brackets <email>.

* ORIGINAL AUTHOR:
- Yevhen Kyriukha - yevhen.kyriukha@modusbox.com
*****/

const config = require('./config');
const AlsServer = require('./AlsServer');
const AdminServer = require('./AdminServer');

/**
 * Class that creates and manages http servers that expose the scheme adapter APIs.
 */
class Server {
  constructor(conf) {
    this._conf = conf;
    this._alsServer = null;
    this._adminServer = null;
  }

  async start() {
    this._alsServer = new AlsServer(this._conf);
    this._adminServer = new AdminServer(this._conf);

    await Promise.all([
      this._startAlsServer(),
      this._startAdminServer(),
    ]);
  }

  async _startAlsServer() {
    await this._alsServer.setupApi();
    await this._alsServer.start();
  }

  async _startAdminServer() {
    await this._adminServer.setupApi();
    await this._adminServer.start();
  }

  stop() {
    return Promise.all([
      this._alsServer.stop(),
      this._adminServer.stop(),
    ]);
  }
}

if (require.main === module) {
  (async () => {
    // this module is main i.e. we were started as a server;
    // not used in unit test or "require" scenarios
    const svr = new Server(config);

    // handle SIGTERM to exit gracefully
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down APIs...');

      await svr.stop();
      process.exit(0);
    });

    svr.start().catch((err) => {
      console.log(err);
      process.exit(1);
    });
  })();
}
