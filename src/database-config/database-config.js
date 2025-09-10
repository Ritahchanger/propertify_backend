require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Debug: Check if the DATABASE_URL is loaded
console.log('Database URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Enable logging temporarily for debugging
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    pool: {
        max: 10, // Increase for serverless
        min: 0,
        acquire: 60000, // Increase timeout for serverless
        idle: 10000,
        evict: 15000, // Add eviction time
    },
    retry: {
        max: 5, // Add retry for serverless connections
        timeout: 30000,
    }
});

// Enhanced connection test with better error handling
async function testConnection() {
    let retries = 5;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✅ Successfully connected to Neon DB');
            return true;
        } catch (error) {
            retries -= 1;
            console.error(`❌ Connection failed (${retries} retries left):`, error.message);

            if (retries === 0) {
                console.error('💥 All connection attempts failed');
                throw error;
            }

            // Wait with exponential backoff
            const delay = Math.pow(2, 5 - retries) * 1000;
            console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = { sequelize, DataTypes, testConnection };