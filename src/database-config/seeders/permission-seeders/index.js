// run-permission-seeder.js
const seedPermissions = require("./permission.seeder");

// Run with error handling
seedPermissions()
  .then(() => {
    console.log("🎊 Permission seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Permission seeding failed:", error);
    process.exit(1);
  });
