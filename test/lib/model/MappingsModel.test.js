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
- Juan Correa - juan.correa@modusbox.com

* CONTRIBUTORS:
- Yevhen Kyriukha - yevhen.kyriukha@modusbox.com
*****/

const initDatabase = require('@internal/database');
const MappingsModel = require('@internal/model/MappingsModel');

const configTemplate = require('./config.json');

const config = {
  ...JSON.parse(JSON.stringify(configTemplate)),
  database: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: configTemplate.database.migrations,
  },
};

describe('/MappingsModel', () => {
  describe('queryBuilder queries', () => {
    let db;
    let mappingsModel;

    beforeEach(async () => {
      db = initDatabase(config.database);
      await db.migrate.latest();

      mappingsModel = new MappingsModel({ db });
    });

    afterEach(() => {
      db.destroy();
    });

    it('inserts mapping by alias and return by id', async () => {
      const alias = '1b7c97e2-e5f7-443f-9505-c31ad7f8184e';
      const details = {
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      };

      let result = await mappingsModel.createMappingByAlias(alias, details);
      expect(result.id).toStrictEqual(1);
      expect(result.fspId).toStrictEqual('abc');
      result = await mappingsModel.getMappingById(result.id);
      expect(result.id).toBeDefined();
      expect(result.alias).toEqual(alias);
      expect(result.fspId).toEqual('abc');
      expect(result.identifierType).toEqual('MSISDN');
      expect(result.identifierValue).toEqual('123');
      expect(result.createdAt).toBeDefined();
    });

    it('inserts mapping and return by id', async () => {
      const details = {
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      };

      let result = await mappingsModel.createMapping(details);
      expect(result.id).toStrictEqual(1);
      expect(result.fspId).toStrictEqual('abc');
      result = await mappingsModel.getMappingById(result.id);
      expect(result.id).toBeDefined();
      expect(result.alias).toBeDefined();
      expect(result.fspId).toEqual('abc');
      expect(result.identifierType).toEqual('MSISDN');
      expect(result.identifierValue).toEqual('123');
      expect(result.createdAt).toBeDefined();
    });

    it('inserts duplicate fspId should create different aliases', async () => {
      const details = {
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      };

      await mappingsModel.createMapping(details);
      await mappingsModel.createMapping(details);

      const result = await mappingsModel.getAllMappings();
      expect(result[0].id).toBeDefined();
      expect(result[0].alias).toBeDefined();
      expect(result[0].fspId).toEqual('abc');
      expect(result[0].identifierType).toEqual('MSISDN');
      expect(result[0].identifierValue).toEqual('123');
      expect(result[0].createdAt).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[1].alias).toBeDefined();
      expect(result[1].fspId).toEqual('abc');
      expect(result[1].identifierType).toEqual('MSISDN');
      expect(result[1].identifierValue).toEqual('123');
      expect(result[1].createdAt).toBeDefined();

      expect(result[0].alias).not.toEqual(result[1].alias);
    });

    it('inserts mappings then returns them all', async () => {
      const details1 = {
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      };
      const details2 = {
        fspId: 'def',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '456',
            },
          ],
        },
      };

      await mappingsModel.createMapping(details1);
      await mappingsModel.createMapping(details2);

      const result = await mappingsModel.getAllMappings();
      expect(result[0].id).toBeDefined();
      expect(result[0].alias).toBeDefined();
      expect(result[0].fspId).toEqual('abc');
      expect(result[0].identifierType).toEqual('MSISDN');
      expect(result[0].identifierValue).toEqual('123');
      expect(result[0].createdAt).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[1].alias).toBeDefined();
      expect(result[1].fspId).toEqual('def');
      expect(result[1].identifierType).toEqual('MSISDN');
      expect(result[1].identifierValue).toEqual('456');
      expect(result[1].createdAt).toBeDefined();
    });

    it('update mapping', async () => {
      const details1 = {
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      };
      const details2 = {
        fspId: 'def',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '456',
            },
          ],
        },

      };

      await mappingsModel.createMapping(details1);
      const p2 = await mappingsModel.createMapping(details2);

      const details2New = {
        fspId: 'defg',
      };

      await mappingsModel.updateMapping(p2.id, details2New);

      const result = await mappingsModel.getAllMappings();

      expect(result[0].id).toBeDefined();
      expect(result[0].alias).toBeDefined();
      expect(result[0].fspId).toEqual('abc');
      expect(result[0].identifierType).toEqual('MSISDN');
      expect(result[0].identifierValue).toEqual('123');
      expect(result[0].createdAt).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[1].alias).toBeDefined();
      expect(result[1].fspId).toEqual('defg');
      expect(result[1].identifierType).toEqual('MSISDN');
      expect(result[1].identifierValue).toEqual('456');
      expect(result[1].createdAt).toBeDefined();
    });

    it('remove mapping', async () => {
      const p1 = await mappingsModel.createMapping({
        fspId: 'abc',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '123',
            },
          ],
        },
      });
      await mappingsModel.createMapping({
        fspId: 'def',
        currency: 'MMK',
        extensionList: {
          extension: [
            {
              key: 'type',
              value: 'MSISDN',
            },
            {
              key: 'id',
              value: '456',
            },
          ],
        },
      });

      await mappingsModel.deleteMappingById(p1.id);
      const result = await mappingsModel.getAllMappings();
      expect(result.length).toEqual(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].alias).toBeDefined();
      expect(result[0].fspId).toEqual('def');
      expect(result[0].identifierType).toEqual('MSISDN');
      expect(result[0].identifierValue).toEqual('456');
      expect(result[0].createdAt).toBeDefined();
    });
  });
});
