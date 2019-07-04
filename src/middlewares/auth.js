const httpStatus = require("http-status");
const { errorResponse } = require("../../lib/response");
const { validateToken } = require("../../lib/token");

module.exports = async (req, res, next) => {
  let response;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    response = errorResponse(
      { success: false, errorMessage: "No token provided." },
      httpStatus.UNAUTHORIZED
    );
    const { data, statusCode } = response;
    return res.status(statusCode).json(data);
  }

  const tokenParts = authHeader.split(" ");

  if (!tokenParts.length === 2) {
    response = errorResponse(
      { success: false, errorMessage: "The token informed is invalid." },
      httpStatus.UNAUTHORIZED
    );
    const { data, statusCode } = response;
    return res.status(statusCode).json(data);
  }

  const [scheme, token] = tokenParts;

  if (!/^Bearer$/.test(scheme)) {
    response = errorResponse(
      { success: false, errorMessage: "The token informed is malformatted." },
      httpStatus.UNAUTHORIZED
    );
    const { data, statusCode } = response;
    return res.status(statusCode).json(data);
  }

  const authResult = await validateToken(token);

  if (!authResult.success) {
    response = errorResponse(
      { success: false, errorMessage: "Token invalid" },
      httpStatus.UNAUTHORIZED
    );
    const { data, statusCode } = response;
    return res.status(statusCode).json(data);
  }

  req.userData = { ...authResult };
  return next();
};
