const httpStatus = require('http-status');

function defaultResponse(response, statusCode = httpStatus.OK) {
  return {
    data: response,
    statusCode,
  };
}

function errorResponse(errorResponseMessage, statusCode = httpStatus.BAD_REQUEST) {
  return defaultResponse(errorResponseMessage, statusCode);
}

module.exports = {
  defaultResponse,
  errorResponse,
};
