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
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

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
