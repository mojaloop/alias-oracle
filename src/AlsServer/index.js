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

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
*****/

const Koa = require('koa');

const path = require('path');

// const cors = require('@koa/cors');

const http = require('http');

const { Logger, Transports } = require('@internal/log');
const initDatabase = require('@internal/database');
const middlewares = require('@internal/middlewares');

const handlers = require('./handlers');

class Server {
  constructor(conf) {
    this._conf = conf;
    this._api = null;
    this._server = null;
    this._logger = null;
  }

  async setupApi() {
    this._api = new Koa();
    this._logger = await this._createLogger();

    const validator = await middlewares.createRequestValidator(path.join(__dirname, 'api.yaml'));

    const db = initDatabase(this._conf.database);

    this._api.use(async (ctx, next) => {
      ctx.state = {
        conf: this._conf,
        db,
      };
      await next();
    });
    // this._api.use(cors());
    this._api.use(middlewares.createErrorHandler());
    this._api.use(middlewares.createRequestIdGenerator());
    this._api.use(middlewares.createLogger(this._logger));
    this._api.use(middlewares.createBodyParser());
    this._api.use(validator);
    this._api.use(middlewares.createRouter(handlers));

    this._server = this._createServer();
    return this._server;
  }

  async start() {
    await new Promise((resolve) => this._server.listen(this._conf.inboundAlsPort, resolve));
    this._logger.log(`Serving API on port ${this._conf.inboundAlsPort}`);
  }

  async stop() {
    if (!this._server) {
      return;
    }
    await new Promise((resolve) => this._server.close(resolve));
    console.log('inbound shut down complete');
  }

  async _createLogger() {
    const transports = await Promise.all([Transports.consoleDir()]);
    // Set up a logger for each running server
    return new Logger({
      context: {
        app: 'alias-oracle',
      },
      space: this._conf.logIndent,
      transports,
    });
  }

  _createServer() {
    return http.createServer(this._api.callback());
  }
}

module.exports = Server;
