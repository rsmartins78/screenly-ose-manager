const httpStatus = require("http-status");
const { errorResponse } = require("../../lib/response");
const { validateToken } = require("../../lib/token");

module.exports = async (req, res, next) => {
  let response;
  const accept = req.headers.accept;
  const authHeader = req.headers.authorization;

  console.log(accept);

  if (accept.includes("text/html")) {

    if (!authHeader) {
      response = errorResponse(
        { errorMessage: "No token provided." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.redirect("/login");
    }

    const tokenParts = authHeader.split(" ");

    if (!tokenParts.length === 2) {
      response = errorResponse(
        { errorMessage: "The token informed is invalid." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.redirect("/login");
    }

    const [scheme, token] = tokenParts;

    if (!/^Bearer$/.test(scheme)) {
      response = errorResponse(
        { errorMessage: "The token informed is malformatted." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.redirect("/login");
    }

    const authResult = await validateToken(token);

    if (!authResult.success) {
      response = errorResponse(
        { errorMessage: "Token invalid" },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.redirect("/login");
    }

    req.userData = { ...authResult };
    return next();

  } else if (accept.includes("application/json")) {
    if (!authHeader) {
      response = errorResponse(
        { errorMessage: "No token provided." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.status(statusCode).json(data);
    }

    const tokenParts = authHeader.split(" ");

    if (!tokenParts.length === 2) {
      response = errorResponse(
        { errorMessage: "The token informed is invalid." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.status(statusCode).json(data);
    }

    const [scheme, token] = tokenParts;

    if (!/^Bearer$/.test(scheme)) {
      response = errorResponse(
        { errorMessage: "The token informed is malformatted." },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.status(statusCode).json(data);
    }

    const authResult = await validateToken(token);

    if (!authResult.success) {
      response = errorResponse(
        { errorMessage: "Token invalid" },
        httpStatus.UNAUTHORIZED
      );
      const { data, statusCode } = response;
      return res.status(statusCode).json(data);
    }

    req.userData = { ...authResult };
    return next();
  }
};
