// middleware/globalErrorHandler.js
const { AppError } = require("./appError");

// Handle Sequelize specific errors
const handleSequelizeValidationError = (err) => {
  const message = err.errors.map(e => e.message).join(", ");
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const message = "Duplicate field value entered";
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => new AppError("Invalid token, please log in again.", 401);
const handleJWTExpiredError = () => new AppError("Your token has expired, please log in again.", 401);

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "SequelizeValidationError") error = handleSequelizeValidationError(err);
    if (err.name === "SequelizeUniqueConstraintError") error = handleSequelizeUniqueConstraintError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    // Programming or unknown errors
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports =  { globalErrorHandler };
