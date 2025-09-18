// src/shared/middlewares/logger.js
module.exports = (req, res, next) => {
    const ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        null;

    const userAgent = req.headers['user-agent'] || "unknown";

    // Attach to request so controllers can use it
    req.clientInfo = {
        ip: ipAddress,
        userAgent,
    };

    // Log to console in dev
    if (process.env.NODE_ENV !== "production") {
        console.log(`📌 Request from IP: ${ipAddress}, User-Agent: ${userAgent}`);
    }

    next();
};
