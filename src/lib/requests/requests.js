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
- Murthy Kakarlamudi - murthy@modusbox.com
*****/

const http = require('http');
const { request } = require('@mojaloop/sdk-standard-components');
const { buildUrl, throwOrJson, HTTPResponseError } = require('./common');

/**
 * A class for making requests to DFSP backend API
 */
class Requests {
  constructor(config) {
    this.logger = config.logger;

    // make sure we keep alive connections to the backend
    this.agent = new http.Agent({
      keepAlive: true,
    });

    this.transportScheme = 'http';

    // Switch or peer DFSP endpoint
    this.endpoint = `${this.transportScheme}://${config.endpoint}`;
  }

  /**
     * Utility function for building outgoing request headers as required by the mojaloop api spec
     *
     * @returns {object} - headers object for use in requests to mojaloop api endpoints
     */
  static _buildHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  get(url, qs = {}) {
    Object.entries(qs).forEach(([k, v]) => {
      if (v === undefined) {
        // eslint-disable-next-line no-param-reassign
        delete qs[k];
      }
    });
    const reqOpts = {
      method: 'GET',
      uri: buildUrl(this.endpoint, url),
      headers: Requests._buildHeaders(),
      qs,
    };

    this.logger.push({ reqOpts }).log('Executing HTTP GET');
    return request({ ...reqOpts, agent: this.agent })
      .then(throwOrJson)
      .catch((e) => {
        this.logger.push({ e }).log('Error attempting HTTP GET');
        throw e;
      });
  }

  delete(url) {
    const reqOpts = {
      method: 'DELETE',
      uri: buildUrl(this.endpoint, url),
      headers: Requests._buildHeaders(),
    };

    this.logger.push({ reqOpts }).log('Executing HTTP DELETE');
    return request({ ...reqOpts, agent: this.agent })
      .then(throwOrJson)
      .catch((e) => {
        this.logger.push({ e }).log('Error attempting HTTP DELETE');
        throw e;
      });
  }

  put(url, body) {
    const reqOpts = {
      method: 'PUT',
      uri: buildUrl(this.endpoint, url),
      headers: Requests._buildHeaders(),
      body: JSON.stringify(body),
    };

    this.logger.push({ reqOpts }).log('Executing HTTP PUT');
    return request({ ...reqOpts, agent: this.agent })
      .then(throwOrJson)
      .catch((e) => {
        this.logger.push({ e }).log('Error attempting HTTP PUT');
        throw e;
      });
  }

  post(url, body) {
    const reqOpts = {
      method: 'POST',
      uri: buildUrl(this.endpoint, url),
      headers: Requests._buildHeaders(),
      body: JSON.stringify(body),
    };

    this.logger.push({ reqOpts }).log('Executing HTTP POST');
    return request({ ...reqOpts, agent: this.agent })
      .then(throwOrJson)
      .catch((e) => {
        this.logger.push({ e }).log('Error attempting POST.');
        throw e;
      });
  }
}

module.exports = {
  Requests,
  HTTPResponseError,
};
