const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { AppError, globalErrorHandler } = require("./shared/middlewares");
const { swaggerUi, swaggerSpec } = require("./swagger");

const authRoutes = require("./modules/auth/routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

app.use(cookieParser()); // so refreshToken/accessToken cookies can be read
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // request logging in dev
}




// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Health check / hello endpoint
app.get("/api/v1/hello", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});


// Routes
app.use("/api/v1/auth", authRoutes);


// Handle 404
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;
