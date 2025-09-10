const app = require("./app");
require("dotenv").config();

const { sequelize, testConnection } = require("./database-config/database-config");

const PORT = process.env.PORT || 5000;

async function startServer() {
     try {
          console.log('🔗 Attempting to connect to Neon DB...');

          // Test connection with retry logic
          await testConnection();

          console.log("✅ Database connection established successfully.");

          // For Neon DB, be careful with sync - use migrations instead
          if (process.env.NODE_ENV === 'development') {
               try {
                    await sequelize.sync({ alter: true });
                    console.log("✅ Database synced successfully.");
               } catch (syncError) {
                    console.warn("⚠️  Database sync warning:", syncError.message);
                    // Continue even if sync fails
               }
          }

          app.listen(PORT, () => {
               console.log(`🌍 API is live at: http://localhost:${PORT}/api/v1/hello`);
               console.log(`📖 Swagger docs available at: http://localhost:${PORT}/api-docs`);
          });

     } catch (error) {
          console.error("❌ Failed to start server:", error);
          process.exit(1);
     }
}

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
     console.error('Uncaught Exception:', error);
     process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
     console.log('🛑 Shutting down gracefully...');
     try {
          await sequelize.close();
          console.log('✅ Database connection closed.');
          process.exit(0);
     } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
     }
});

// Start the server
startServer();