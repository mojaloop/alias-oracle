/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

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
