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
- James Bush - james.bush@modusbox.com
*****/

const util = require('util');

const respErrSym = Symbol('ResponseErrorDataSym');

/**
 * An HTTPResponseError class
 */
class HTTPResponseError extends Error {
  constructor(params) {
    super(params.msg);
    this[respErrSym] = params;
  }

  getData() {
    return this[respErrSym];
  }

  toString() {
    return util.inspect(this[respErrSym]);
  }

  toJSON() {
    return JSON.stringify(this[respErrSym]);
  }
}

// Strip all beginning and end forward-slashes from each of the arguments, then join all the
// stripped strings with a forward-slash between them. If the last string ended with a
// forward-slash, append that to the result.
const buildUrl = (...args) => args
  .filter((e) => e !== undefined)
  .map((s) => s.replace(/(^\/*|\/*$)/g, '')) /* This comment works around a problem with editor syntax highglighting */
  .join('/')
        + ((args[args.length - 1].slice(-1) === '/') ? '/' : '');

const throwOrJson = async (res) => {
  // TODO: will a 503 or 500 with content-length zero generate an error?
  // or a 404 for that matter?!

  if (res.headers['content-length'] === '0' || res.statusCode === 204) {
    // success but no content, return null
    return null;
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    // not a successful request
    throw new HTTPResponseError({
      msg: `Request returned non-success status code ${res.statusCode}`,
      res,
    });
  }

  return res.data;
};

module.exports = {
  HTTPResponseError,
  buildUrl,
  throwOrJson,
};
