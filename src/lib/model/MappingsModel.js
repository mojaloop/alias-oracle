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
