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

const initDatabase = require('@internal/database');
const ParticipantModel = require('@internal/model/ParticipantModel');

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

describe('/ParticipantModel', () => {
  describe('queryBuilder queries', () => {
    let db;
    let participantModel;

    beforeEach(async () => {
      db = initDatabase(config.database);
      await db.migrate.latest();

      participantModel = new ParticipantModel({ db });
    });

    afterEach(() => {
      db.destroy();
    });

    it('inserts participant', async () => {
      const result = await participantModel.createParticipant('payerfsp');

      expect(result).toStrictEqual({
        id: 1,
        fspId: 'payerfsp',
      });
    });

    it('inserts duplicate participant throws UNIQUE constraint failed: participants.fspId', async () => {
      await participantModel.createParticipant('payerfsp');
      await expect(participantModel.createParticipant('payerfsp')).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: participants.fspId/);
    });

    it('inserts participant then retrieves it by ID', async () => {
      const participant = await participantModel.createParticipant('payerfsp');

      const result = await participantModel.getParticipantById(participant.id);

      expect(result.fspId).toEqual('payerfsp');
    });

    it('inserts participant without currency then retrieves it by ID', async () => {
      const participant = await participantModel.createParticipant('payerfsp');

      const result = await participantModel.getParticipantById(participant.id);

      expect(result.fspId).toEqual('payerfsp');
      expect(result.currency).toEqual(config.currency);
    });

    it('inserts participants then returns them all', async () => {
      await participantModel.createParticipant('payerfsp');
      await participantModel.createParticipant('payeefsp');

      const result = await participantModel.getAllParticipantsForAls();

      expect(result.partyList[0].fspId).toEqual('payerfsp');
      expect(result.partyList[1].fspId).toEqual('payeefsp');
    });

    it('update participant', async () => {
      await participantModel.createParticipant('payerfsp');
      const p2 = await participantModel.createParticipant('payeefsp');

      await participantModel.updateParticipant(p2.id, 'otherfsp');

      const result = await participantModel.getAllParticipantsForAls();

      expect(result.partyList[0].fspId).toEqual('payerfsp');
      expect(result.partyList[1].fspId).toEqual('otherfsp');
    });

    it('remove participant', async () => {
      const p1 = await participantModel.createParticipant('payerfsp');
      await participantModel.createParticipant('payeefsp');
      await participantModel.deleteParticipantById(p1.id);
      const result = await participantModel.getAllParticipantsForAls();
      expect(result.partyList[0].fspId).toEqual('payeefsp');
    });
  });
});
