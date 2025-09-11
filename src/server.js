const app = require("./app");
require("dotenv").config();

const { sequelize, testConnection } = require("./database-config/database-config");

const PORT = process.env.PORT || 5000;

let dbConnected = false;

async function initializeDatabase() {
     if (dbConnected) {
          console.log('📊 Using existing database connection');
          return true;
     }

     try {
          console.log('🔗 Attempting to connect to Neon DB...');
          await testConnection();
          dbConnected = true;
          console.log("✅ Database connection established successfully.");

          if (process.env.NODE_ENV === 'development') {
               try {
                    await sequelize.sync({ alter: true });
                    console.log("✅ Database synced successfully.");
               } catch (syncError) {
                    console.warn("⚠️  Database sync warning:", syncError.message);
               }
          }
          return true;
     } catch (error) {
          console.error("❌ Database connection failed:", error.message);
          return false;
     }
}

async function startServer() {
     try {
     
          
          const server = app.listen(PORT, () => {
               console.log(`🌍 API is live at: http://localhost:${PORT}/api/v1/hello`);
               console.log(`📖 Swagger docs available at: http://localhost:${PORT}/api-docs`);

               
               initializeDatabase().catch(console.error);
          });

          return server;
     } catch (error) {
          console.error("❌ Failed to start server:", error);
          process.exit(1);
     }
}



process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
     console.error('Uncaught Exception:', error);
     process.exit(1);
});

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

startServer();