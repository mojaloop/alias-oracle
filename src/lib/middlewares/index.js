/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2021 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

const util = require('util');
const Router = require('koa-router');
const randomPhrase = require('@internal/randomphrase');
const { oas } = require('koa-oas3');
const bodyParser = require('koa-bodyparser');
const { OracleError } = require('@internal/error');

/**
 * Log raw to console as a last resort
 * @return {Function}
 */
const createErrorHandler = () => async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof OracleError) {
      ctx.response.status = e.httpStatus();
      ctx.response.body = e.httpBody();
      return;
    }
    ctx.state.logger.push({ error: util.inspect(e, { depth: 10 }) }).log('Error');
    ctx.body = {
      errorInformation: {
        errorCode: '2001',
        errorDescription: 'Internal server error',
      },
    };
    ctx.status = 500;
    console.log(`Error caught in catchall: ${e.stack}`);
  }
};

/**
 * tag each incoming request with a unique identifier
 * @return {Function}
 */
const createRequestIdGenerator = () => async (ctx, next) => {
  ctx.request.id = randomPhrase();
  await next();
};

/**
 * Add a log context for each request, log the receipt and handling thereof
 * @param logger
 * @return {Function}
 */
const createLogger = (logger) => async (ctx, next) => {
  ctx.state.logger = logger.push({
    request: {
      id: ctx.request.id,
      path: ctx.path,
      method: ctx.method,
    },
  });
  await ctx.state.logger.push({ body: ctx.request.body }).log('Request received');
  try {
    await next();
  } catch (err) {
    await ctx.state.logger.push(err).log('Error');
    throw err;
  }
  await ctx.state.logger.log('Request processed');
};

const createBodyParser = () => bodyParser({
  onerror: (e) => {
    throw new OracleError(e.message);
  },
});

/**
 * Creates koa routes based on handler map
 * @return {Function}
 */
const createRouter = (handlerMap) => {
  const router = new Router();
  for (const [endpoint, methods] of Object.entries(handlerMap)) {
    const koaEndpoint = endpoint.replace(/{/g, ':').replace(/}/g, '');
    for (const [method, handler] of Object.entries(methods)) {
      router[method](koaEndpoint, async (ctx, next) => {
        await Promise.resolve(handler(ctx, next));
      });
    }
  }
  return router.routes();
};

/**
 * Add validation for each inbound request
 * @return {Promise} validator
 */
const createRequestValidator = async (openApiFile) => {
  let validator;
  try {
    validator = await oas({
      file: openApiFile,
      endpoint: '/openapi.json',
      uiEndpoint: '/',
      validateResponse: true,
      errorHandler: (err) => {
        if (err.meta.rawErrors && err.meta.in !== 'response-header') {
          const errorDetails = Object.entries(err.meta.rawErrors).map(([, val]) => val.error).join('; ');
          throw new OracleError(err.message + ': ' + errorDetails, err.meta.code);
        } else if (err.meta.in.startsWith('path')) {
          throw new OracleError(err.message, err.meta.code);
        } else if (err.name === 'RequestValidationError') {
          throw new OracleError(err.message);
        }
        throw err;
      },
    });
  } catch (e) {
    throw new Error('Error loading API spec. Please validate it with https://editor.swagger.io/');
  }

  return validator;
};

module.exports = {
  createErrorHandler,
  createRequestIdGenerator,
  createLogger,
  createRouter,
  createRequestValidator,
  createBodyParser,
};
