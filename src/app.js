const express = require("express");


const cookieParser = require("cookie-parser");


const morgan = require("morgan");


const { AppError, globalErrorHandler } = require("./shared/middlewares");


const { swaggerUi, swaggerSpec } = require("./swagger");


const authRoutes = require("./modules/auth/routes/authRoutes");


const estateRoutes = require("./modules/estates/routes/estate.routes")


const tenantRoute = require("./modules/tenants/routes/tenantRoutes")


const { authMiddleware } = require("./modules/auth/middleware/authMiddleware")


const helmet = require("helmet");


const compression = require("compression");


const app = express();



// Middleware


app.use(express.json());


app.use(helmet()); // set security headers

app.use(compression()); // gzip compression

app.use(express.urlencoded({ extended: true }));


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


app.use("/api/v1/estates", authMiddleware, estateRoutes);


app.use("/api/v1/tenant", authMiddleware, tenantRoute);


app.use('/api/v1/unit', authMiddleware, require('./modules/units/routes/unit.route'))


// Handle 404
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;
