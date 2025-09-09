const app = require("./app");
require("dotenv").config();

const { sequelize } = require("./database-config/database-config");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
     try {
          await sequelize.authenticate();
          console.log("✅ Database connection established successfully.");
          console.log(`🌍 API is live at: http://localhost:${PORT}/api/v1/hello`);
          console.log(`📖 Swagger docs available at: http://localhost:${PORT}/api-docs`);
     } catch (error) {
          console.error("❌ Unable to connect to the database:", error);
     }
});
