/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Juan Correa - juan.correa@modusbox.com                           *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

const { OracleError } = require('@internal/error');
const { dateToISOString } = require('@internal/utils');

class ParticipantModel {
  /**
     *
     * @param props {object}
     * @param props.db {Object}
     */
  constructor(props) {
    this._db = props.db;
  }

  /**
     * Retrieves all participants
     *
     * @returns Promise participantIds[]
     */
  async getAllParticipants() {
    const rows = await this._db('participants');
    return rows.map((row) => ({
      ...row,
      createdAt: dateToISOString(row.createdAt),
    }));
  }

  async getAllParticipantsForAls() {
    const participants = await this.getAllParticipants();
    return {
      partyList: participants.map((participant) => ({
        fspId: participant.fspId,
        currency: participant.currency,
        createdAt: dateToISOString(participant.createdAt),
      })),
    };
  }

  /**
   * Retrieves participant for given ID
   *
   * @param id
   *
   * @returns Promise
   */
  async getParticipantById(id) {
    const [participant] = await this._db('participants').where('id', id);
    if (!participant) {
      throw new OracleError(`participant ID ${id} not found`, 404);
    }
    return {
      ...participant,
      createdAt: dateToISOString(participant.createdAt),
    };
  }

  /**
     * Retrieves participant for given ID
     *
     * @param id
     *
     * @returns Promise
     */
  async deleteParticipantById(id) {
    const rid = await this._db('participants')
      .where('id', id)
      .del();
    if (!rid) {
      throw new OracleError(`participant ID ${id} not found`, 404);
    }
  }

  /**
     * Create a participant
     *
     * @param fspId {string} participant
     *
     * * @returns Promise participant created
     */
  async createParticipant(fspId) {
    try {
      const [id] = await this._db('participants')
        .insert({ fspId });
      return { id, fspId };
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new OracleError('Duplicate participant found');
      }
      throw e;
    }
  }

  /**
   * Update participant
   *
   * @param id {number} participant id
   * @param fspId {object} new participant
   *
   * * @returns participant created
   */
  async updateParticipant(id, fspId) {
    try {
      await this._db('participants')
        .where('id', id)
        .update('fspId', fspId);
      return this.getParticipantById(id);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new OracleError('Duplicate participant found');
      }
      throw e;
    }
  }
}

module.exports = ParticipantModel;
