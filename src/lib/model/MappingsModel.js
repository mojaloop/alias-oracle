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

const { v4: uuidv4 } = require('uuid');
const { OracleError } = require('@internal/error');
const { dateToISOString } = require('@internal/utils');

class MappingsModel {
  /**
   *
   * @param props {object}
   * @param props.db {Object}
   */
  constructor(props) {
    this._db = props.db;
  }

  /**
   * Retrieves all mappings
   *
   * @returns Promise
   */
  async getAllMappings() {
    const mappings = await this._db('mappings');
    return mappings.map((m) => ({
      ...m,
      createdAt: dateToISOString(m.createdAt),
    }));
  }

  /**
   * Retrieves mapping for given ID
   *
   *
   * @returns Promise
   * @param id
   */
  async getMappingById(id) {
    const [mapping] = await this._db('mappings').where('id', id);
    if (!mapping) {
      throw new OracleError(`mapping ID ${id} not found`, 404);
    }
    return {
      ...mapping,
      createdAt: dateToISOString(mapping.createdAt),
    };
  }

  /**
   * Deletes mapping for given ID
   *
   * @param id
   *
   * @returns Promise
   */
  async deleteMappingById(id) {
    const rid = await this._db('mappings').where('id', id).del();
    if (!rid) {
      throw new OracleError(`mapping ID ${id} not found`, 404);
    }
  }

  static _getExtensionData(extensionList) {
    const { extension } = extensionList;
    const identifierTypeObj = extension.find((o) => o.key === 'type');
    const identifierValueObj = extension.find((o) => o.key === 'id');
    if (!identifierTypeObj || !identifierValueObj) {
      throw new OracleError('extension should contain type and id');
    }
    return {
      identifierType: identifierTypeObj.value,
      identifierValue: identifierValueObj.value,
    };
  }

  /**
   * Create a mapping
   *
   * @param details {object} mapping details
   *
   * * @returns Promise mapping created
   */
  async createMapping(details) {
    const {
      identifierType,
      identifierValue,
    } = MappingsModel._getExtensionData(details.extensionList);
    const [id] = await this._db('mappings')
      .insert({
        alias: uuidv4(),
        fspId: details.fspId,
        identifierType,
        identifierValue,
      });
    return { id, ...details };
  }

  /**
   * Create a mapping
   *
   * @param alias
   * @param details {object} mapping details
   *
   * * @returns Promise mapping created
   */
  async createMappingByAlias(alias, details) {
    const {
      identifierType,
      identifierValue,
    } = MappingsModel._getExtensionData(details.extensionList);
    try {
      const [id] = await this._db('mappings')
        .insert({
          alias,
          fspId: details.fspId,
          identifierType,
          identifierValue,
        });
      return { id, ...details };
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new OracleError('Duplicate ALIAS:FSPID mapping found');
      }
      throw e;
    }
  }

  /**
   * Update mapping
   *
   * @param id {number} mapping id
   * @param details {object} mapping details
   *
   * * @returns Promise mapping updated
   */
  async updateMapping(id, details) {
    await this._db('mappings')
      .where('id', id)
      .update('fspId', details.fspId);
    return this.getMappingById(id);
  }
}

module.exports = MappingsModel;
