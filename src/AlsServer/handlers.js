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

const {
  MappingsModel,
  ParticipantModel,
} = require('@internal/model');

const { OracleError } = require('@internal/error');

const healthCheck = async (ctx) => {
  ctx.body = { status: 'ok' };
};

/**
 * Retrieve DFSP IDs by provided participant details
 * @param {*} ctx
 */
const getParticipantsByTypeAndID = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  const { Type } = ctx.params;
  switch (Type) {
    case 'MSISDN':
      ctx.body = await participant.getAllParticipantsForAls();
      break;
    case 'ALIAS':
      throw new OracleError(`Not Implemented Type ${Type}`);
    default:
      throw new OracleError(`Unknown Type ${Type}`);
  }
};

/**
 * Create an alias for provided participant details
 * @param {*} ctx
 */
const postParticipantsByTypeAndID = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  const { Type, ID } = ctx.params;
  switch (Type) {
    case 'ALIAS':
      ctx.body = await mapping.createMappingByAlias(ID, ctx.request.body);
      break;
    default:
      throw new OracleError(`Unsupported Type ${Type}`);
  }
};

module.exports = {
  '/health': {
    get: healthCheck,
  },
  '/participants/{Type}/{ID}': {
    get: getParticipantsByTypeAndID,
    post: postParticipantsByTypeAndID,
  },
};
