/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2021 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha - yevhen.kyriukha@modusbox.com                   *
 **************************************************************************/

class OracleError extends Error {
  constructor(msg, httpCode) {
    super(msg);
    this._httpStatusCode = httpCode || 400;
  }

  httpBody() {
    return {
      errorInformation: {
        errorCode: '3002',
        errorDescription: this.message,
      },
    };
  }

  httpStatus() {
    return this._httpStatusCode;
  }
}

module.exports = {
  OracleError,
};
