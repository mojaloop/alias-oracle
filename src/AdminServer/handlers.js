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

const healthCheck = async (ctx) => {
  ctx.body = { status: 'ok' };
};

const getMappings = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  ctx.body = await mapping.getAllMappings();
};

const postMappings = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  ctx.body = await mapping.createMapping(ctx.request.body);
};

const getMappingByID = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  ctx.body = await mapping.getMappingById(ctx.params.ID);
};

const putMappingByID = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  ctx.body = await mapping.updateMapping(ctx.params.ID, ctx.request.body);
};

const deleteMappingByID = async (ctx) => {
  const mapping = new MappingsModel({
    db: ctx.state.db,
  });
  await mapping.deleteMappingById(ctx.params.ID);
  ctx.body = {};
  ctx.status = 204;
};

const getParticipants = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  ctx.body = await participant.getAllParticipants();
};

const postParticipants = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  ctx.body = await participant.createParticipant(ctx.request.body.fspId);
};

const getParticipantsByID = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  ctx.body = await participant.getParticipantById(ctx.params.ID);
};

const putParticipantsByID = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  ctx.body = await participant.updateParticipant(ctx.params.ID, ctx.request.body.fspId);
};

const deleteParticipantsByID = async (ctx) => {
  const participant = new ParticipantModel({
    db: ctx.state.db,
  });
  await participant.deleteParticipantById(ctx.params.ID);
  ctx.body = {};
  ctx.status = 204;
};

module.exports = {
  '/health': {
    get: healthCheck,
  },
  '/mappings': {
    get: getMappings,
    post: postMappings,
  },
  '/mappings/{ID}': {
    get: getMappingByID,
    put: putMappingByID,
    delete: deleteMappingByID,
  },
  '/participants': {
    get: getParticipants,
    post: postParticipants,
  },
  '/participants/{ID}': {
    get: getParticipantsByID,
    put: putParticipantsByID,
    delete: deleteParticipantsByID,
  },
};
