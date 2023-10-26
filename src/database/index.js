/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2021 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

const knex = require('knex');

/**
 * Add a convenience method to knex
 */
function init(config) {
  const db = knex(config);

  Object.defineProperty(db,
    'createTransaction',
    async () => new Promise((resolve) => db.transaction(resolve)));

  return db;
}

module.exports = init;
