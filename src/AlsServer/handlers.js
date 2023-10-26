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
