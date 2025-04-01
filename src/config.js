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

* ORIGINAL AUTHOR:
- Murthy Kakarlamudi - murthy@modusbox.com

* CONTRIBUTORS:
- Juan Correa - juan.correa@modusbox.com
- Yevhen Kyriukha - yevhen.kyriukha@modusbox.com
*****/

const path = require('path');
require('dotenv/config');
const env = require('env-var');

module.exports = {
  currency: env.get('CURRENCY').default('MMK').asString(),
  inboundAlsPort: env.get('LISTEN_ALS_PORT').default('3000').asPortNumber(),
  inboundAdminPort: env.get('LISTEN_ADMIN_PORT').default('3001').asPortNumber(),
  logIndent: env.get('LOG_INDENT').default('2').asIntPositive(),
  database: {
    client: env.get('DATABASE_CLIENT').default('mysql').asString(),
    version: env.get('DATABASE_VERSION').default('5.7.0').asString(),
    connection: {
      host: env.get('DATABASE_CONNECTION_HOST').default('localhost').asString(),
      port: env.get('DATABASE_CONNECTION_PORT').default('3306').asPortNumber(),
      user: env.get('DATABASE_CONNECTION_USER').default('root').asString(),
      password: env.get('DATABASE_CONNECTION_PASSWORD').default('test').asString(),
      database: env.get('DATABASE_CONNECTION_DATABASE').default('test').asString(),
      charset: env.get('DATABASE_CONNECTION_CHARSET').default('utf8mb4').asString(),
      collation: env.get('DATABASE_CONNECTION_COLLATION').default('utf8mb4_unicode_ci').asString(),
    },
    pool: {
      min: env.get('DATABASE_POOL_MIN').default('0').asInt(),
      max: env.get('DATABASE_POOL_MAX').default('10').asInt(),
    },
    migrations: {
      tableName: env.get('DATABASE_MIGRATIONS_TABLE_NAME').default('knex_migrations').asString(),
      directory: path.join(__dirname, './database/migrations'),
    },
    asyncStackTraces: env.get('DATABASE_ASYNC_STACK_TRACES').default('true').asBool(),
  },
  migrate: env.get('DATABASE_MIGRATE').default('false').asBool(),
  cacheTtlSeconds: env.get('CACHE_TTL_SECONDS').default('60').asInt(),
};
