/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Juan Correa - juan.correa@modusbox.com                   *
 *                                                                        *
 **************************************************************************/

exports.up = (knex) => Promise.all([
  knex.schema.createTable('mappings', (table) => {
    table.bigIncrements('id').primary();
    table.string('alias', 128).notNullable();
    table.string('fspId', 32).notNullable();
    table.string('identifierType', 128).notNullable();
    table.string('identifierValue', 128).notNullable();
    table.datetime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.index('alias');
    table.unique(['alias', 'fspId']);
  }),
]);

exports.down = (knex) => Promise.all([
  knex.schema.dropTableIfExists('mappings'),
]);
