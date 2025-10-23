require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');


console.log('Database URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging:false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    pool: {
        max: 10, 
        min: 0,
        acquire: 60000, 
        idle: 10000,
        evict: 15000, 
    },
    retry: {
        max: 5, 
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
            const delay = Math.pow(2, 5 - retries) * 1000;
            console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = { sequelize, DataTypes, testConnection };