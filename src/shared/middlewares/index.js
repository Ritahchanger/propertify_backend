const {  globalErrorHandler  } = require("./errors/globalErrorHandler");

const { AppError } = require("./errors/appError");

module.exports = { AppError, globalErrorHandler };