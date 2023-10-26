/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Murthy Kakarlamudi - murthy@modusbox.com                         *
 *                                                                        *
 *  CONTRIBUTORS:                                                         *
 *       James Bush - james.bush@modusbox.com                             *
 *       Juan Correa - juan.correa@modusbox.com                           *
 **************************************************************************/

const Koa = require('koa');
// const cors = require('@koa/cors');
const http = require('http');
const path = require('path');
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
    await new Promise((resolve) => this._server.listen(this._conf.inboundAdminPort, resolve));
    this._logger.log(`Serving Admin API on port ${this._conf.inboundAdminPort}`);
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
