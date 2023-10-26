/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 *                                                                        *
 **************************************************************************/

const config = require('../../config');

exports.up = (knex) => Promise.all([
  knex.schema.createTable('participants', (table) => {
    table.bigIncrements('id').primary();
    table.string('fspId', 32).notNullable().unique();
    table.string('currency', 3).notNullable().defaultTo(config.currency);
    table.datetime('createdAt').notNullable().defaultTo(knex.fn.now());
  }),
]);

exports.down = (knex) => Promise.all([
  knex.schema.dropTableIfExists('participant'),
]);
