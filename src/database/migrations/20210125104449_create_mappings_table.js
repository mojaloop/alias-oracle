/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*****/

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
