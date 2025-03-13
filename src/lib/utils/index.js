/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*****/

const util = require('util');

/**
 * @function getStackOrInspect
 * @description Gets the error stack, or uses util.inspect to inspect the error
 * @param {*} err - An error object
 */
function getStackOrInspect(err) {
  return err.stack || util.inspect(err);
}

function dateToISOString(date) {
  return (typeof date === 'string') ? date : date.toISOString();
}

module.exports = {
  getStackOrInspect,
  dateToISOString,
};
