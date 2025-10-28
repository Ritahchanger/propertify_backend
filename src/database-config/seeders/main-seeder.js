const { sequelize  } = require('../index')



const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    if (force) {
      await sequelize.sync({ force: true }); // Drops & recreates all tables
      console.log("🗑️ Tables dropped and recreated successfully.");
    } else {
      await sequelize.sync({ alter: true }); // Updates without dropping
      console.log("🔄 Tables synchronized successfully.");
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Database connection closed.");
  }
};

// Export sync function for programmatic usage
module.exports.syncDatabase = syncDatabase;

// Run directly if executed with `node seeder.js`
if (require.main === module) {
  const force = process.argv.includes("--force"); // optional flag
  syncDatabase(force);
}
