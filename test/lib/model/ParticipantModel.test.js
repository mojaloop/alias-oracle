/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Juan Correa - juan.correa@modusbox.com                           **
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

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
