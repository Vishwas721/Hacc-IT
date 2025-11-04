const { Sequelize } = require('sequelize');
const ReportModel = require('./models/Report');
const UserModel = require('./models/User');

let sequelize;

// --- ADD THESE LINES TO DEBUG ---
console.log('--- STARTING DB CONNECTION ---');
console.log('DATABASE_URL variable:', process.env.DATABASE_URL);
// We also log a local var to see if .env file is being read at all
console.log('Local DB_NAME variable:', process.env.DB_NAME);
console.log('-------------------------------');
// --- END DEBUG LINES ---

// Check if we have a DATABASE_URL (production/Render) or individual credentials (local)
if (process.env.DATABASE_URL) {
    console.log('--- Using DATABASE_URL for Render connection (internal). ---');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false, // optional
        dialectOptions: {} // ❌ no SSL for internal network
    });

} else {
    // Local environment
    console.log('--- No DATABASE_URL found. Using local config. ---');
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
        }
    );
}

const Report = ReportModel(sequelize);
const User = UserModel(sequelize);

User.hasMany(Report);
Report.belongsTo(User);

const connectAndSync = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB connection established.');
        await sequelize.sync({ alter: true });
        console.log('✅ Models synchronized.');
    } catch (error) {
        // Log the *full* error to see the details
        console.error('❌ DB connection/sync error:', error);
    }
};

module.exports = {
    sequelize,
    Report,
    User,
    connectAndSync,
};